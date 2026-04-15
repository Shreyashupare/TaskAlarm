import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAlarmStore } from "../../../stores/useAlarmStore";

import type { RootStackParamList } from "../../../navigation/RootStack";
import { useRingingStore } from "../../../stores/useRingingStore";
import { useAlarmAudio } from "../../../services/alarmAudioService";
import { generateTasks, validateAnswer } from "../../../services/tasks/taskEngine";
import type { Task } from "../../../stores/types";
import { styles } from "./styles";
import { formatTime } from "./helpers/utils";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmRinging">;

export default function AlarmRingingScreen({ route, navigation }: Props) {
  const { alarmId } = route.params;
  const { startLoop, stop } = useAlarmAudio();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    const taskCount = alarm?.taskCount ?? 4;
    const taskType = alarm?.taskType ?? "math";

    startRinging(alarmId, alarm?.label, taskCount);

    const tasks = generateTasks(taskCount, taskType);
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
      setError("Wrong answer, try again");
    }
  }, [currentTask, userAnswer, completeCurrentTask]);

  const handleOptionPress = useCallback((option: string) => {
    if (!currentTask) return;

    if (validateAnswer(currentTask, option)) {
      completeCurrentTask();
      setError(null);
    } else {
      setError("Wrong answer, try again");
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
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );
    }

    // Color or shape task with options
    return (
      <View style={styles.taskCard}>
        <Text style={styles.taskQuestion}>{currentTask.question}</Text>
        <View style={styles.optionsGrid}>
          {currentTask.options?.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with time */}
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(currentTime)}</Text>
        {alarmLabel && <Text style={styles.label}>{alarmLabel}</Text>}
      </View>

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
