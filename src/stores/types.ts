import type { Alarm, AppSettings, ThemePreference, AlarmTaskType, Quote, CustomQuestion } from "../constants/types";

// Alarm Store Types
export type AlarmState = {
  alarms: Alarm[];
  isLoading: boolean;
  error: string | null;
};

export type AlarmActions = {
  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
};

// Settings Store Types
export type SettingsState = AppSettings & {
  isLoading: boolean;
  error: string | null;
};

export type SettingsActions = {
  loadSettings: () => Promise<void>;
  updateTheme: (theme: ThemePreference) => Promise<void>;
  updateTimeFormat: (format: "12h" | "24h") => Promise<void>;
  updateDefaultTaskCount: (count: number) => Promise<void>;
  updateDefaultTaskTypes: (types: AlarmTaskType[]) => Promise<void>;
  updateSnooze: (interval: number, maxCount: number) => Promise<void>;
  updateRingtone: (type: "default" | "custom", name: string, uri?: string) => Promise<void>;
  updateCustomQuestions: (questions: CustomQuestion[]) => Promise<void>;
  updateEnableReflection: (enabled: boolean) => Promise<void>;
  updateEnableCustomQuestions: (enabled: boolean) => Promise<void>;
};

// Ringing Store Types
export type TaskVisualData =
  | { type: "color"; color: string } // hex color
  | { type: "shape"; shape: "circle" | "square" | "triangle" | "star" }
  | { type: "icon"; icon: string; name: string } // emoji icon
  | { type: "position"; color: string; isTarget: boolean }
  | { type: "ordered_item"; number: number; shape: string; color: string }
  | { type: "count_item"; shape: string; color: string; isTarget: boolean };

export type Task = {
  id: string;
  type: "math" | "color" | "shape" | "icon_match" | "position_tap" | "order_tap" | "count_objects" | "reflection" | "custom";
  question: string;
  answer: string | number;
  options?: string[];
  visualData?: TaskVisualData[]; // For color/shape tasks - matches options index
};

export type RingingState = {
  isRinging: boolean;
  alarmId: string | null;
  alarmLabel: string | null;
  currentTime: string;
  tasks: Task[];
  currentTaskIndex: number;
  completedTasks: number;
  requiredTasks: number;
  isStopUnlocked: boolean;
  quote: Quote | null;
  isLoadingQuote: boolean;
};

export type RingingActions = {
  startRinging: (alarmId: string, alarmLabel: string | undefined, requiredTasks: number) => void;
  generateTasks: (count: number, type: string) => void;
  completeCurrentTask: () => void;
  stopRinging: () => Promise<void>;
  loadQuote: () => Promise<void>;
  reset: () => void;
};
