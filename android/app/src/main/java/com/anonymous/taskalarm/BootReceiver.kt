package com.anonymous.taskalarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * BootReceiver - Shows notification after reboot reminding user to open app
 * This ensures alarms are rescheduled when device restarts
 */
class BootReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "BootReceiver"
        private const val CHANNEL_ID = "taskalarm-reboot"
        private const val NOTIFICATION_ID = 9001
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON" ||
            intent.action == "com.htc.intent.action.QUICKBOOT_POWERON") {

            Log.d(TAG, "Device rebooted, showing reschedule reminder...")

            try {
                // Create notification channel for Android O+
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val channel = NotificationChannel(
                        CHANNEL_ID,
                        "Alarm Reschedule",
                        NotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "Reminds you to open TaskAlarm after device restart"
                    }
                    val notificationManager = context.getSystemService(NotificationManager::class.java)
                    notificationManager.createNotificationChannel(channel)
                }

                // Create intent to open MainActivity
                val launchIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("from_reboot", true)
                }
                val pendingIntent = android.app.PendingIntent.getActivity(
                    context, 0, launchIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )

                // Show notification to remind user to open app
                val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                    .setContentTitle("📱 TaskAlarm")
                    .setContentText("Please open TaskAlarm once to reschedule your alarms after restart")
                    .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .build()

                val notificationManager = context.getSystemService(NotificationManager::class.java)
                notificationManager.notify(NOTIFICATION_ID, notification)

                Log.d(TAG, "Reboot reminder notification shown")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to show reboot notification", e)
            }
        }
    }
}
