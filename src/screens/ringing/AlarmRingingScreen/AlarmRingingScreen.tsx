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
import { saveReflection } from "../../../data/repositories/reflectionRepository";

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

  // V2.0: State for reflection text input
  const [reflectionText, setReflectionText] = useState("");

  // Start ringing on mount
  useEffect(() => {
    const alarm = useAlarmStore.getState().alarms.find((a) => a.id === alarmId);
    const settings = useSettingsStore.getState();

    // Always use current settings, not the alarm's saved taskCount
    const taskCount = settings.defaultTaskCount ?? 5;
    const taskTypes = settings.defaultTaskTypes ?? ["math"];

    // V2.0: Get reflection and custom questions settings
    const includeReflection = settings.enableReflection ?? true;
    const includeCustomQuestions = settings.enableCustomQuestions ?? true;
    const customQuestions = settings.customQuestions ?? [];

    if (DEBUG) {
      console.log("AlarmRingingScreen - settings.defaultTaskCount:", settings.defaultTaskCount);
      console.log("AlarmRingingScreen - final taskCount:", taskCount);
      console.log("AlarmRingingScreen - includeReflection:", includeReflection);
      console.log("AlarmRingingScreen - includeCustomQuestions:", includeCustomQuestions);
    }

    startRinging(alarmId, alarm?.label, taskCount);

    // V2.0: Use enhanced generateTasks with reflection and custom questions
    const tasks = generateTasks(taskCount, taskTypes, {
      includeReflection,
      includeCustomQuestions,
      customQuestions,
    });
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

  const handleAnswerSubmit = useCallback(async () => {
    if (!currentTask) return;

    // V2.0: Save reflection response to database
    if (currentTask.type === "reflection") {
      if (validateAnswer(currentTask, userAnswer)) {
        // Save reflection to database
        try {
          await saveReflection(alarmId, currentTask.question, userAnswer);
        } catch (err) {
          console.error("Failed to save reflection:", err);
          // Continue even if save fails - don't block the user
        }
        completeCurrentTask();
        setUserAnswer("");
        setError(null);
      } else {
        setError("Please enter a response");
        setTimeout(() => setError(null), 2000);
      }
      return;
    }

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
  }, [currentTask, userAnswer, completeCurrentTask, alarmId]);

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

    // V2.0: Handle reflection task (open-ended text input)
    if (currentTask.type === "reflection") {
      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          <TextInput
            style={[styles.input, styles.reflectionInput, { borderColor: t.border.default, color: t.text.primary, backgroundColor: t.bg.surface }]}
            value={reflectionText}
            onChangeText={setReflectionText}
            placeholder="Type your response..."
            placeholderTextColor={t.text.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: reflectionText.trim() ? t.action.primaryBg : t.text.secondary },
            ]}
            onPress={() => {
              setUserAnswer(reflectionText);
              handleAnswerSubmit();
            }}
            disabled={!reflectionText.trim()}
          >
            <Text style={[styles.submitText, { color: reflectionText.trim() ? t.action.primaryText : t.bg.app }]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // V2.0: Handle count_objects task (number input)
    if (currentTask.type === "count_objects") {
      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          {/* Visual display of objects */}
          <View style={styles.objectsGrid}>
            {currentTask.visualData?.map((item, index) => {
              const shapeItem = item as { shape: "circle" | "square" | "triangle" | "star"; color: string };
              return (
                <View key={index} style={styles.objectItem}>
                  {renderShape(shapeItem.shape, { width: 30, height: 30, fill: shapeItem.color })}
                </View>
              );
            })}
          </View>
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
