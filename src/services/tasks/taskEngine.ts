import type { Task } from "../../stores/types";
import type { AlarmTaskType } from "../../constants/types";

// MVP: Supporting core task types. Additional types fallback to math.
type TaskType = "math" | "color" | "shape" | "mixed";

function generateMathTask(index: number): Task {
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let a: number, b: number, answer: number;

  switch (operation) {
    case "+":
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      answer = a * b;
      break;
    default:
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
  }

  return {
    id: `math_${index}_${Date.now()}`,
    type: "math",
    question: `${a} ${operation} ${b} = ?`,
    answer,
  };
}

function generateColorTask(index: number): Task {
  const colors = [
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#00FF00" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Purple", hex: "#800080" },
    { name: "Orange", hex: "#FFA500" },
  ];
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  const options = shuffledColors.map(c => c.name);

  return {
    id: `color_${index}_${Date.now()}`,
    type: "color",
    question: `Tap the ${targetColor.name} color`,
    answer: targetColor.name,
    options,
    visualData: shuffledColors.map(c => ({ type: "color" as const, color: c.hex })),
  };
}

function generateShapeTask(index: number): Task {
  const shapes = [
    { name: "Circle", type: "circle" as const },
    { name: "Square", type: "square" as const },
    { name: "Triangle", type: "triangle" as const },
    { name: "Star", type: "star" as const },
  ];
  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  const shuffledShapes = [...shapes].sort(() => Math.random() - 0.5);
  const options = shuffledShapes.map(s => s.name);

  return {
    id: `shape_${index}_${Date.now()}`,
    type: "shape",
    question: `Select: ${targetShape.name}`,
    answer: targetShape.name,
    options,
    visualData: shuffledShapes.map(s => ({ type: "shape" as const, shape: s.type })),
  };
}

function safeGenerateTask(type: TaskType, index: number, attempt: number = 0): Task {
  try {
    let taskType = type;
    if (type === "mixed") {
      const types: TaskType[] = ["math", "color", "shape"];
      taskType = types[Math.floor(Math.random() * types.length)];
    }

    switch (taskType) {
      case "math":
        return generateMathTask(index);
      case "color":
        return generateColorTask(index);
      case "shape":
        return generateShapeTask(index);
      default:
        return generateMathTask(index);
    }
  } catch (err) {
    // Retry once, then fallback to math
    if (attempt === 0) {
      return safeGenerateTask(type, index, 1);
    }
    console.error("Task generation failed, using math fallback:", err);
    return generateMathTask(index);
  }
}

/**
 * Map AlarmTaskType to supported TaskType
 * MVP: Unimplemented types fall back to 'math'
 */
function mapTaskType(alarmTaskType: AlarmTaskType): TaskType {
  switch (alarmTaskType) {
    case "math":
    case "color":
    case "shape":
    case "mixed":
      return alarmTaskType;
    // Unimplemented types for MVP - fallback to math
    case "icon_match":
    case "position_tap":
    case "order_tap":
    case "count_objects":
      return "math";
    default:
      return "math";
  }
}

function getEffectiveTaskTypes(taskTypes: AlarmTaskType[]): TaskType[] {
  const allTypes: TaskType[] = ["math", "color", "shape"];

  // If mixed is included, use all types
  if (taskTypes.includes("mixed")) {
    return allTypes;
  }

  // Filter to only supported types, fallback to math if none
  const effective = taskTypes.filter(t => allTypes.includes(t as TaskType)) as TaskType[];
  return effective.length > 0 ? effective : ["math"];
}

export function generateTasks(count: number, alarmTaskTypes: AlarmTaskType | AlarmTaskType[]): Task[] {
  const tasks: Task[] = [];

  // Normalize to array
  const typesArray = Array.isArray(alarmTaskTypes) ? alarmTaskTypes : [alarmTaskTypes];
  const effectiveTypes = getEffectiveTaskTypes(typesArray);

  for (let i = 0; i < count; i++) {
    // Randomly select from effective types
    const selectedType = effectiveTypes[Math.floor(Math.random() * effectiveTypes.length)];
    tasks.push(safeGenerateTask(selectedType, i));
  }

  return tasks;
}

export function validateAnswer(task: Task, userAnswer: string | number): boolean {
  return String(task.answer).toLowerCase() === String(userAnswer).toLowerCase();
}
