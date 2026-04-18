package com.anonymous.taskalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import android.util.Log

/**
 * AlarmReceiver - Receives alarm triggers from AlarmManager
 * Starts the AlarmService and launches the full-screen alarm activity
 */
class AlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AlarmReceiver"
        const val ACTION_ALARM_TRIGGERED = "com.anonymous.taskalarm.ALARM_TRIGGERED"
        const val EXTRA_ALARM_ID = "alarm_id"
        const val EXTRA_ALARM_LABEL = "alarm_label"
        const val EXTRA_SOUND_URI = "sound_uri"
        const val EXTRA_VIBRATION = "vibration"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Alarm received: ${intent.action}")

        if (intent.action == ACTION_ALARM_TRIGGERED) {
            val alarmId = intent.getStringExtra(EXTRA_ALARM_ID) ?: "unknown"
            val alarmLabel = intent.getStringExtra(EXTRA_ALARM_LABEL) ?: "Alarm"
            val soundUri = intent.getStringExtra(EXTRA_SOUND_URI)
            val vibration = intent.getBooleanExtra(EXTRA_VIBRATION, true)

            Log.d(TAG, "Alarm triggered: $alarmId - $alarmLabel")

            // Acquire wake lock to ensure we can show the alarm
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            val wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "TaskAlarm::AlarmReceiverWakeLock"
            ).apply {
                acquire(60 * 1000L) // 1 minute max
            }

            try {
                // Start the foreground alarm service - it will show notification and play sound
                // Note: Android 14+ blocks background activity launches, so we rely on the
                // notification's fullScreenIntent to show the alarm UI when user interacts
                val serviceIntent = Intent(context, AlarmService::class.java).apply {
                    action = AlarmService.ACTION_START_ALARM
                    putExtra(AlarmService.EXTRA_ALARM_ID, alarmId)
                    putExtra(AlarmService.EXTRA_ALARM_LABEL, alarmLabel)
                    putExtra(AlarmService.EXTRA_SOUND_URI, soundUri)
                    putExtra(AlarmService.EXTRA_VIBRATION, vibration)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }

                Log.d(TAG, "Alarm foreground service started successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to launch alarm", e)
            } finally {
                wakeLock.release()
            }
        }
    }
}
