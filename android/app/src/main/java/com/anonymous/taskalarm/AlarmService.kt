package com.anonymous.taskalarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * AlarmService - Foreground service that plays alarm sound and keeps app alive
 * This runs as a foreground service to ensure the alarm continues even if app is killed
 */
class AlarmService : Service() {
    companion object {
        private const val TAG = "AlarmService"
        private const val CHANNEL_ID = "taskalarm-service"
        private const val NOTIFICATION_ID = 1001
        const val ACTION_START_ALARM = "START_ALARM"
        const val ACTION_STOP_ALARM = "STOP_ALARM"
        const val EXTRA_ALARM_ID = "alarm_id"
        const val EXTRA_ALARM_LABEL = "alarm_label"
        const val EXTRA_SOUND_URI = "sound_uri"
        const val EXTRA_VIBRATION = "vibration"

        // Store current alarm ID for fallback detection
        @JvmStatic
        var currentAlarmId: String? = null
            private set
    }

    private var mediaPlayer: MediaPlayer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var vibrator: Vibrator? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_ALARM -> {
                val alarmId = intent.getStringExtra(EXTRA_ALARM_ID) ?: "unknown"
                val alarmLabel = intent.getStringExtra(EXTRA_ALARM_LABEL) ?: "Alarm"
                val soundUri = intent.getStringExtra(EXTRA_SOUND_URI)
                val vibration = intent.getBooleanExtra(EXTRA_VIBRATION, true)
                startAlarm(alarmId, alarmLabel, soundUri, vibration)
            }
            ACTION_STOP_ALARM -> {
                stopAlarm()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            val channel = NotificationChannel(
                CHANNEL_ID,
                "Alarm Service",
                NotificationManager.IMPORTANCE_MAX  // MAX for lock screen visibility
            ).apply {
                description = "Keeps alarm running in background"
                setSound(null, audioAttributes)
                vibrationPattern = longArrayOf(0, 1000, 1000, 1000)
                enableVibration(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                setBypassDnd(true)  // Show even in Do Not Disturb
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun startAlarm(alarmId: String, alarmLabel: String, soundUri: String?, vibration: Boolean) {
        // Guard: Don't restart if already ringing the same alarm
        if (currentAlarmId == alarmId && mediaPlayer?.isPlaying == true) {
            Log.d(TAG, "Alarm $alarmId is already ringing, skipping restart")
            return
        }

        Log.d(TAG, "Starting alarm: $alarmId - $alarmLabel - vibration: $vibration")
        currentAlarmId = alarmId  // Track current alarm for fallback detection

        // Acquire wake lock to wake screen and keep CPU alive (10 minutes max)
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+: Use new wake lock types
            powerManager.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "TaskAlarm::AlarmWakeLock"
            )
        } else {
            @Suppress("DEPRECATION")
            powerManager.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
                "TaskAlarm::AlarmWakeLock"
            )
        }.apply {
            acquire(10 * 60 * 1000L) // 10 minutes max
        }

        // Initialize vibrator
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        // Create intent to open MainActivity with alarm data
        val notificationIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_ALARM_ID, alarmId)
            putExtra("from_alarm", true)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, alarmId.hashCode(), notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("$alarmLabel")
            .setContentText("TAP TO WAKE UP! Complete tasks to stop alarm")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(pendingIntent, true)
            .setOngoing(true)  // Prevents swipe dismissal during alarm
            .setAutoCancel(false)
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setWhen(System.currentTimeMillis())
            .setShowWhen(true)
            .setTicker("ALARM: $alarmLabel")
            .setVibrate(longArrayOf(0, 1000, 1000, 1000, 1000, 1000))
            .build()

        startForeground(NOTIFICATION_ID, notification)
        Log.d(TAG, "Foreground service started with notification")

        // For pre-Android 14, try direct launch (may work on some devices)
        // Android 14+ blocks this, so we rely on the notification
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            try {
                val launchIntent = Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP
                    putExtra(EXTRA_ALARM_ID, alarmId)
                    putExtra("from_alarm", true)
                    putExtra("alarm_triggered", true)
                }
                startActivity(launchIntent)
                Log.d(TAG, "Launched MainActivity directly (pre-Android 14)")
            } catch (e: Exception) {
                Log.w(TAG, "Direct launch failed, relying on notification: ${e.message}")
            }
        }

        // Send broadcast to notify app if it's already running
        sendBroadcast(Intent("com.anonymous.taskalarm.ALARM_TRIGGERED").apply {
            putExtra(EXTRA_ALARM_ID, alarmId)
            putExtra(EXTRA_ALARM_LABEL, alarmLabel)
        })

        // Play alarm sound
        playAlarmSound(soundUri)

        // Start vibration if enabled
        if (vibration) {
            startVibration()
        }
    }

    private fun playAlarmSound(soundUri: String?) {
        try {
            // Use custom sound if provided, otherwise use default alarm sound
            val alarmUri = if (!soundUri.isNullOrEmpty()) {
                Uri.parse(soundUri)
            } else {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                    ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            }

            mediaPlayer = MediaPlayer().apply {
                setDataSource(applicationContext, alarmUri)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                isLooping = true
                prepare()
                start()
            }
            Log.d(TAG, "Playing alarm sound: $alarmUri")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to play alarm sound", e)
            // Fallback to default notification sound
            try {
                val fallbackUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(applicationContext, fallbackUri)
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    isLooping = true
                    prepare()
                    start()
                }
            } catch (e2: Exception) {
                Log.e(TAG, "Fallback sound also failed", e2)
            }
        }
    }

    private fun startVibration() {
        try {
            val pattern = longArrayOf(0, 500, 500, 500, 500, 500, 500, 500)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }
            Log.d(TAG, "Vibration started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start vibration", e)
        }
    }

    private fun stopVibration() {
        try {
            vibrator?.cancel()
            Log.d(TAG, "Vibration stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop vibration", e)
        }
    }

    private fun stopAlarm() {
        Log.d(TAG, "Stopping alarm")
        currentAlarmId = null  // Clear current alarm tracking

        // Stop media player
        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
            }
            release()
        }
        mediaPlayer = null

        // Stop vibration
        stopVibration()
        vibrator = null

        // Release wake lock
        wakeLock?.apply {
            if (isHeld) {
                release()
            }
        }
        wakeLock = null

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        // Don't stop alarm here - service should survive app being swiped away
        // Alarm only stops when user completes tasks or explicitly dismisses
        Log.d(TAG, "Service destroyed but alarm continues")
    }
}
