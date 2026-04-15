import { create } from "zustand";
import type { RingingState, RingingActions, Task } from "./types";
import * as quoteRepository from "../data/repositories/quoteRepository";

const initialState: Omit<RingingState, keyof RingingActions> = {
  isRinging: false,
  alarmId: null,
  alarmLabel: null,
  currentTime: "",
  tasks: [],
  currentTaskIndex: 0,
  completedTasks: 0,
  requiredTasks: 4,
  isStopUnlocked: false,
  quote: null,
  isLoadingQuote: false,
};

export const useRingingStore = create<RingingState & RingingActions>((set, get) => ({
  ...initialState,

  startRinging: (alarmId: string, alarmLabel: string | undefined, requiredTasks: number) => {
    set({
      isRinging: true,
      alarmId,
      alarmLabel: alarmLabel ?? null,
      requiredTasks,
      completedTasks: 0,
      currentTaskIndex: 0,
      isStopUnlocked: false,
      quote: null,
    });
    get().generateTasks(requiredTasks, "math");
  },

  generateTasks: (count: number, type: string) => {
    // MVP: Generate simple math tasks
    const tasks: Task[] = [];
    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      tasks.push({
        id: `task_${i}`,
        type: type as Task["type"],
        question: `${a} + ${b} = ?`,
        answer: a + b,
      });
    }
    set({ tasks });
  },

  completeCurrentTask: () => {
    const { completedTasks, requiredTasks, currentTaskIndex } = get();
    const newCompleted = completedTasks + 1;
    const newIndex = currentTaskIndex + 1;
    const isUnlocked = newCompleted >= requiredTasks;

    set({
      completedTasks: newCompleted,
      currentTaskIndex: newIndex,
      isStopUnlocked: isUnlocked,
    });
  },

  stopRinging: async () => {
    const { isStopUnlocked } = get();
    if (!isStopUnlocked) return;

    await get().loadQuote();
    set({ isRinging: false });
  },

  loadQuote: async () => {
    set({ isLoadingQuote: true });
    try {
      const quote = await quoteRepository.getRandomQuote();
      set({ quote, isLoadingQuote: false });
    } catch {
      set({ isLoadingQuote: false });
    }
  },

  reset: () => set(initialState),
}));
