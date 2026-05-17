import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useThemeTokens } from "../../../theme";
import { useNightGuideStore } from "../../../stores/useNightGuideStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { TopHeader } from "../../../components/ui";
import { NIGHT_GUIDE_TITLE } from "../../../constants/nightGuideConstants";
import type { RootStackParamList } from "../../../navigation/RootStack";
import type { NightGuide, NightGuideTask } from "../../../constants/types";
import * as nightGuideRepository from "../../../data/repositories/nightGuideRepository";
import { styles } from "./styles";

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type FormRoute = RouteProp<RootStackParamList, "NightGuideForm">;

const WEEKDAY_LABELS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function formatTwoDigit(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseTimeToHoursMinutes(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h ?? 22, minutes: m ?? 0 };
}

export default function NightGuideFormScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<FormRoute>();
  const { addGuide, updateGuide } = useNightGuideStore();
  const { timeFormat } = useSettingsStore();
  const use24Hour = timeFormat === "24h";

  const editingId = route.params?.nightGuideId;
  const isEditing = !!editingId;

  const [time, setTime] = useState({ hours: 22, minutes: 0 });
  const [label, setLabel] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isOneTime, setIsOneTime] = useState(false);
  const [tasks, setTasks] = useState<NightGuideTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  useEffect(() => {
    if (editingId) {
      loadExistingGuide(editingId);
    }
  }, [editingId]);

  const loadExistingGuide = async (id: string) => {
    setIsLoadingExisting(true);
    try {
      const guide = await nightGuideRepository.getNightGuideById(id);
      if (!guide) {
        Alert.alert("Error", "Night guide not found");
        navigation.goBack();
        return;
      }
      setTime(parseTimeToHoursMinutes(guide.time));
      setLabel(guide.label ?? "");
      setWeekdays(guide.weekdays);
      setIsOneTime(guide.weekdays.length === 0);
      const existingTasks = await nightGuideRepository.getTasksForNightGuide(id);
      setTasks(existingTasks);
    } catch (err) {
      console.error("Failed to load existing night guide:", err);
      Alert.alert("Error", "Could not load the night guide. It may have been deleted.");
      navigation.goBack();
    }
    setIsLoadingExisting(false);
  };

  const adjustTime = useCallback((field: "hours" | "minutes", delta: number) => {
    setTime((prev) => {
      const newValue = prev[field] + delta;
      if (field === "hours") {
        if (!use24Hour) {
          return { ...prev, hours: ((newValue % 12) + 12) % 12 || 12 };
        }
        return { ...prev, hours: ((newValue % 24) + 24) % 24 };
      }
      return { ...prev, minutes: ((newValue % 60) + 60) % 60 };
    });
  }, [use24Hour]);

  const formatDisplayHour = (h: number) => {
    if (use24Hour) return formatTwoDigit(h);
    return String(h % 12 || 12);
  };

  const toggleWeekday = useCallback((day: number) => {
    setWeekdays((prev) => {
      if (prev.includes(day)) {
        const next = prev.filter((d) => d !== day);
        return next.length === 0 ? [day] : next;
      }
      return [...prev, day].sort();
    });
  }, []);

  const addTask = useCallback(() => {
    const text = newTaskText.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: generateId(), nightGuideId: editingId ?? "", text, order: prev.length },
    ]);
    setNewTaskText("");
    Keyboard.dismiss();
  }, [newTaskText, editingId]);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.filter((t) => t.id !== id).map((t, i) => ({ ...t, order: i }))
    );
  }, []);

  const handleSave = useCallback(async () => {
    const timeStr = `${formatTwoDigit(time.hours)}:${formatTwoDigit(time.minutes)}`;
    const now = Date.now();
    const guide: NightGuide = {
      id: editingId ?? generateId(),
      time: timeStr,
      weekdays: isOneTime ? [] : weekdays,
      enabled: true,
      label: label.trim() || undefined,
      soundType: "notification",
      soundName: "Default",
      createdAt: isEditing ? (await nightGuideRepository.getNightGuideById(editingId!))?.createdAt ?? now : now,
      updatedAt: now,
    };

    if (!isOneTime && weekdays.length === 0) {
      Alert.alert("Select Days", "Please select at least one day for the guide.");
      return;
    }

    if (isEditing) {
      await updateGuide(guide, tasks);
    } else {
      await addGuide(guide, tasks);
    }

    navigation.goBack();
  }, [editingId, time, weekdays, isOneTime, label, tasks, addGuide, updateGuide, navigation]);

  const toggleAmPm = useCallback(() => {
    setTime((prev) => ({ ...prev, hours: (prev.hours + 12) % 24 }));
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
      {isLoadingExisting ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: t.text.secondary, fontSize: 16 }}>Loading...</Text>
        </View>
      ) : (
      <>
      <TopHeader
        title={isEditing ? `Edit ${NIGHT_GUIDE_TITLE}` : `New ${NIGHT_GUIDE_TITLE}`}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
        >
          {/* Time Picker - matching alarm form style */}
          <View style={[styles.timeCard, { backgroundColor: t.bg.surface }]}>
            <Text style={[styles.fieldLabel, { color: t.text.secondary }]}>Time</Text>
            <View style={styles.timeRow}>
              <PanGestureHandler
                onGestureEvent={({ nativeEvent }) => {
                  if (nativeEvent.translationY < -20) {
                    adjustTime("hours", 1);
                  } else if (nativeEvent.translationY > 20) {
                    adjustTime("hours", -1);
                  }
                }}
              >
                <View style={styles.timeUnit}>
                  <TouchableOpacity
                    onPress={() => adjustTime("hours", 1)}
                    style={styles.timeBtn}
                  >
                    <Ionicons name="chevron-up" size={24} color={t.icon.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.timeValue, { color: t.text.primary }]}>
                    {formatDisplayHour(time.hours)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjustTime("hours", -1)}
                    style={styles.timeBtn}
                  >
                    <Ionicons name="chevron-down" size={24} color={t.icon.primary} />
                  </TouchableOpacity>
                </View>
              </PanGestureHandler>

              <Text style={[styles.colon, { color: t.text.primary }]}>:</Text>

              <PanGestureHandler
                onGestureEvent={({ nativeEvent }) => {
                  if (nativeEvent.translationY < -20) {
                    adjustTime("minutes", 1);
                  } else if (nativeEvent.translationY > 20) {
                    adjustTime("minutes", -1);
                  }
                }}
              >
                <View style={styles.timeUnit}>
                  <TouchableOpacity
                    onPress={() => adjustTime("minutes", 1)}
                    style={styles.timeBtn}
                  >
                    <Ionicons name="chevron-up" size={24} color={t.icon.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.timeValue, { color: t.text.primary }]}>
                    {formatTwoDigit(time.minutes)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjustTime("minutes", -1)}
                    style={styles.timeBtn}
                  >
                    <Ionicons name="chevron-down" size={24} color={t.icon.primary} />
                  </TouchableOpacity>
                </View>
              </PanGestureHandler>

              {!use24Hour && (
                <View style={styles.ampmContainer}>
                  <TouchableOpacity
                    onPress={toggleAmPm}
                    style={[styles.ampmBtn, { backgroundColor: t.action.secondaryBg }]}
                  >
                    <Text style={[styles.ampmText, { color: t.text.primary }]}>
                      {time.hours >= 12 ? "PM" : "AM"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Label */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: t.text.secondary }]}>Label (optional)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: t.bg.surface, color: t.text.primary, borderColor: t.border.default },
              ]}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Wind down routine"
              placeholderTextColor={t.text.secondary}
              maxLength={40}
            />
          </View>

          {/* One-time toggle */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => setIsOneTime(!isOneTime)}
          >
            <Text style={[styles.switchLabel, { color: t.text.primary }]}>One-time (no repeat)</Text>
            <View
              style={[
                styles.toggle,
                { backgroundColor: isOneTime ? t.action.primaryBg : t.border.default },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: t.action.primaryText,
                    transform: [{ translateX: isOneTime ? 20 : 0 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Weekday selector */}
          {!isOneTime && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: t.text.secondary }]}>Repeat</Text>
              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS_SHORT.map((dayLabel, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.weekdayBtn,
                      {
                        backgroundColor: weekdays.includes(i)
                          ? t.action.primaryBg
                          : t.bg.surface,
                        borderColor: t.border.default,
                      },
                    ]}
                    onPress={() => toggleWeekday(i)}
                  >
                    <Text
                      style={[
                        styles.weekdayLabel,
                        {
                          color: weekdays.includes(i) ? t.action.primaryText : t.text.primary,
                        },
                      ]}
                    >
                      {dayLabel[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Tasks */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: t.text.secondary }]}>
              Tasks (optional)
            </Text>
            {tasks.map((task) => (
              <View
                key={task.id}
                style={[styles.taskRow, { borderBottomColor: t.border.subtle }]}
              >
                <Text style={[styles.taskText, { color: t.text.primary }]}>
                  {task.text}
                </Text>
                <TouchableOpacity onPress={() => removeTask(task.id)}>
                  <Ionicons name="close-circle" size={20} color={t.state.error} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addTaskRow}>
              <TextInput
                style={[
                  styles.taskInput,
                  {
                    backgroundColor: t.bg.surface,
                    color: t.text.primary,
                    borderColor: t.border.default,
                  },
                ]}
                value={newTaskText}
                onChangeText={setNewTaskText}
                placeholder="Add a task..."
                placeholderTextColor={t.text.secondary}
                onSubmitEditing={addTask}
                returnKeyType="done"
                maxLength={60}
              />
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: t.action.primaryBg }]}
                onPress={addTask}
                disabled={!newTaskText.trim()}
              >
                <Ionicons name="add" size={20} color={t.action.primaryText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: t.action.primaryBg }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { color: t.action.primaryText }]}>
              {isEditing ? "Update" : "Create"} {NIGHT_GUIDE_TITLE} Guide
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      </>
      )}
    </SafeAreaView>
  );
}
