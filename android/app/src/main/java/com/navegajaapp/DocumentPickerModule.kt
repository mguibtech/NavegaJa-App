package com.navegajaapp

import android.app.Activity
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File

@ReactModule(name = DocumentPickerModule.NAME)
class DocumentPickerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "RNDocumentPicker"
        private const val REQUEST_CODE = 41712
    }

    private var pickPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun pick(options: ReadableMap, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "Activity not found")
            return
        }

        pickPromise = promise

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            if (options.hasKey("type") && !options.isNull("type")) {
                val types = options.getArray("type")
                if (types != null && types.size() > 0) {
                    if (types.size() == 1) {
                        type = types.getString(0)
                    } else {
                        type = "*/*"
                        val typesArray = Array(types.size()) { i -> types.getString(i) }
                        putExtra(Intent.EXTRA_MIME_TYPES, typesArray)
                    }
                } else {
                    type = "*/*"
                }
            } else {
                type = "*/*"
            }
        }

        try {
            activity.startActivityForResult(intent, REQUEST_CODE)
        } catch (e: Exception) {
            pickPromise = null
            promise.reject("E_PICKER_ERROR", e.message)
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode != REQUEST_CODE) return

        val promise = pickPromise ?: return
        pickPromise = null

        if (resultCode == Activity.RESULT_CANCELED) {
            promise.reject("DOCUMENT_PICKER_CANCELED", "User cancelled the document picker")
            return
        }

        if (resultCode != Activity.RESULT_OK || data?.data == null) {
            promise.reject("E_PICKER_ERROR", "Document picker returned error")
            return
        }

        val uri = data.data!!
        try {
            promise.resolve(copyToCache(uri))
        } catch (e: Exception) {
            promise.reject("E_FILE_READ", e.message)
        }
    }

    /**
     * Copia o arquivo para o diretório de cache do app e retorna uma URI file://.
     * O React Native FormData não consegue fazer upload de URIs content://, mas
     * lida corretamente com URIs file://.
     */
    private fun copyToCache(uri: Uri): WritableMap {
        val resolver: ContentResolver = reactApplicationContext.contentResolver

        var fileName: String? = null
        var fileSize: Long? = null
        resolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (nameIdx >= 0) fileName = cursor.getString(nameIdx)
                if (sizeIdx >= 0 && !cursor.isNull(sizeIdx)) {
                    fileSize = cursor.getLong(sizeIdx)
                }
            }
        }

        val mimeType = resolver.getType(uri) ?: "application/octet-stream"
        val name = fileName ?: "document_${System.currentTimeMillis()}.pdf"

        val destFile = File(reactApplicationContext.cacheDir, name)
        resolver.openInputStream(uri)?.use { input ->
            destFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }

        val map = Arguments.createMap()
        map.putString("uri", "file://${destFile.absolutePath}")
        map.putString("name", name)
        map.putString("type", mimeType)
        if (fileSize != null) map.putDouble("size", fileSize!!.toDouble())
        return map
    }

    // Assinatura sem nullable — requerida pela interface ActivityEventListener
    override fun onNewIntent(intent: Intent) {
        // Not used
    }
}
