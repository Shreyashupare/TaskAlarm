package com.anonymous.taskalarm

import android.content.Context
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * RingtoneModule - React Native bridge for accessing device ringtones
 * Allows JS to get list of device alarm ringtones and preview them
 */
class RingtoneModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "RingtoneModule"
        private var currentRingtone: Ringtone? = null
    }

    override fun getName(): String {
        return "RingtoneModule"
    }

    /**
     * Get all alarm ringtones available on the device
     */
    @ReactMethod
    fun getDeviceRingtones(promise: Promise) {
        try {
            val context = reactApplicationContext
            val ringtoneManager = RingtoneManager(context)
            ringtoneManager.setType(RingtoneManager.TYPE_ALARM)

            val cursor = ringtoneManager.cursor
            val ringtones = Arguments.createArray()

            // Add default system alarm
            val defaultAlarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            if (defaultAlarmUri != null) {
                val defaultRingtone = Arguments.createMap()
                defaultRingtone.putString("uri", defaultAlarmUri.toString())
                defaultRingtone.putString("name", "Default Alarm")
                defaultRingtone.putString("type", "default")
                ringtones.pushMap(defaultRingtone)
            }

            // Add all alarm ringtones from device
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    val uri = ringtoneManager.getRingtoneUri(cursor.position)
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)

                    val ringtoneMap = Arguments.createMap()
                    ringtoneMap.putString("uri", uri.toString())
                    ringtoneMap.putString("name", title)
                    ringtoneMap.putString("type", "device")
                    ringtones.pushMap(ringtoneMap)
                } while (cursor.moveToNext())
            }

            cursor?.close()

            promise.resolve(ringtones)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get device ringtones", e)
            promise.reject("RINGTONE_ERROR", "Failed to get device ringtones: ${e.message}")
        }
    }

    /**
     * Get all notification sounds available on the device
     */
    @ReactMethod
    fun getNotificationSounds(promise: Promise) {
        try {
            val context = reactApplicationContext
            val ringtoneManager = RingtoneManager(context)
            ringtoneManager.setType(RingtoneManager.TYPE_NOTIFICATION)

            val cursor = ringtoneManager.cursor
            val ringtones = Arguments.createArray()

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    val uri = ringtoneManager.getRingtoneUri(cursor.position)
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)

                    val ringtoneMap = Arguments.createMap()
                    ringtoneMap.putString("uri", uri.toString())
                    ringtoneMap.putString("name", title)
                    ringtoneMap.putString("type", "notification")
                    ringtones.pushMap(ringtoneMap)
                } while (cursor.moveToNext())
            }

            cursor?.close()

            promise.resolve(ringtones)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get notification sounds", e)
            promise.reject("RINGTONE_ERROR", "Failed to get notification sounds: ${e.message}")
        }
    }

    /**
     * Preview a ringtone by URI
     * Stops any currently playing preview
     */
    @ReactMethod
    fun previewRingtone(uriString: String, promise: Promise) {
        try {
            // Stop any currently playing ringtone
            stopPreview()

            val context = reactApplicationContext
            val uri = Uri.parse(uriString)

            currentRingtone = RingtoneManager.getRingtone(context, uri)
            currentRingtone?.play()

            Log.d(TAG, "Previewing ringtone: $uriString")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to preview ringtone", e)
            promise.reject("RINGTONE_ERROR", "Failed to preview ringtone: ${e.message}")
        }
    }

    /**
     * Stop the current preview
     */
    @ReactMethod
    fun stopPreview(promise: Promise? = null) {
        try {
            currentRingtone?.let {
                if (it.isPlaying) {
                    it.stop()
                }
            }
            currentRingtone = null
            Log.d(TAG, "Preview stopped")
            promise?.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop preview", e)
            promise?.reject("RINGTONE_ERROR", "Failed to stop preview: ${e.message}")
        }
    }

    /**
     * Get the default alarm URI
     */
    @ReactMethod
    fun getDefaultAlarmUri(promise: Promise) {
        try {
            val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            if (uri != null) {
                promise.resolve(uri.toString())
            } else {
                promise.reject("RINGTONE_ERROR", "No default alarm URI found")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get default alarm URI", e)
            promise.reject("RINGTONE_ERROR", "Failed to get default alarm URI: ${e.message}")
        }
    }
}
