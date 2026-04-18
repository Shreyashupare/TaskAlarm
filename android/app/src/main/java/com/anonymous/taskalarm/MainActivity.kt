package com.anonymous.taskalarm

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.content.Intent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.IntentFilter
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

  private var alarmReceiver: BroadcastReceiver? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)

    // Handle alarm intent - wake up screen and show over lock screen
    intent?.let { handleAlarmIntent(it) }

    // Register broadcast receiver for immediate alarm notifications
    registerAlarmReceiver()
  }

  private fun registerAlarmReceiver() {
    alarmReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == "com.anonymous.taskalarm.ALARM_TRIGGERED") {
          val alarmId = intent.getStringExtra(AlarmService.EXTRA_ALARM_ID)
          Log.d("MainActivity", "Received alarm broadcast: $alarmId")
          if (alarmId != null) {
            LaunchIntentModule.setPendingAlarm(alarmId, true)
          }
        }
      }
    }
    val filter = IntentFilter("com.anonymous.taskalarm.ALARM_TRIGGERED")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(alarmReceiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      registerReceiver(alarmReceiver, filter)
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    alarmReceiver?.let { unregisterReceiver(it) }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent) // Important: update the intent so getIntent() returns this new intent
    handleAlarmIntent(intent)
  }

  override fun onResume() {
    super.onResume()
    // Re-register receiver if needed
    if (alarmReceiver == null) {
      registerAlarmReceiver()
    }
  }

  private fun handleAlarmIntent(intent: Intent?) {
    Log.d("MainActivity", "handleAlarmIntent called with action: ${intent?.action}, extras: ${intent?.extras}")

    // Handle alarm wake-up
    if (intent?.action == AlarmService.ACTION_START_ALARM ||
        intent?.hasExtra(AlarmService.EXTRA_ALARM_ID) == true) {
      Log.d("MainActivity", "Alarm intent detected, waking up screen")

      // Wake up the screen
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        setShowWhenLocked(true)
        setTurnScreenOn(true)
      } else {
        @Suppress("DEPRECATION")
        window.addFlags(
          WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        )
      }

      // Store alarm data for React Native to access
      val alarmId = intent?.getStringExtra(AlarmService.EXTRA_ALARM_ID)
      val fromAlarm = intent?.getBooleanExtra("from_alarm", false) == true
      Log.d("MainActivity", "Storing alarm data - alarmId: $alarmId, fromAlarm: $fromAlarm")
      if (alarmId != null && fromAlarm) {
        LaunchIntentModule.setPendingAlarm(alarmId, true)
        Log.d("MainActivity", "Alarm data stored in LaunchIntentModule")
      }
    }

    // Handle reboot - pass to React Native
    if (intent?.getBooleanExtra("from_reboot", false) == true) {
      // This will be handled by React Native side
      // The app will reschedule alarms when it loads
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
