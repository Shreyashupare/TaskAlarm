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

  // V2.0: State for mini tasks
  const [selectedIcons, setSelectedIcons] = useState<Set<number>>(new Set()); // For icon_match
  const [orderTapSequence, setOrderTapSequence] = useState<number[]>([]); // For order_tap
  const [expectedOrderSequence, setExpectedOrderSequence] = useState<number[]>([]); // Track expected order

  // Start ringing on mount - check for existing persisted state
  useEffect(() => {
    const alarm = useAlarmStore.getState().alarms.find((a) => a.id === alarmId);
    const settings = useSettingsStore.getState();

    // Check if we have existing persisted state for this alarm
    const existingState = useRingingStore.getState();
    const isResuming = existingState.isRinging && existingState.alarmId === alarmId && existingState.tasks.length > 0;

    if (isResuming) {
      if (DEBUG) console.log("AlarmRingingScreen - Resuming existing alarm session:", alarmId,
        "progress:", existingState.completedTasks, "/", existingState.requiredTasks);

      // Just restart audio, don't reset progress
      startLoop(alarmId, alarm?.label, alarm?.soundUri, alarm?.vibration ?? true);
    } else {
      // Fresh alarm start - use current settings
      const taskCount = settings.defaultTaskCount ?? 5;
      const taskTypes = settings.defaultTaskTypes ?? ["math"];

      // V2.0: Get reflection and custom questions settings
      const includeReflection = settings.enableReflection ?? true;
      const includeCustomQuestions = settings.enableCustomQuestions ?? true;
      const customQuestions = settings.customQuestions ?? [];

      // Get alarm sound and vibration settings
      const soundUri = alarm?.soundUri;
      const vibration = alarm?.vibration ?? true;

      if (DEBUG) {
        console.log("AlarmRingingScreen - Starting fresh alarm:", alarmId);
        console.log("AlarmRingingScreen - taskCount:", taskCount);
        console.log("AlarmRingingScreen - includeReflection:", includeReflection);
        console.log("AlarmRingingScreen - includeCustomQuestions:", includeCustomQuestions);
        console.log("AlarmRingingScreen - soundUri:", soundUri);
        console.log("AlarmRingingScreen - vibration:", vibration);
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

      // Start alarm audio with custom sound and vibration settings
      startLoop(alarmId, alarm?.label, soundUri, vibration);
    }

    // Prevent back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

    return () => {
      backHandler.remove();
      // Don't stop audio on unmount - let it continue if app is reopened
    };
  }, [alarmId, startRinging, startLoop, stop]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset mini task state when task changes
  useEffect(() => {
    setSelectedIcons(new Set());
    setOrderTapSequence([]);
    // Build expected sequence for order_tap task
    if (currentTask?.type === "order_tap" && currentTask.visualData) {
      const items = currentTask.visualData as Array<{ number: number }>;
      const expected = items.map((_, i) => i + 1).sort((a, b) => a - b);
      setExpectedOrderSequence(expected);
    }
  }, [currentTask?.id]);

  const handleAnswerSubmit = useCallback(async (submittedAnswer?: string) => {
    if (!currentTask) return;

    // DEBUG: Log submission details
    if (DEBUG) {
      console.log("[DEBUG] handleAnswerSubmit called:");
      console.log("[DEBUG] - submittedAnswer param:", JSON.stringify(submittedAnswer));
      console.log("[DEBUG] - userAnswer state:", JSON.stringify(userAnswer));
      console.log("[DEBUG] - reflectionText state:", JSON.stringify(reflectionText));
      console.log("[DEBUG] - currentTask.type:", currentTask.type);
    }

    // Use submitted answer if provided (for reflection), otherwise use userAnswer state
    const answerToValidate = submittedAnswer !== undefined ? submittedAnswer : userAnswer;

    if (DEBUG) {
      console.log("[DEBUG] - answerToValidate:", JSON.stringify(answerToValidate));
      console.log("[DEBUG] - validateAnswer result:", validateAnswer(currentTask, answerToValidate));
    }

    // V2.0: Save reflection response to database
    if (currentTask.type === "reflection") {
      if (validateAnswer(currentTask, answerToValidate)) {
        if (DEBUG) console.log("[DEBUG] Reflection answer valid, saving...");
        // Save reflection to database
        try {
          await saveReflection(alarmId, currentTask.question, answerToValidate);
        } catch (err) {
          console.error("Failed to save reflection:", err);
          // Continue even if save fails - don't block the user
        }
        completeCurrentTask();
        setUserAnswer("");
        setReflectionText(""); // Clear reflection input
        setError(null);
      } else {
        if (DEBUG) console.log("[DEBUG] Reflection answer INVALID - showing error");
        setError("Please enter a response");
        setTimeout(() => setError(null), 2000);
      }
      return;
    }

    if (validateAnswer(currentTask, answerToValidate)) {
      completeCurrentTask();
      setUserAnswer("");
      setError(null);
    } else {
      Keyboard.dismiss();
      setError("Wrong answer, try again");
      // Clear error after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  }, [currentTask, completeCurrentTask, userAnswer, alarmId]);

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
              // Pass reflectionText directly to avoid async state issues
              handleAnswerSubmit(reflectionText);
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
            onPress={() => handleAnswerSubmit()}
            disabled={!userAnswer.trim()}
          >
            <Text style={[styles.submitText, { color: userAnswer.trim() ? t.action.primaryText : t.bg.app }]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // V2.0: Icon Match Task - Tap all matching icons
    if (currentTask.type === "icon_match") {
      const targetName = currentTask.answer as string;
      const visualItems = currentTask.visualData as Array<{ icon: string; name: string }> || [];
      const targetCount = visualItems.filter(item => item.name === targetName).length;
      const selectedCount = selectedIcons.size;

      const handleIconPress = (index: number) => {
        const newSelected = new Set(selectedIcons);
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
        setSelectedIcons(newSelected);
      };

      const handleIconSubmit = () => {
        // Check if all selected icons are correct matches
        const selectedArray = Array.from(selectedIcons);
        const allCorrect = selectedArray.every(idx => visualItems[idx]?.name === targetName);
        const allTargetsSelected = selectedArray.length === targetCount && allCorrect;

        if (allTargetsSelected) {
          completeCurrentTask();
          setSelectedIcons(new Set());
        } else {
          setError("Keep looking! Tap all matching icons");
          setTimeout(() => setError(null), 2000);
        }
      };

      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          <Text style={[styles.orderInstruction, { color: t.text.secondary }]}>
            Found: {selectedCount}/{targetCount}
          </Text>
          <View style={styles.iconGrid}>
            {visualItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.iconButton,
                  selectedIcons.has(index) && styles.iconButtonSelected,
                ]}
                onPress={() => handleIconPress(index)}
              >
                <Text style={styles.iconText}>{item.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.iconSubmitButton,
              { backgroundColor: selectedCount === targetCount ? t.action.primaryBg : t.border.default },
            ]}
            onPress={handleIconSubmit}
            disabled={selectedCount !== targetCount}
          >
            <Text style={[styles.submitText, { color: selectedCount === targetCount ? t.action.primaryText : t.bg.app }]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // V2.0: Position Tap Task - Tap the colored box at specific position
    if (currentTask.type === "position_tap") {
      const visualItems = currentTask.visualData as Array<{ color: string; isTarget: boolean }> || [];

      const handlePositionPress = (index: number) => {
        const item = visualItems[index];
        if (item?.isTarget) {
          completeCurrentTask();
        } else {
          setError("Wrong box! Try again");
          setTimeout(() => setError(null), 1500);
        }
      };

      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          <View style={styles.positionGrid}>
            {visualItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.positionBox, { backgroundColor: item.color }]
                }
                onPress={() => handlePositionPress(index)}
              />
            ))}
          </View>
        </View>
      );
    }

    // V2.0: Order Tap Task - Tap items in sequence (1, 2, 3...)
    if (currentTask.type === "order_tap") {
      const visualItems = currentTask.visualData as Array<{ number: number; shape: string; color: string }> || [];
      const expectedNext = orderTapSequence.length + 1;

      const handleOrderPress = (itemNumber: number) => {
        if (itemNumber === expectedNext) {
          const newSequence = [...orderTapSequence, itemNumber];
          setOrderTapSequence(newSequence);

          // Check if sequence is complete
          if (newSequence.length === visualItems.length) {
            completeCurrentTask();
            setOrderTapSequence([]);
          }
        } else {
          setError(`Wrong order! Tap number ${expectedNext} next`);
          setTimeout(() => setError(null), 1500);
        }
      };

      return (
        <View style={[styles.taskCard, { backgroundColor: t.bg.surfaceElevated }]}>
          <Text style={[styles.taskQuestion, { color: t.text.primary }]}>{currentTask.question}</Text>
          <Text style={[styles.orderInstruction, { color: t.text.secondary }]}>
            Progress: {orderTapSequence.length}/{visualItems.length}
          </Text>
          <View style={styles.orderGrid}>
            {visualItems.map((item, index) => {
              const isTapped = orderTapSequence.includes(item.number);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.orderItem,
                    isTapped && styles.orderItemTapped,
                  ]}
                  onPress={() => !isTapped && handleOrderPress(item.number)}
                  disabled={isTapped}
                >
                  <Text style={styles.iconText}>{item.number}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
            onPress={() => handleAnswerSubmit()}
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
