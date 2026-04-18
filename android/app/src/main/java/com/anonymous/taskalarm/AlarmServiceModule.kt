package com.anonymous.taskalarm

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * React Native bridge module for AlarmService
 * Allows JS code to start/stop the alarm foreground service
 */
class AlarmServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlarmServiceModule"
    }

    @ReactMethod
    fun startAlarmService(alarmId: String, alarmLabel: String, soundUri: String?, vibration: Boolean) {
        val context = reactApplicationContext
        val intent = Intent(context, AlarmService::class.java).apply {
            action = AlarmService.ACTION_START_ALARM
            putExtra(AlarmService.EXTRA_ALARM_ID, alarmId)
            putExtra(AlarmService.EXTRA_ALARM_LABEL, alarmLabel)
            putExtra(AlarmService.EXTRA_SOUND_URI, soundUri)
            putExtra(AlarmService.EXTRA_VIBRATION, vibration)
        }
        context.startForegroundService(intent)
    }

    @ReactMethod
    fun stopAlarmService() {
        val context = reactApplicationContext
        val intent = Intent(context, AlarmService::class.java).apply {
            action = AlarmService.ACTION_STOP_ALARM
        }
        context.startService(intent)
    }
}
