import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeTokens } from "../../../theme";
import type { NightGuideTask } from "../../../constants/types";
import { styles } from "./styles";

type TaskChecklistProps = {
  tasks: NightGuideTask[];
  onComplete: (completedCount: number, completedIds: string[]) => void;
  /** When true, tasks are shown with checkmarks but not tappable */
  readOnly?: boolean;
  /** Pre-filled completed task indices for read-only view */
  completedTaskIds?: string[];
};

export default function TaskChecklist({ tasks, onComplete, readOnly = false, completedTaskIds = [] }: TaskChecklistProps) {
  const t = useThemeTokens();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Initialize completed IDs from completedTaskIds (readOnly view)
  useEffect(() => {
    if (completedTaskIds && completedTaskIds.length > 0) {
      const ids = new Set(completedTaskIds);
      setCompletedIds(ids);
    }
  }, [completedTaskIds, tasks]);

  const handleToggle = (id: string) => {
    if (readOnly) return;
    const next = new Set(completedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCompletedIds(next);
    onComplete(next.size, Array.from(next));
  };

  const allDone = completedIds.size === tasks.length && tasks.length > 0;

  return (
    <View style={styles.container}>
      {!readOnly && (
        <Text style={[styles.title, { color: t.text.primary }]}>
          Bedtime Checklist
        </Text>
      )}
      {tasks.map((task) => {
        const done = completedIds.has(task.id);
        return (
          <TouchableOpacity
            key={task.id}
            style={styles.row}
            onPress={() => handleToggle(task.id)}
            disabled={readOnly}
          >
            <Ionicons
              name={done ? "checkbox" : "square-outline"}
              size={24}
              color={done ? t.state.success : t.icon.secondary}
            />
            <Text
              style={[
                styles.taskText,
                {
                  color: done ? t.text.secondary : t.text.primary,
                  textDecorationLine: done ? "line-through" : "none",
                  opacity: done ? 0.6 : 1,
                },
              ]}
            >
              {task.text}
            </Text>
          </TouchableOpacity>
        );
      })}
      {allDone && (
        <View style={styles.allDoneBanner}>
          <Ionicons name="checkmark-done-circle" size={24} color={t.state.success} />
          <Text style={[styles.allDoneText, { color: t.state.success }]}>
            All tasks complete!
          </Text>
        </View>
      )}
    </View>
  );
}
