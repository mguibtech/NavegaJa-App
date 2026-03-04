package com.navegajaapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.LocationManager
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.atomic.AtomicInteger

/**
 * Foreground Service que detecta Volume ↓ 3× em 2 segundos e aciona SOS.
 * Funciona em background e mesmo com app completamente fechado.
 * Quando ativo, o app React Native mostra uma notificação persistente discreta.
 */
class SosVolumeService : Service() {

    companion object {
        private const val TAG = "SosVolumeService"
        const val FOREGROUND_NOTIF_ID = 9901
        private const val RESULT_NOTIF_ID = 9902
        private const val CHANNEL_SERVICE = "sos_service"
        private const val PREFS_NAME = "SosVolumePrefs"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_BASE_URL = "base_url"
        private const val REQUIRED_PRESSES = 3
        private const val WINDOW_MS = 2000L

        /** Referência ao ReactContext para emitir eventos quando o JS está ativo */
        @Volatile
        var reactContext: ReactContext? = null
    }

    private val handler = Handler(Looper.getMainLooper())
    private val pressCount = AtomicInteger(0)
    private var prevVolume = -1
    private var isRestoring = false
    private var resetRunnable: Runnable? = null

    private val volumeReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action != "android.media.VOLUME_CHANGED_ACTION") return
            val streamType = intent.getIntExtra("android.media.EXTRA_VOLUME_STREAM_TYPE", -1)
            if (streamType != AudioManager.STREAM_MUSIC) return
            if (isRestoring) return

            val am = getSystemService(AUDIO_SERVICE) as AudioManager
            val current = am.getStreamVolume(AudioManager.STREAM_MUSIC)

            if (prevVolume >= 0 && current < prevVolume) {
                // Volume DOWN detectado — restaura para não alterar o volume real
                val saved = prevVolume
                isRestoring = true
                handler.post {
                    am.setStreamVolume(AudioManager.STREAM_MUSIC, saved, 0)
                    isRestoring = false
                }

                val count = pressCount.incrementAndGet()
                val remaining = REQUIRED_PRESSES - count

                resetRunnable?.let { handler.removeCallbacks(it) }

                if (count >= REQUIRED_PRESSES) {
                    pressCount.set(0)
                    Log.d(TAG, "SOS trigger — $REQUIRED_PRESSES presses detected")
                    triggerSos()
                } else {
                    Log.d(TAG, "SOS press $count/$REQUIRED_PRESSES — $remaining remaining")
                    updateNotificationHint(remaining)
                    resetRunnable = Runnable {
                        pressCount.set(0)
                        updateNotificationIdle()
                    }.also { handler.postDelayed(it, WINDOW_MS) }
                }
            } else if (current > prevVolume) {
                // Volume UP — actualiza referência
                prevVolume = current
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        createServiceChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(FOREGROUND_NOTIF_ID, buildIdleNotification())

        val am = getSystemService(AUDIO_SERVICE) as AudioManager
        prevVolume = am.getStreamVolume(AudioManager.STREAM_MUSIC)

        try {
            registerReceiver(volumeReceiver, IntentFilter("android.media.VOLUME_CHANGED_ACTION"))
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register receiver", e)
        }

        Log.d(TAG, "SosVolumeService started")
        return START_STICKY
    }

    override fun onDestroy() {
        try {
            unregisterReceiver(volumeReceiver)
        } catch (_: Exception) {}
        resetRunnable?.let { handler.removeCallbacks(it) }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        Log.d(TAG, "SosVolumeService stopped")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── SOS Logic ──────────────────────────────────────────────────────────────

    private fun triggerSos() {
        Thread {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val token = prefs.getString(KEY_TOKEN, null)
            val baseUrl = prefs.getString(KEY_BASE_URL, null)

            if (token.isNullOrEmpty() || baseUrl.isNullOrEmpty()) {
                showResultNotification(
                    success = false,
                    msg = "Sessão expirada. Abra o app e faça login.",
                )
                return@Thread
            }

            val location = getLastKnownLocation()
            val bodyJson = JSONObject().apply {
                put("type", "general")
                put("description", "SOS acionado por botão físico (volume)")
                put("location", JSONObject().apply {
                    put("latitude", location.first)
                    put("longitude", location.second)
                    put("accuracy", 50.0)
                })
            }.toString()

            val client = OkHttpClient()
            val request = Request.Builder()
                .url("$baseUrl/safety/sos")
                .post(bodyJson.toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    showResultNotification(
                        success = true,
                        msg = "A equipa NavegaJá e os seus contactos foram notificados.",
                    )
                    emitToReactNative("SosTriggerFromBackground", null)
                } else {
                    showResultNotification(
                        success = false,
                        msg = "Erro ${response.code} ao enviar SOS. Ligue 190.",
                    )
                }
            } catch (e: IOException) {
                Log.e(TAG, "HTTP error", e)
                showResultNotification(
                    success = false,
                    msg = "Sem ligação à internet. Ligue 190.",
                )
            }
        }.start()
    }

    private fun getLastKnownLocation(): Pair<Double, Double> {
        return try {
            val lm = getSystemService(LOCATION_SERVICE) as LocationManager
            val loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                ?: lm.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)
            if (loc != null) Pair(loc.latitude, loc.longitude) else Pair(0.0, 0.0)
        } catch (_: SecurityException) {
            Pair(0.0, 0.0)
        } catch (_: Exception) {
            Pair(0.0, 0.0)
        }
    }

    private fun emitToReactNative(event: String, data: String?) {
        try {
            reactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(event, data)
        } catch (_: Exception) {
            // JS thread may not be running (app fully closed) — silently ignore
        }
    }

    // ── Notifications ───────────────────────────────────────────────────────────

    private fun createServiceChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(NotificationManager::class.java)
            if (nm?.getNotificationChannel(CHANNEL_SERVICE) == null) {
                NotificationChannel(
                    CHANNEL_SERVICE,
                    "NavegaJá SOS — Botão Físico",
                    NotificationManager.IMPORTANCE_MIN,
                ).apply {
                    description = "Serviço de emergência SOS por botão de volume"
                    setShowBadge(false)
                    enableVibration(false)
                    enableLights(false)
                }.also { nm?.createNotificationChannel(it) }
            }
        }
    }

    private fun launchIntent(): PendingIntent = PendingIntent.getActivity(
        this, 0,
        packageManager.getLaunchIntentForPackage(packageName),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    private fun buildIdleNotification(): Notification =
        NotificationCompat.Builder(this, CHANNEL_SERVICE)
            .setContentTitle("NavegaJá SOS")
            .setContentText("Prima volume ↓ 3× para emergência")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .setSilent(true)
            .setContentIntent(launchIntent())
            .build()

    private fun updateNotificationIdle() {
        getSystemService(NotificationManager::class.java)
            ?.notify(FOREGROUND_NOTIF_ID, buildIdleNotification())
    }

    private fun updateNotificationHint(remaining: Int) {
        val unit = if (remaining == 1) "vez" else "vezes"
        val notif = NotificationCompat.Builder(this, CHANNEL_SERVICE)
            .setContentTitle("🆘 SOS — Prima mais $remaining $unit")
            .setContentText("Volume ↓ — continue a premir rapidamente")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .setContentIntent(launchIntent())
            .build()
        getSystemService(NotificationManager::class.java)
            ?.notify(FOREGROUND_NOTIF_ID, notif)
    }

    private fun showResultNotification(success: Boolean, msg: String) {
        val notif = NotificationCompat.Builder(this, "default")
            .setContentTitle(if (success) "🆘 SOS Enviado!" else "⚠️ Erro no SOS")
            .setContentText(msg)
            .setStyle(NotificationCompat.BigTextStyle().bigText(msg))
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(
                if (success) NotificationCompat.PRIORITY_HIGH
                else NotificationCompat.PRIORITY_MAX,
            )
            .setAutoCancel(true)
            .setContentIntent(launchIntent())
            .build()
        getSystemService(NotificationManager::class.java)?.notify(RESULT_NOTIF_ID, notif)
        handler.post { updateNotificationIdle() }
    }
}
