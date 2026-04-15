import type { AlarmTaskType } from "../../../../constants/types";

export const TASK_TYPES: { value: AlarmTaskType; label: string }[] = [
  { value: "math", label: "Math" },
  { value: "color", label: "Color Match" },
  { value: "shape", label: "Shape Match" },
  { value: "mixed", label: "Mixed" },
];

export const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
] as const;
