import * as Notifications from "expo-notifications";
import type { Alarm } from "../constants/types";

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || "TaskAlarm",
      body: "Tap to complete tasks and stop the alarm",
      data: {
        alarmId: alarm.id,
        type: "alarm_trigger",
      },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || "TaskAlarm",
      body: "Tap to complete tasks and stop the alarm",
      data: {
        alarmId: alarm.id,
        type: "alarm_trigger",
      },
      sound: "default",
    },
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
