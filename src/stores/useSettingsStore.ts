import { create } from "zustand";
import type { ThemePreference, AlarmTaskType } from "../constants/types";
import { MIN_TASK_COUNT, MAX_TASK_COUNT, DEFAULT_TASK_COUNT, DEFAULT_TASK_TYPE, DEFAULT_THEME, DEFAULT_SNOOZE_POLICY } from "../constants/AppConstants";
import type { SettingsState, SettingsActions } from "./types";
import * as settingsRepository from "../data/repositories/settingsRepository";

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  theme: DEFAULT_THEME,
  defaultTaskCount: DEFAULT_TASK_COUNT,
  minTaskCount: MIN_TASK_COUNT,
  maxTaskCount: MAX_TASK_COUNT,
  defaultTaskType: DEFAULT_TASK_TYPE,
  snoozePolicy: DEFAULT_SNOOZE_POLICY,
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

  updateDefaultTaskType: async (type: AlarmTaskType) => {
    try {
      await settingsRepository.updateSettings({ defaultTaskType: type });
      set({ defaultTaskType: type });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update task type" });
    }
  },
}));
