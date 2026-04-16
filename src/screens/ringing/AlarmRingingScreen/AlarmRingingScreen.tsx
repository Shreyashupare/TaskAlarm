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
import { useThemeTokens } from "../../../theme";
import { DEBUG } from "../../../constants/AppConstants";
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
  const t = useThemeTokens();

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

    // Always use current settings, not the alarm's saved taskCount
    const taskCount = settings.defaultTaskCount ?? 5;
    const taskTypes = settings.defaultTaskTypes ?? ["math"];

    if (DEBUG) {
      console.log("AlarmRingingScreen - settings.defaultTaskCount:", settings.defaultTaskCount);
      console.log("AlarmRingingScreen - final taskCount:", taskCount);
    }

    startRinging(alarmId, alarm?.label, taskCount);

    const tasks = generateTasks(taskCount, taskTypes);
    if (DEBUG) console.log("AlarmRingingScreen - generated tasks count:", tasks.length);
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
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>All tasks completed!</Text>
        </View>
      );
    }

    if (currentTask.type === "math") {
      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          <TextInput
            style={[styles.input, { borderColor: t.border.default, color: t.text.primary, backgroundColor: t.bg.surface }]}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="number-pad"
            placeholder="?"
            placeholderTextColor={t.text.secondary}
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: userAnswer.trim() ? t.action.primaryBg : t.text.secondary },
            ]}
            onPress={handleAnswerSubmit}
            disabled={!userAnswer.trim()}
          >
            <Text style={[styles.submitText, { color: userAnswer.trim() ? t.action.primaryText : t.bg.app }]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Color or shape task with visual options
    const isColorTask = currentTask.type === "color";
    const isShapeTask = currentTask.type === "shape";

    return (
      <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
        <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
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
                style={[styles.optionButton, { backgroundColor: t.action.secondaryBg }]}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={[styles.optionText, { color: t.action.secondaryText }]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      {/* Header with time */}
      <View style={styles.header}>
        <Text style={[styles.time, { color: t.text.primary }]}>{formatTime(currentTime, use24Hour)}</Text>
        {alarmLabel && <Text style={[styles.label, { color: t.text.secondary }]}>{alarmLabel}</Text>}
      </View>

      {/* Error Banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: t.action.dangerBg }]}>
          <Text style={[styles.errorBannerText, { color: t.action.dangerText }]}>{error}</Text>
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: t.text.primary }]}>
          Completed {completedTasks} of {requiredTasks} tasks
        </Text>
        <View style={[styles.progressBar, { backgroundColor: t.border.subtle }]}>
          <View style={[styles.progressFill, { backgroundColor: t.action.primaryBg, width: `${progress}%` }]} />
        </View>
      </View>

      {/* Task Area */}
      <View style={styles.taskContainer}>
        {renderTaskContent()}
      </View>

      {/* Stop Button */}
      <View style={styles.stopContainer}>
        <TouchableOpacity
          style={[
            styles.stopButton,
            { backgroundColor: isStopUnlocked ? t.action.dangerBg : t.text.secondary },
          ]}
          onPress={handleStop}
          disabled={!isStopUnlocked}
        >
          <Text style={[styles.stopText, { color: isStopUnlocked ? t.action.dangerText : t.bg.app }]}>
            {isStopUnlocked ? "STOP ALARM" : "LOCKED"}
          </Text>
        </TouchableOpacity>
        {!isStopUnlocked && (
          <Text style={[styles.lockedText, { color: t.text.secondary }]}>
            Complete all tasks to unlock
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
