export type NightGuide = {
  id: string;
  time: string; // HH:MM format
  weekdays: number[]; // 0-6, empty means one-time
  enabled: boolean;
  label?: string;
  soundType: "default" | "custom" | "notification";
  soundName: string;
  soundUri?: string;
  createdAt: number;
  updatedAt: number;
};

export type NightGuideTask = {
  id: string;
  nightGuideId: string;
  text: string;
  order: number;
};

export type NightReflection = {
  id: string;
  nightGuideId: string;
  occurrenceId: string;
  question: string;
  response: string;
  completionPercentage: number; // 0-100
  createdAt: number;
};

/** One scheduled fire per guide per IST calendar day */
export type NightGuideOccurrence = {
  id: string;
  nightGuideId: string;
  scheduledDate: string; // YYYY-MM-DD in IST
  status: "pending" | "completed" | "missed";
  completionPercentage: number; // 0 if none yet
  completedTaskIds: string[]; // task IDs that were completed (for per-task tracking)
  graceDeadlineAt: number; // epoch ms = 09:00 IST next calendar day
  createdAt: number;
  completedAt?: number;
};
