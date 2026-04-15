import { Platform, Linking } from "react-native";
import * as Notifications from "expo-notifications";

export type PermissionState = "granted" | "denied" | "unknown";

/**
 * Check if exact alarm permission is granted (Android 12+)
 * For iOS, always returns granted as notifications handle the scheduling
 */
export async function checkExactAlarmPermission(): Promise<PermissionState> {
  if (Platform.OS !== "android") return "granted";
  
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.granted) return "granted";
    if (permissions.canAskAgain) return "unknown";
    return "denied";
  } catch (err) {
    console.error("Error checking alarm permission:", err);
    return "unknown";
  }
}

/**
 * Request exact alarm permission if needed
 * Returns the resulting permission state
 */
export async function requestExactAlarmPermissionIfNeeded(): Promise<PermissionState> {
  if (Platform.OS !== "android") return "granted";
  
  try {
    const current = await checkExactAlarmPermission();
    if (current === "granted") return "granted";
    
    const result = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });
    
    return result.granted ? "granted" : result.canAskAgain ? "unknown" : "denied";
  } catch (err) {
    console.error("Error requesting alarm permission:", err);
    return "denied";
  }
}

/**
 * Open system settings for alarm/notification permissions
 */
export async function openSystemAlarmSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (err) {
    console.error("Failed to open system settings:", err);
  }
}
