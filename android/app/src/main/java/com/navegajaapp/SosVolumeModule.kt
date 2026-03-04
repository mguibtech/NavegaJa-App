package com.navegajaapp

import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Native Module exposto ao React Native para:
 *  - saveCredentials(token, baseUrl) — guarda token JWT + URL em SharedPreferences
 *  - startService()                  — inicia o SosVolumeService (Foreground)
 *  - stopService()                   — para o SosVolumeService
 */
class SosVolumeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "SosVolumeModule"
        private const val PREFS_NAME = "SosVolumePrefs"
    }

    override fun getName() = NAME

    /** Persiste o token JWT e a URL base para o Foreground Service usar quando o JS está morto. */
    @ReactMethod
    fun saveCredentials(token: String, baseUrl: String) {
        reactContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString("auth_token", token)
            .putString("base_url", baseUrl)
            .apply()
        // Disponibiliza contexto React para emissão de eventos enquanto o JS correr
        SosVolumeService.reactContext = reactContext
    }

    /** Inicia o Foreground Service de SOS. Seguro em Android 8+ via startForegroundService. */
    @ReactMethod
    fun startService() {
        SosVolumeService.reactContext = reactContext
        val intent = Intent(reactContext, SosVolumeService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    /** Para o Foreground Service. Chamado quando o app volta ao foreground. */
    @ReactMethod
    fun stopService() {
        reactContext.stopService(Intent(reactContext, SosVolumeService::class.java))
    }

    /** Remove as credenciais guardadas (chamado no logout). */
    @ReactMethod
    fun clearCredentials() {
        reactContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
    }

    // Necessário para NativeEventEmitter do lado JS
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
