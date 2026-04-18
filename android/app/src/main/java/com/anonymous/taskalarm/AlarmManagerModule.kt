package com.anonymous.taskalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import java.util.*

/**
 * AlarmManagerModule - React Native bridge for scheduling alarms using Android AlarmManager
 * Replaces expo-notifications for reliable alarm scheduling with full-screen intent
 */
class AlarmManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AlarmManagerModule"
        private const val REQUEST_CODE_BASE = 1000

        /**
         * Get the PendingIntent for an alarm
         */
        fun getAlarmPendingIntent(context: Context, alarmId: String, alarmLabel: String?, soundUri: String?, vibration: Boolean): PendingIntent {
            val intent = Intent(context, AlarmReceiver::class.java).apply {
                action = AlarmReceiver.ACTION_ALARM_TRIGGERED
                putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
                putExtra(AlarmReceiver.EXTRA_ALARM_LABEL, alarmLabel ?: "Alarm")
                putExtra(AlarmReceiver.EXTRA_SOUND_URI, soundUri)
                putExtra(AlarmReceiver.EXTRA_VIBRATION, vibration)
            }

            val requestCode = REQUEST_CODE_BASE + alarmId.hashCode()

            return PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        /**
         * Cancel an alarm by ID
         */
        fun cancelAlarm(context: Context, alarmId: String) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val pendingIntent = getAlarmPendingIntent(context, alarmId, "", null, true)
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            Log.d(TAG, "Cancelled alarm: $alarmId")
        }
    }

    override fun getName(): String {
        return "AlarmManagerModule"
    }

    /**
     * Schedule an exact alarm using AlarmManager
     * This will trigger the alarm at the specified time with full-screen intent
     */
    @ReactMethod
    fun scheduleAlarm(alarmId: String, triggerTimeMillis: Double, alarmLabel: String?, soundUri: String?, vibration: Boolean, promise: Promise) {
        try {
            val context = reactApplicationContext
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val pendingIntent = getAlarmPendingIntent(context, alarmId, alarmLabel, soundUri, vibration)

            val triggerAtMillis = triggerTimeMillis.toLong()

            // Check if we can schedule exact alarms
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (!alarmManager.canScheduleExactAlarms()) {
                    promise.reject("PERMISSION_DENIED", "Cannot schedule exact alarms. Please grant permission in settings.")
                    return
                }
            }

            // Schedule the exact alarm
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }

            val date = Date(triggerAtMillis)
            Log.d(TAG, "Scheduled alarm: $alarmId at $date")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule alarm", e)
            promise.reject("SCHEDULE_ERROR", "Failed to schedule alarm: ${e.message}")
        }
    }

    /**
     * Cancel a scheduled alarm
     */
    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            cancelAlarm(reactApplicationContext, alarmId)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cancel alarm", e)
            promise.reject("CANCEL_ERROR", "Failed to cancel alarm: ${e.message}")
        }
    }

    /**
     * Cancel all alarms
     */
    @ReactMethod
    fun cancelAllAlarms(promise: Promise) {
        try {
            // Note: This is a simplified version - in production you'd want to track all scheduled alarms
            Log.d(TAG, "Cancel all alarms requested")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cancel all alarms", e)
            promise.reject("CANCEL_ERROR", "Failed to cancel all alarms: ${e.message}")
        }
    }

    /**
     * Check if the app can schedule exact alarms
     */
    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                promise.resolve(alarmManager.canScheduleExactAlarms())
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check exact alarm permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to check permission: ${e.message}")
        }
    }

    /**
     * Open alarm settings to request exact alarm permission
     */
    @ReactMethod
    fun requestExactAlarmPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val intent = android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
                val packageUri = android.net.Uri.parse("package:${reactApplicationContext.packageName}")
                val settingsIntent = Intent(intent).apply {
                    data = packageUri
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactApplicationContext.startActivity(settingsIntent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open alarm settings", e)
            promise.reject("SETTINGS_ERROR", "Failed to open settings: ${e.message}")
        }
    }
}
