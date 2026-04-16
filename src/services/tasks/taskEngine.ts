import type { Task } from "../../stores/types";
import type { AlarmTaskType, CustomQuestion } from "../../constants/types";
import { DEBUG } from "../../constants/AppConstants";
import { getReflectionQuestion } from "../../constants/defaultReflectionQuestions";

// V2.0: All supported task types
 type TaskType = "math" | "color" | "shape" | "mixed" | "icon_match" | "position_tap" | "order_tap" | "count_objects";

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

// V2.0: Icon Match Task - Find matching icons in a grid
function generateIconMatchTask(index: number): Task {
  const icons = [
    { name: "Coffee", symbol: "☕" },
    { name: "Phone", symbol: "📱" },
    { name: "Car", symbol: "🚗" },
    { name: "Book", symbol: "📚" },
    { name: "Star", symbol: "⭐" },
    { name: "Heart", symbol: "❤️" },
  ];

  const target = icons[Math.floor(Math.random() * icons.length)];
  const matches = Math.floor(Math.random() * 2) + 2; // 2-3 matches
  const distractors = 9 - matches;

  // Build grid: matches + distractors
  const gridItems = Array(matches).fill(target)
    .concat(Array(distractors).fill(null).map(() =>
      icons[Math.floor(Math.random() * icons.length)]
    ));

  // Shuffle
  const shuffled = gridItems.sort(() => Math.random() - 0.5);

  return {
    id: `icon_${index}_${Date.now()}`,
    type: "icon_match",
    question: `Find all ${target.name} icons`,
    answer: target.name,
    visualData: shuffled.map(item => ({ type: "icon" as const, icon: item.symbol, name: item.name })),
  };
}

// V2.0: Position Tap Task - Tap item at specific position
function generatePositionTapTask(index: number): Task {
  const colorNames: Record<string, string> = {
    "#FF0000": "RED",
    "#00FF00": "GREEN",
    "#0000FF": "BLUE",
    "#FFFF00": "YELLOW",
    "#FF00FF": "PURPLE",
  };
  const colors = Object.keys(colorNames);

  const targetColor = colors[Math.floor(Math.random() * colors.length)];

  // Build 2x2 or 3x3 grid
  const is3x3 = Math.random() > 0.5;
  const gridSize = is3x3 ? 9 : 4;
  const targetIndex = is3x3
    ? [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)] // corners + center
    : Math.floor(Math.random() * 4);

  const visualData = Array(gridSize).fill(null).map((_, i) => ({
    type: "position" as const,
    color: i === targetIndex ? targetColor : colors[Math.floor(Math.random() * colors.length)],
    isTarget: i === targetIndex,
  }));

  return {
    id: `position_${index}_${Date.now()}`,
    type: "position_tap",
    question: `Tap the ${colorNames[targetColor]} box`,
    answer: targetIndex,
    visualData,
  };
}

// V2.0: Order Tap Task - Tap items in sequence
function generateOrderTapTask(index: number): Task {
  const sequenceLength = Math.floor(Math.random() * 2) + 3; // 3-4 items
  const shapes = ["circle", "square", "triangle", "star"];
  const colors = ["#FF0000", "#00FF00", "#0000FF"];

  // Generate numbered items
  const items = Array(sequenceLength).fill(null).map((_, i) => ({
    number: i + 1,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  // Shuffle for display
  const displayItems = [...items].sort(() => Math.random() - 0.5);

  return {
    id: `order_${index}_${Date.now()}`,
    type: "order_tap",
    question: `Tap in order: 1, 2, 3${sequenceLength === 4 ? ", 4" : ""}`,
    answer: "completed", // Handled by tracking tap sequence
    visualData: displayItems.map(item => ({
      type: "ordered_item" as const,
      number: item.number,
      shape: item.shape,
      color: item.color,
    })),
  };
}

// V2.0: Count Objects Task - Count objects and enter number
function generateCountObjectsTask(index: number): Task {
  const shapes = ["circle", "square", "triangle"];
  const colorNames: Record<string, string> = {
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#00FF00",
    "yellow": "#FFFF00",
  };
  const colorKeys = Object.keys(colorNames);

  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  const targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  const targetColor = colorNames[targetColorKey];

  const targetCount = Math.floor(Math.random() * 5) + 3; // 3-7
  const distractorCount = Math.floor(Math.random() * 5) + 2; // 2-6

  // Generate visual data
  const targets = Array(targetCount).fill(null).map(() => ({
    type: "count_item" as const,
    shape: targetShape,
    color: targetColor,
    isTarget: true,
  }));

  const distractors = Array(distractorCount).fill(null).map(() => ({
    type: "count_item" as const,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colorNames[colorKeys[Math.floor(Math.random() * colorKeys.length)]],
    isTarget: false,
  }));

  const allItems = [...targets, ...distractors].sort(() => Math.random() - 0.5);

  return {
    id: `count_${index}_${Date.now()}`,
    type: "count_objects",
    question: `How many ${targetColorKey} ${targetShape}s?`,
    answer: targetCount,
    visualData: allItems,
  };
}

// V2.0: Reflection Task - Open-ended question
function generateReflectionTask(index: number): Task {
  const question = getReflectionQuestion(index);

  return {
    id: `reflection_${index}_${Date.now()}`,
    type: "reflection",
    question,
    answer: "", // Any non-empty text is valid
  };
}

// V2.0: Custom Question Task - User-created MCQ
function generateCustomQuestionTask(customQuestion: CustomQuestion, index: number): Task {
  return {
    id: `custom_${customQuestion.id}_${Date.now()}`,
    type: "custom",
    question: customQuestion.question,
    answer: customQuestion.correctAnswer,
    options: [...customQuestion.options].sort(() => Math.random() - 0.5),
  };
}

function safeGenerateTask(type: TaskType, index: number, attempt: number = 0): Task {
  try {
    let taskType = type;
    if (type === "mixed") {
      const types: TaskType[] = ["math", "color", "shape", "icon_match", "position_tap", "order_tap", "count_objects"];
      taskType = types[Math.floor(Math.random() * types.length)];
    }

    switch (taskType) {
      case "math":
        return generateMathTask(index);
      case "color":
        return generateColorTask(index);
      case "shape":
        return generateShapeTask(index);
      case "icon_match":
        return generateIconMatchTask(index);
      case "position_tap":
        return generatePositionTapTask(index);
      case "order_tap":
        return generateOrderTapTask(index);
      case "count_objects":
        return generateCountObjectsTask(index);
      default:
        return generateMathTask(index);
    }
  } catch (err) {
    // Retry once, then fallback to math
    if (attempt === 0) {
      return safeGenerateTask(type, index, 1);
    }
    if (DEBUG) console.error("Task generation failed, using math fallback:", err);
    return generateMathTask(index);
  }
}

/**
 * Map AlarmTaskType to supported TaskType
 * V2.0: All task types now implemented
 */
function mapTaskType(alarmTaskType: AlarmTaskType): TaskType {
  switch (alarmTaskType) {
    case "math":
    case "color":
    case "shape":
    case "mixed":
    case "icon_match":
    case "position_tap":
    case "order_tap":
    case "count_objects":
      return alarmTaskType;
    default:
      return "math";
  }
}

function getEffectiveTaskTypes(taskTypes: AlarmTaskType[]): TaskType[] {
  const allTypes: TaskType[] = ["math", "color", "shape", "icon_match", "position_tap", "order_tap", "count_objects"];

  // If mixed is included, use all types
  if (taskTypes.includes("mixed")) {
    return allTypes;
  }

  // Filter to only supported types, fallback to math if none
  const effective = taskTypes.filter(t => allTypes.includes(t as TaskType)) as TaskType[];
  return effective.length > 0 ? effective : ["math"];
}

/**
 * V2.0: Enhanced task generation with reflection and custom questions
 */
export function generateTasks(
  count: number,
  alarmTaskTypes: AlarmTaskType | AlarmTaskType[],
  options: {
    includeReflection?: boolean;
    includeCustomQuestions?: boolean;
    customQuestions?: CustomQuestion[];
  } = {}
): Task[] {
  const { includeReflection = false, includeCustomQuestions = false, customQuestions = [] } = options;
  const tasks: Task[] = [];

  // Normalize to array
  const typesArray = Array.isArray(alarmTaskTypes) ? alarmTaskTypes : [alarmTaskTypes];
  const effectiveTypes = getEffectiveTaskTypes(typesArray);

  // Calculate task distribution
  let regularCount = count;

  // Reserve 1 slot for reflection if enabled
  if (includeReflection) {
    regularCount -= 1;
  }

  // Reserve up to 2 slots for custom questions if enabled and available
  let customCount = 0;
  if (includeCustomQuestions && customQuestions.length > 0) {
    customCount = Math.min(2, customQuestions.length);
    regularCount -= customCount;
  }

  // Ensure at least 1 regular task if possible
  if (regularCount < 0) regularCount = 0;

  // Generate regular tasks
  for (let i = 0; i < regularCount; i++) {
    const selectedType = effectiveTypes[Math.floor(Math.random() * effectiveTypes.length)];
    tasks.push(safeGenerateTask(selectedType, i));
  }

  // Add custom questions (shuffled, max 2)
  if (customCount > 0) {
    const shuffled = [...customQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < customCount; i++) {
      tasks.push(generateCustomQuestionTask(shuffled[i], regularCount + i));
    }
  }

  // Add reflection as last task if enabled
  if (includeReflection) {
    tasks.push(generateReflectionTask(regularCount + customCount));
  }

  return tasks;
}

export function validateAnswer(task: Task, userAnswer: string | number): boolean {
  // V2.0: Reflection task accepts any non-empty text
  if (task.type === "reflection") {
    return typeof userAnswer === "string" && userAnswer.trim().length > 0;
  }

  // Order tap task is validated by tracking sequence separately
  if (task.type === "order_tap") {
    return userAnswer === "completed";
  }

  return String(task.answer).toLowerCase() === String(userAnswer).toLowerCase();
}
