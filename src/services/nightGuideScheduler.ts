import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { NightGuide } from "../constants/types";
import { DEBUG } from "../constants/AppConstants";
import { getIstDateString, getGraceDeadlineMs, getIstTimeString, getIstWeekday } from "../utils/istDate";
import { getOccurrenceForDate, upsertOccurrence, markMissedAfterGrace } from "../data/repositories/nightGuideRepository";

const NIGHT_GUIDE_CHANNEL_ID = "taskalarm-night-guide";

/**
 * Setup Android notification channel for night guides (gentle, different from alarm).
 */
export async function setupNightGuideNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(NIGHT_GUIDE_CHANNEL_ID, {
    name: "Night Guide Notifications",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    sound: "default",
    enableVibrate: true,
    enableLights: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });

  if (DEBUG) console.log("Night Guide notification channel configured");
}

/**
 * Get the type for a night guide notification channel
 */
export function getNightGuideChannelId(): string {
  return NIGHT_GUIDE_CHANNEL_ID;
}

/**
 * Calculate next trigger time for a night guide.
 * Returns null if guide is disabled or no valid weekday match.
 */
export function getNextNightGuideTrigger(
  guide: NightGuide,
  now: Date = new Date()
): Date | null {
  if (!guide.enabled) return null;

  const [hours, minutes] = guide.time.split(":").map(Number);
  const weekdays = guide.weekdays;

  // For one-time, check if already completed
  if (weekdays.length === 0) {
    const scheduledDate = getIstDateString(now);
    // If the scheduled time for today has passed, it's too late for one-time today
    const todayTime = new Date(now);
    todayTime.setHours(hours, minutes, 0, 0);
    if (todayTime > now) return todayTime;
    return null; // one-time with past time today won't trigger
  }

  // Find next matching weekday
  const currentIstDay = getIstWeekday(now);
  const currentIstTime = getIstTimeString(now);
  const currentMinutes = parseInt(currentIstTime.split(":")[0], 10) * 60 + parseInt(currentIstTime.split(":")[1], 10);
  const guideMinutes = hours * 60 + minutes;

  const sorted = [...weekdays].sort((a, b) => a - b);
  let daysToAdd: number | null = null;

  for (const day of sorted) {
    if (day > currentIstDay) {
      daysToAdd = day - currentIstDay;
      break;
    } else if (day === currentIstDay && guideMinutes > currentMinutes) {
      daysToAdd = 0;
      break;
    }
  }

  if (daysToAdd === null && sorted.length > 0) {
    daysToAdd = 7 - currentIstDay + sorted[0];
  }

  if (daysToAdd === null) return null;

  const trigger = new Date(now);
  trigger.setDate(now.getDate() + daysToAdd);
  trigger.setHours(hours, minutes, 0, 0);
  return trigger;
}

/**
 * Schedule a single night guide notification.
 */
export async function scheduleNightGuide(guide: NightGuide): Promise<void> {
  await cancelNightGuide(guide.id);

  const triggerTime = getNextNightGuideTrigger(guide);
  if (!triggerTime) return;

  // Create or ensure occurrence exists
  const scheduledDate = getIstDateString(triggerTime);
  const existing = await getOccurrenceForDate(guide.id, scheduledDate);
  if (!existing) {
    await upsertOccurrence({
      id: `${guide.id}_${scheduledDate}`,
      nightGuideId: guide.id,
      scheduledDate,
      status: "pending",
      completionPercentage: 0,
      completedTaskIds: [],
      graceDeadlineAt: getGraceDeadlineMs(scheduledDate),
      createdAt: Date.now(),
    });
  }

  await setupNightGuideNotificationChannel();

  const content: Notifications.NotificationContentInput = {
    title: "Done for the day?",
    body: "Time for your bedtime routine",
    data: {
      nightGuideId: guide.id,
      type: "night_guide_trigger",
    },
    sound: "default",
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
    vibrate: [0, 200, 100, 200],
  };

  if (Platform.OS === "android") {
    (content as any).channelId = NIGHT_GUIDE_CHANNEL_ID;
  }

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });

  if (DEBUG) console.log(`Night Guide scheduled for ${triggerTime.toLocaleString()}`, guide.id);
}

/**
 * Cancel a night guide notification.
 */
export async function cancelNightGuide(nightGuideId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (n) => n.content.data?.nightGuideId === nightGuideId
  );
  for (const n of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
}

/**
 * Reschedule a night guide after it fires (for repeating guides).
 */
export async function rescheduleNightGuide(guide: NightGuide): Promise<void> {
  const weekdays = guide.weekdays;
  // One-time — do not reschedule
  if (weekdays.length === 0) return;
  await scheduleNightGuide(guide);
}

/**
 * Reconcile all night guides on app launch.
 */
export async function reconcileNightGuides(guides: NightGuide[]): Promise<void> {
  await setupNightGuideNotificationChannel();
  for (const guide of guides) {
    if (guide.enabled) {
      await scheduleNightGuide(guide);
    } else {
      await cancelNightGuide(guide.id);
    }
  }
  await markMissedAfterGrace(Date.now());
}
