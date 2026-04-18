import { Platform, NativeModules } from "react-native";
import { DEBUG } from "../constants/AppConstants";

// Native module for Android ringtones
const RingtoneModule = Platform.OS === "android" ? NativeModules.RingtoneModule : null;

export type DeviceRingtone = {
  uri: string;
  name: string;
  type: "default" | "device" | "notification" | "custom";
};

/**
 * Get all device alarm ringtones
 * Returns list of ringtones available on the device
 */
export async function getDeviceRingtones(): Promise<DeviceRingtone[]> {
  if (Platform.OS !== "android" || !RingtoneModule) {
    // Return default ringtones for iOS or when native module is not available
    return [
      { uri: "default", name: "Default Alarm", type: "default" },
      { uri: "reminder", name: "Reminder", type: "notification" },
    ];
  }

  try {
    const ringtones = await RingtoneModule.getDeviceRingtones();
    if (DEBUG) console.log(`Got ${ringtones.length} device ringtones`);
    return ringtones.map((r: { uri: string; name: string; type: string }) => ({
      uri: r.uri,
      name: r.name,
      type: r.type as DeviceRingtone["type"],
    }));
  } catch (e) {
    console.error("Failed to get device ringtones:", e);
    // Fallback to default ringtones
    return [
      { uri: "default", name: "Default Alarm", type: "default" },
    ];
  }
}

/**
 * Preview a ringtone by URI
 * Plays the ringtone for a few seconds
 */
export async function previewRingtone(uri: string): Promise<void> {
  if (Platform.OS !== "android" || !RingtoneModule) {
    console.log("Ringtone preview not available on this platform");
    return;
  }

  try {
    await RingtoneModule.previewRingtone(uri);
    if (DEBUG) console.log("Previewing ringtone:", uri);
  } catch (e) {
    console.error("Failed to preview ringtone:", e);
  }
}

/**
 * Stop the current ringtone preview
 */
export async function stopPreview(): Promise<void> {
  if (Platform.OS !== "android" || !RingtoneModule) {
    return;
  }

  try {
    await RingtoneModule.stopPreview();
    if (DEBUG) console.log("Stopped ringtone preview");
  } catch (e) {
    console.error("Failed to stop preview:", e);
  }
}

/**
 * Get the default alarm URI
 */
export async function getDefaultAlarmUri(): Promise<string> {
  if (Platform.OS !== "android" || !RingtoneModule) {
    return "default";
  }

  try {
    const uri = await RingtoneModule.getDefaultAlarmUri();
    return uri;
  } catch (e) {
    console.error("Failed to get default alarm URI:", e);
    return "default";
  }
}
