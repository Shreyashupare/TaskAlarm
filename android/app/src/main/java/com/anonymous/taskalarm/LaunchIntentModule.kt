package com.anonymous.taskalarm

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*

/**
 * LaunchIntentModule - Provides access to the launch intent extras
 * Used to detect if app was launched from an alarm
 */
class LaunchIntentModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var pendingAlarmId: String? = null
        private var pendingAlarmTriggered: Boolean = false

        /**
         * Store alarm data from MainActivity when app launches
         */
        fun setPendingAlarm(alarmId: String, triggered: Boolean = true) {
            pendingAlarmId = alarmId
            pendingAlarmTriggered = triggered
        }

        /**
         * Clear pending alarm data after it's been consumed
         */
        fun clearPendingAlarm() {
            pendingAlarmId = null
            pendingAlarmTriggered = false
        }
    }

    override fun getName(): String {
        return "LaunchIntentModule"
    }

    /**
     * Check if the app was launched from an alarm
     * Returns the alarmId if launched from alarm, null otherwise
     * Also checks AlarmService as fallback for when app was already running
     */
    @ReactMethod
    fun getLaunchAlarmId(promise: Promise) {
        val alarmId = pendingAlarmId
        Log.d("LaunchIntentModule", "getLaunchAlarmId called - pendingAlarmId: $alarmId, triggered: $pendingAlarmTriggered")

        // First check if we have pending alarm from launch
        if (alarmId != null && pendingAlarmTriggered) {
            promise.resolve(alarmId)
            return
        }

        // Fallback: check if alarm service is currently running
        val serviceAlarmId = AlarmService.currentAlarmId
        Log.d("LaunchIntentModule", "Checking AlarmService fallback - currentAlarmId: $serviceAlarmId")
        if (serviceAlarmId != null) {
            promise.resolve(serviceAlarmId)
            return
        }

        promise.resolve(null)
    }

    /**
     * Clear the pending alarm data after handling
     */
    @ReactMethod
    fun clearLaunchAlarm(promise: Promise) {
        clearPendingAlarm()
        promise.resolve(true)
    }

    /**
     * Check if app was launched from alarm - synchronous version for initial check
     */
    @ReactMethod
    fun wasLaunchedFromAlarm(promise: Promise) {
        promise.resolve(pendingAlarmId != null && pendingAlarmTriggered)
    }
}
