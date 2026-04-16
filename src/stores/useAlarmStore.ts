import { create } from "zustand";
import { DEBUG } from "../constants/AppConstants";
import type { Alarm } from "../constants/types";
import type { AlarmState, AlarmActions } from "./types";
import * as alarmRepository from "../data/repositories/alarmRepository";

export const useAlarmStore = create<AlarmState & AlarmActions>((set, get) => ({
  alarms: [],
  isLoading: false,
  error: null,

  loadAlarms: async () => {
    set({ isLoading: true, error: null });
    try {
      const alarms = await alarmRepository.getAllAlarms();
      set({ alarms, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load alarms", isLoading: false });
    }
  },

  addAlarm: async (alarm: Alarm) => {
    try {
      await alarmRepository.insertAlarm(alarm);
      if (DEBUG) console.log("Alarm inserted:", alarm.id);
      await get().loadAlarms();
      if (DEBUG) console.log("Alarms loaded after insert, count:", get().alarms.length);
    } catch (err) {
      if (DEBUG) console.error("Failed to add alarm:", err);
      set({ error: err instanceof Error ? err.message : "Failed to add alarm" });
    }
  },

  updateAlarm: async (alarm: Alarm) => {
    try {
      await alarmRepository.updateAlarm(alarm);
      await get().loadAlarms();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update alarm" });
    }
  },

  deleteAlarm: async (id: string) => {
    try {
      await alarmRepository.deleteAlarm(id);
      await get().loadAlarms();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete alarm" });
    }
  },

  toggleAlarm: async (id: string) => {
    const alarm = get().alarms.find(a => a.id === id);
    if (!alarm) return;

    const updated = { ...alarm, enabled: !alarm.enabled, updatedAt: Date.now() };
    await get().updateAlarm(updated);
  },
}));
