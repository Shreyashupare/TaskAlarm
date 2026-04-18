export type AlarmTaskType =
  | "math"
  | "color"
  | "shape"
  | "mixed"
  | "icon_match"
  | "position_tap"
  | "order_tap"
  | "count_objects";

export type Alarm = {
  id: string;
  time: string; // HH:MM format
  weekdays: number[]; // 0-6, empty means one-time
  enabled: boolean;
  label?: string;
  soundType: "default" | "custom" | "notification" | "reminder" | "device";
  soundName: string;
  soundUri?: string;
  vibration: boolean;
  taskType: AlarmTaskType;
  taskCount: number; // 3..10
  createdAt: number;
  updatedAt: number;
};
