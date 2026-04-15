import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAlarmStore } from "../../../stores/useAlarmStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";

import type { RootStackParamList } from "../../../navigation/RootStack";
import { useRingingStore } from "../../../stores/useRingingStore";
import { useAlarmAudio } from "../../../services/alarmAudioService";
import { generateTasks, validateAnswer } from "../../../services/tasks/taskEngine";
import type { Task } from "../../../stores/types";
import { styles } from "./styles";
import { formatTime } from "./helpers/utils";
import { renderShape } from "./helpers/shapes";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmRinging">;

export default function AlarmRingingScreen({ route, navigation }: Props) {
  const { alarmId } = route.params;
  const { startLoop, stop } = useAlarmAudio();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { timeFormat } = useSettingsStore();
  const use24Hour = timeFormat === "24h";

  const {
    alarmLabel,
    requiredTasks,
    completedTasks,
    isStopUnlocked,
    startRinging,
    completeCurrentTask,
    stopRinging,
    reset,
  } = useRingingStore();

  // Get current task from store
  const currentTask = useRingingStore(state => state.tasks[state.currentTaskIndex]);

  // Start ringing on mount
  useEffect(() => {
    const alarm = useAlarmStore.getState().alarms.find((a) => a.id === alarmId);
    const settings = useSettingsStore.getState();

    const taskCount = alarm?.taskCount ?? settings.defaultTaskCount ?? 4;
    const taskTypes = settings.defaultTaskTypes ?? ["math"];

    startRinging(alarmId, alarm?.label, taskCount);

    const tasks = generateTasks(taskCount, taskTypes);
    useRingingStore.setState({ tasks });

    startLoop();

    // Prevent back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

    return () => {
      backHandler.remove();
      stop();
    };
  }, [alarmId, startRinging, startLoop, stop]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswerSubmit = useCallback(() => {
    if (!currentTask) return;

    if (validateAnswer(currentTask, userAnswer)) {
      completeCurrentTask();
      setUserAnswer("");
      setError(null);
    } else {
      Keyboard.dismiss();
      setError("Wrong answer, try again");
      // Clear error after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  }, [currentTask, userAnswer, completeCurrentTask]);

  const handleOptionPress = useCallback((option: string) => {
    if (!currentTask) return;

    if (validateAnswer(currentTask, option)) {
      completeCurrentTask();
      setError(null);
    } else {
      setError("Wrong answer, try again");
      // Clear error after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  }, [currentTask, completeCurrentTask]);

  const handleStop = useCallback(async () => {
    if (!isStopUnlocked) return;

    await stopRinging();
    await stop();
    reset();
    navigation.navigate("Quote", { alarmId });
  }, [isStopUnlocked, stopRinging, stop, reset, navigation, alarmId]);

  const progress = requiredTasks > 0 ? (completedTasks / requiredTasks) * 100 : 0;

  const renderTaskContent = () => {
    if (!currentTask) {
      return (
        <View style={styles.taskCard}>
          <Text style={styles.taskQuestion}>All tasks completed!</Text>
        </View>
      );
    }

    if (currentTask.type === "math") {
      return (
        <View style={styles.taskCard}>
          <Text style={styles.taskQuestion}>{currentTask.question}</Text>
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="number-pad"
            placeholder="?"
            placeholderTextColor="#666"
            autoFocus
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAnswerSubmit}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Color or shape task with visual options
    const isColorTask = currentTask.type === "color";
    const isShapeTask = currentTask.type === "shape";

    return (
      <View style={styles.taskCard}>
        <Text style={styles.taskQuestion}>{currentTask.question}</Text>
        <View style={styles.optionsGrid}>
          {currentTask.options?.map((option, index) => {
            const visual = currentTask.visualData?.[index];

            if (isColorTask && visual?.type === "color") {
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.colorBox, { backgroundColor: visual.color }]}
                  onPress={() => handleOptionPress(option)}
                />
              );
            }

            if (isShapeTask && visual?.type === "shape") {
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.shapeContainer}
                  onPress={() => handleOptionPress(option)}
                >
                  {renderShape(visual.shape, styles.shapeSvg)}
                </TouchableOpacity>
              );
            }

            // Fallback to text button
            return (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with time */}
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(currentTime, use24Hour)}</Text>
        {alarmLabel && <Text style={styles.label}>{alarmLabel}</Text>}
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Completed {completedTasks} of {requiredTasks} tasks
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Task Area */}
      <View style={styles.taskContainer}>
        {renderTaskContent()}
      </View>

      {/* Stop Button */}
      <View style={styles.stopContainer}>
        <TouchableOpacity
          style={[styles.stopButton, !isStopUnlocked && styles.stopButtonDisabled]}
          onPress={handleStop}
          disabled={!isStopUnlocked}
        >
          <Text style={styles.stopText}>
            {isStopUnlocked ? "STOP ALARM" : "LOCKED"}
          </Text>
        </TouchableOpacity>
        {!isStopUnlocked && (
          <Text style={styles.lockedText}>
            Complete all tasks to unlock
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
