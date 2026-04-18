import { Platform, NativeModules } from "react-native";

// Native module for Android launch intent
const LaunchIntentModule = Platform.OS === "android" ? NativeModules.LaunchIntentModule : null;

/**
 * Check if the app was launched from an alarm
 * Returns the alarmId if launched from alarm, null otherwise
 */
export async function getLaunchAlarmId(): Promise<string | null> {
  if (Platform.OS !== "android" || !LaunchIntentModule) {
    return null;
  }

  try {
    const alarmId = await LaunchIntentModule.getLaunchAlarmId();
    return alarmId;
  } catch (e) {
    console.error("Failed to get launch alarm ID:", e);
    return null;
  }
}

/**
 * Clear the launch alarm data after handling
 */
export async function clearLaunchAlarm(): Promise<void> {
  if (Platform.OS !== "android" || !LaunchIntentModule) {
    return;
  }

  try {
    await LaunchIntentModule.clearLaunchAlarm();
  } catch (e) {
    console.error("Failed to clear launch alarm:", e);
  }
}

/**
 * Check if app was launched from alarm
 */
export async function wasLaunchedFromAlarm(): Promise<boolean> {
  if (Platform.OS !== "android" || !LaunchIntentModule) {
    return false;
  }

  try {
    return await LaunchIntentModule.wasLaunchedFromAlarm();
  } catch (e) {
    console.error("Failed to check if launched from alarm:", e);
    return false;
  }
}
