import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Alarm } from "../constants/types";
import { DEBUG } from "../constants/AppConstants";

// Android notification channel for alarms
const ALARM_CHANNEL_ID = "taskalarm-alarms";

/**
 * Setup Android notification channel for alarms
 * This is required for alarms to play sound in background
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

// Configure notifications to show when app is in foreground
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
 * Launch alarm ringing screen immediately when notification is received
 * This is called from the notification response handler in App.tsx
 */
export async function launchAlarmFromNotification(alarmId: string): Promise<void> {
  if (DEBUG) console.log("Launching alarm screen for:", alarmId);
  
  // On Android, start the foreground service immediately for sound/vibration
  if (Platform.OS === "android") {
    const { NativeModules } = await import("react-native");
    const AlarmServiceModule = NativeModules.AlarmServiceModule;
    if (AlarmServiceModule) {
      try {
        AlarmServiceModule.startAlarmService?.(alarmId, "Alarm", undefined, true);
      } catch (e) {
        console.log("Failed to start alarm service from notification:", e);
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

  // Ensure channel is set up before scheduling
  await setupAlarmNotificationChannel();

  // Determine sound based on alarm settings
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
    // Make notification persistent (ongoing)
    sticky: true,
  };

  // Add Android channel for proper alarm behavior
  if (Platform.OS === "android") {
    const androidContent = notificationContent as Notifications.NotificationContentInput & {
      channelId?: string;
      ongoing?: boolean;
    };
    androidContent.channelId = ALARM_CHANNEL_ID;
    androidContent.ongoing = true; // Can't be dismissed by swiping
  }

  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });

  if (DEBUG) console.log(`Alarm scheduled for ${triggerTime.toLocaleString()} with sound: ${alarm.soundName}`);
}

export async function cancelAlarm(alarmId: string): Promise<void> {
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

  // Calculate next trigger from now
  const now = new Date();
  const nextTrigger = getNextTriggerTime(alarm, now);

  if (!nextTrigger) {
    return;
  }

  // Cancel any existing schedules for this alarm and schedule the next one
  await cancelAlarm(alarm.id);

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
      date: nextTrigger,
    },
  });
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
