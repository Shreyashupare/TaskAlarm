import * as Notifications from "expo-notifications";
import { Platform, NativeModules } from "react-native";
import type { Alarm } from "../constants/types";
import { DEBUG } from "../constants/AppConstants";

// Android notification channel for alarms (used for iOS and fallback)
const ALARM_CHANNEL_ID = "taskalarm-alarms";

// Native module for Android AlarmManager scheduling
const AlarmManagerModule = Platform.OS === "android" ? NativeModules.AlarmManagerModule : null;

/**
 * Check if the app can schedule exact alarms (Android 12+)
 */
export async function canScheduleExactAlarms(): Promise<boolean> {
  if (Platform.OS !== "android" || !AlarmManagerModule) return true;
  try {
    return await AlarmManagerModule.canScheduleExactAlarms();
  } catch {
    return false;
  }
}

/**
 * Request exact alarm permission (opens system settings on Android 12+)
 */
export async function requestExactAlarmPermission(): Promise<void> {
  if (Platform.OS !== "android" || !AlarmManagerModule) return;
  try {
    await AlarmManagerModule.requestExactAlarmPermission();
  } catch (e) {
    console.error("Failed to request exact alarm permission:", e);
  }
}

/**
 * Setup Android notification channel for alarms
 * This is required for alarms to play sound in background on iOS
 */
export async function setupAlarmNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: "Alarm Notifications",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 500, 500],
    sound: "default",
    enableVibrate: true,
    enableLights: true,
    lightColor: "#FF0000",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
  });

  if (DEBUG) console.log("Alarm notification channel configured");
}

// Configure notifications to show when app is in foreground (iOS only)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

/**
 * Launch alarm ringing screen immediately when alarm is triggered
 * This is called when alarm fires (from AlarmReceiver on Android)
 */
export async function launchAlarmFromNotification(alarmId: string): Promise<void> {
  if (DEBUG) console.log("Launching alarm screen for:", alarmId);

  // On Android, the AlarmService is already started by AlarmReceiver
  // This function is kept for compatibility with iOS if needed
  if (Platform.OS === "android") {
    const { NativeModules } = await import("react-native");
    const AlarmServiceModule = NativeModules.AlarmServiceModule;
    if (AlarmServiceModule) {
      try {
        AlarmServiceModule.startAlarmService?.(alarmId, "Alarm", undefined, true);
      } catch (e) {
        console.log("Failed to start alarm service:", e);
      }
    }
  }
}

/**
 * Calculate the next trigger time for an alarm based on current time
 */
export function getNextTriggerTime(alarm: Alarm, now: Date): Date | null {
  if (!alarm.enabled) return null;

  const [hours, minutes] = alarm.time.split(":").map(Number);

  let nextDate = new Date(now);
  nextDate.setHours(hours, minutes, 0, 0);

  const weekdays = alarm.weekdays.length > 0 ? alarm.weekdays : null;

  if (weekdays === null) {
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
  }

  const currentDay = now.getDay();
  const sortedWeekdays = [...weekdays].sort((a, b) => a - b);

  let daysToAdd = 0;
  let found = false;

  for (const day of sortedWeekdays) {
    if (day > currentDay) {
      daysToAdd = day - currentDay;
      found = true;
      break;
    } else if (day === currentDay) {
      if (hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes())) {
        daysToAdd = 0;
        found = true;
        break;
      }
    }
  }

  if (!found && sortedWeekdays.length > 0) {
    daysToAdd = 7 - currentDay + sortedWeekdays[0];
  }

  nextDate.setDate(now.getDate() + daysToAdd);
  return nextDate;
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  await cancelAlarm(alarm.id);

  const now = new Date();
  const triggerTime = getNextTriggerTime(alarm, now);

  if (!triggerTime) {
    return;
  }

  // On Android, use native AlarmManager for reliable exact alarm scheduling
  if (Platform.OS === "android" && AlarmManagerModule) {
    try {
      await AlarmManagerModule.scheduleAlarm(
        alarm.id,
        triggerTime.getTime(),
        alarm.label,
        alarm.soundUri,
        alarm.vibration
      );
      if (DEBUG) console.log(`Alarm scheduled via AlarmManager for ${triggerTime.toLocaleString()}`);
      return;
    } catch (e) {
      console.error("Failed to schedule via AlarmManager, falling back to notifications:", e);
      // Fall through to notification-based scheduling
    }
  }

  // Fallback: Use expo-notifications for iOS or if AlarmManager fails
  await setupAlarmNotificationChannel();

  const soundToUse = alarm.soundType === "default" ? "default" : undefined;
  const vibrationPattern = alarm.vibration ? [0, 500, 500, 500, 500, 500] : [];

  const notificationContent: Notifications.NotificationContentInput = {
    title: alarm.label || "⏰ TaskAlarm",
    body: "🔔 TAP TO WAKE UP! Complete tasks to stop alarm",
    data: {
      alarmId: alarm.id,
      type: "alarm_trigger",
      soundName: alarm.soundName,
    },
    sound: soundToUse,
    priority: Notifications.AndroidNotificationPriority.HIGH,
    vibrate: vibrationPattern,
    sticky: true,
  };

  if (Platform.OS === "android") {
    const androidContent = notificationContent as Notifications.NotificationContentInput & {
      channelId?: string;
      ongoing?: boolean;
    };
    androidContent.channelId = ALARM_CHANNEL_ID;
    androidContent.ongoing = true;
  }

  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });

  if (DEBUG) console.log(`Alarm scheduled via notifications for ${triggerTime.toLocaleString()}`);
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  // Cancel via AlarmManager on Android
  if (Platform.OS === "android" && AlarmManagerModule) {
    try {
      await AlarmManagerModule.cancelAlarm(alarmId);
    } catch (e) {
      console.error("Failed to cancel alarm via AlarmManager:", e);
    }
  }

  // Also cancel any expo-notifications (for fallback/iOS)
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.content.data?.alarmId === alarmId);
  for (const n of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
}

/**
 * Reschedule an alarm after it has triggered
 * This is used for repeating alarms to schedule the next occurrence
 */
export async function rescheduleAlarm(alarm: Alarm): Promise<void> {
  // For one-time alarms (no weekdays), don't reschedule
  if (alarm.weekdays.length === 0) {
    return;
  }

  // Simply call scheduleAlarm which will calculate next trigger and schedule it
  await scheduleAlarm(alarm);

  if (DEBUG) console.log(`Alarm rescheduled: ${alarm.id}`);
}

export async function reconcileAlarms(alarms: Alarm[]): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledAlarmIds = scheduled
    .filter(n => n.content.data?.type === "alarm_trigger")
    .map(n => n.content.data?.alarmId);

  for (const alarm of alarms) {
    if (alarm.enabled) {
      const isScheduled = scheduledAlarmIds.includes(alarm.id);
      if (!isScheduled) {
        await scheduleAlarm(alarm);
      }
    } else {
      await cancelAlarm(alarm.id);
    }
  }
}
