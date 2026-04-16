import { create } from "zustand";
import type { ThemePreference, AlarmTaskType, TimeFormat, CustomQuestion } from "../constants/types";
import { MIN_TASK_COUNT, MAX_TASK_COUNT, DEFAULT_TASK_COUNT, DEFAULT_TASK_TYPES, DEFAULT_THEME, DEFAULT_SNOOZE_POLICY, DEFAULT_SNOOZE_INTERVAL, DEFAULT_SNOOZE_MAX, DEFAULT_TIME_FORMAT, DEFAULT_RINGTONE } from "../constants/AppConstants";
import type { SettingsState, SettingsActions } from "./types";
import * as settingsRepository from "../data/repositories/settingsRepository";

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  theme: DEFAULT_THEME,
  timeFormat: DEFAULT_TIME_FORMAT,
  defaultTaskCount: DEFAULT_TASK_COUNT,
  minTaskCount: MIN_TASK_COUNT,
  maxTaskCount: MAX_TASK_COUNT,
  defaultTaskTypes: DEFAULT_TASK_TYPES,
  snoozePolicy: DEFAULT_SNOOZE_POLICY,
  snoozeInterval: DEFAULT_SNOOZE_INTERVAL,
  snoozeMaxCount: DEFAULT_SNOOZE_MAX,
  ringtoneType: DEFAULT_RINGTONE.type,
  ringtoneName: DEFAULT_RINGTONE.name,
  ringtoneUri: DEFAULT_RINGTONE.uri,
  enableReflection: true,
  customQuestions: [],
  enableCustomQuestions: true,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsRepository.getSettings();
      set({ ...settings, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load settings", isLoading: false });
    }
  },

  updateTheme: async (theme: ThemePreference) => {
    try {
      await settingsRepository.updateSettings({ theme });
      set({ theme });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update theme" });
    }
  },

  updateDefaultTaskCount: async (count: number) => {
    try {
      await settingsRepository.updateSettings({ defaultTaskCount: count });
      set({ defaultTaskCount: count });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update task count" });
    }
  },

  updateDefaultTaskTypes: async (types: AlarmTaskType[]) => {
    try {
      await settingsRepository.updateSettings({ defaultTaskTypes: types });
      set({ defaultTaskTypes: types });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update task types" });
    }
  },

  updateTimeFormat: async (format: TimeFormat) => {
    try {
      await settingsRepository.updateSettings({ timeFormat: format });
      set({ timeFormat: format });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update time format" });
    }
  },

  updateSnooze: async (interval: number, maxCount: number) => {
    try {
      await settingsRepository.updateSettings({ snoozeInterval: interval, snoozeMaxCount: maxCount });
      set({ snoozeInterval: interval, snoozeMaxCount: maxCount });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update snooze settings" });
    }
  },

  updateRingtone: async (type: "default" | "custom", name: string, uri?: string) => {
    try {
      await settingsRepository.updateSettings({ ringtoneType: type, ringtoneName: name, ringtoneUri: uri });
      set({ ringtoneType: type, ringtoneName: name, ringtoneUri: uri });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update ringtone" });
    }
  },

  updateCustomQuestions: async (questions: CustomQuestion[]) => {
    try {
      await settingsRepository.updateSettings({ customQuestions: questions });
      set({ customQuestions: questions });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update custom questions" });
    }
  },

  updateEnableReflection: async (enabled: boolean) => {
    try {
      await settingsRepository.updateSettings({ enableReflection: enabled });
      set({ enableReflection: enabled });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update reflection setting" });
    }
  },

  updateEnableCustomQuestions: async (enabled: boolean) => {
    try {
      await settingsRepository.updateSettings({ enableCustomQuestions: enabled });
      set({ enableCustomQuestions: enabled });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update custom questions setting" });
    }
  },
}));
