import type { Alarm, AppSettings, ThemePreference, AlarmTaskType, Quote } from "../constants/types";

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
  updateDefaultTaskCount: (count: number) => Promise<void>;
  updateDefaultTaskType: (type: AlarmTaskType) => Promise<void>;
};

// Ringing Store Types
export type Task = {
  id: string;
  type: "math" | "color" | "shape";
  question: string;
  answer: string | number;
  options?: string[];
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
