import { create } from "zustand";
import type { NightGuide, NightGuideTask, NightGuideOccurrence } from "../constants/types";
import * as nightGuideRepository from "../data/repositories/nightGuideRepository";
import { reconcileNightGuides } from "../services/nightGuideScheduler";

export type NightGuideState = {
  guides: NightGuide[];
  occurrences: NightGuideOccurrence[];
  isLoading: boolean;
  error: string | null;
};

export type NightGuideActions = {
  loadGuides: () => Promise<void>;
  loadOccurrences: () => Promise<void>;
  addGuide: (guide: NightGuide, tasks: NightGuideTask[]) => Promise<void>;
  updateGuide: (guide: NightGuide, tasks: NightGuideTask[]) => Promise<void>;
  deleteGuide: (id: string) => Promise<void>;
  toggleGuide: (id: string, enabled: boolean) => Promise<void>;
  reconcile: () => Promise<void>;
};

export const useNightGuideStore = create<NightGuideState & NightGuideActions>((set, get) => ({
  guides: [],
  occurrences: [],
  isLoading: false,
  error: null,

  loadGuides: async () => {
    set({ isLoading: true, error: null });
    try {
      const guides = await nightGuideRepository.getAllNightGuides();
      set({ guides, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load night guides",
        isLoading: false,
      });
    }
  },

  loadOccurrences: async () => {
    try {
      const occurrences = await nightGuideRepository.getRecentOccurrences();
      set({ occurrences });
    } catch {
      // silently fail
    }
  },

  addGuide: async (guide: NightGuide, tasks: NightGuideTask[]) => {
    try {
      // Insert first, then resolve conflicts
      await nightGuideRepository.insertNightGuide(guide);
      await nightGuideRepository.replaceTasksForNightGuide(guide.id, tasks);
      if (guide.enabled) {
        await nightGuideRepository.setNightGuideEnabled(guide.id, true);
      // Clean up stale pending occurrences that no longer match selected weekdays
      await nightGuideRepository.deleteStalePendingOccurrences(guide.id, guide.weekdays);
      }
      const guides = await nightGuideRepository.getAllNightGuides();
      set({ guides });
      await get().reconcile();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add night guide" });
    }
  },

  updateGuide: async (guide: NightGuide, tasks: NightGuideTask[]) => {
    try {
      await nightGuideRepository.updateNightGuide(guide);
      await nightGuideRepository.replaceTasksForNightGuide(guide.id, tasks);
      if (guide.enabled) {
        await nightGuideRepository.setNightGuideEnabled(guide.id, true);
      // Clean up stale pending occurrences that no longer match selected weekdays
      await nightGuideRepository.deleteStalePendingOccurrences(guide.id, guide.weekdays);
      }
      const guides = await nightGuideRepository.getAllNightGuides();
      set({ guides });
      await get().reconcile();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update night guide" });
    }
  },

  deleteGuide: async (id: string) => {
    try {
      await nightGuideRepository.deleteNightGuide(id);
      const guides = await nightGuideRepository.getAllNightGuides();
      set({ guides });
      await get().reconcile();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete night guide" });
    }
  },

  toggleGuide: async (id: string, enabled: boolean) => {
    try {
      await nightGuideRepository.setNightGuideEnabled(id, enabled);
      const guides = await nightGuideRepository.getAllNightGuides();
      set({ guides });
      await get().reconcile();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to toggle night guide" });
    }
  },

  reconcile: async () => {
    try {
      const { guides } = get();
      await reconcileNightGuides(guides);
    } catch {
      // silently fail
    }
  },
}));
