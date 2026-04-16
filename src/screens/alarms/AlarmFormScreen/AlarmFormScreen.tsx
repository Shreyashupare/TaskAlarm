import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PanGestureHandler } from "react-native-gesture-handler";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import type { RootStackParamList } from "../../../navigation/RootStack";
import { useThemeTokens } from "../../../theme";
import { useAlarmStore } from "../../../stores/useAlarmStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { scheduleAlarm } from "../../../services/alarmScheduler";
import { AppButton, AppSwitch, TopHeader } from "../../../components/ui";
import type { Alarm } from "../../../constants/types";
import { WEEKDAYS } from "./helpers/constants";
import { generateId, formatTwoDigit } from "./helpers/utils";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmForm">;

export default function AlarmFormScreen({ route, navigation }: Props) {
  const t = useThemeTokens();
  const { alarmId } = route.params || {};
  const isEdit = Boolean(alarmId);
  const { alarms, addAlarm, updateAlarm, loadAlarms } = useAlarmStore();
  const { timeFormat, defaultTaskCount } = useSettingsStore();
  const use24Hour = timeFormat === "24h";

  const [time, setTime] = useState({ hours: 7, minutes: 0 });
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [label, setLabel] = useState("");
  const [vibration, setVibration] = useState(true);
  const [soundType, setSoundType] = useState<"default" | "custom">("default");
  const [soundName, setSoundName] = useState("Default");
  const [soundUri, setSoundUri] = useState<string | undefined>(undefined);
  const [taskCount, setTaskCount] = useState(defaultTaskCount ?? 4);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  useEffect(() => {
    if (isEdit && alarmId) {
      const alarm = alarms.find((a: Alarm) => a.id === alarmId);
      if (alarm) {
        const [h, m] = alarm.time.split(":").map(Number);
        setTime({ hours: h, minutes: m });
        setWeekdays(alarm.weekdays);
        setLabel(alarm.label ?? "");
        setVibration(alarm.vibration);
        setSoundType(alarm.soundType);
        setSoundName(alarm.soundName);
        setSoundUri(alarm.soundUri);
        setTaskCount(alarm.taskCount);
      }
    }
  }, [isEdit, alarmId, alarms]);

  // Update taskCount when defaultTaskCount changes from settings (for new alarms only)
  useEffect(() => {
    if (!isEdit) {
      setTaskCount(defaultTaskCount ?? 4);
    }
  }, [defaultTaskCount, isEdit]);

  const toggleWeekday = (day: number) => {
    setWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    const timeStr = `${formatTwoDigit(time.hours)}:${formatTwoDigit(time.minutes)}`;
    const now = Date.now();

    const alarmData: Alarm = {
      id: isEdit && alarmId ? alarmId : generateId(),
      time: timeStr,
      weekdays,
      enabled: true,
      label: label || undefined,
      soundType,
      soundName,
      soundUri,
      vibration,
      taskType: "math", // Uses global settings at ring time
      taskCount, // Use the state value (loaded from alarm in edit mode, or default for new)
      createdAt: isEdit ? (alarms.find(a => a.id === alarmId)?.createdAt ?? now) : now,
      updatedAt: now,
    };

    if (isEdit) {
      await updateAlarm(alarmData);
    } else {
      await addAlarm(alarmData);
    }

    await scheduleAlarm(alarmData);

    navigation.goBack();
  };

  const adjustTime = (field: "hours" | "minutes", delta: number) => {
    setTime(prev => {
      const newValue = prev[field] + delta;
      if (field === "hours") {
        // For 12-hour mode, allow 1-12, for 24-hour allow 0-23
        if (!use24Hour) {
          return { ...prev, hours: ((newValue % 12) + 12) % 12 || 12 };
        }
        return { ...prev, hours: ((newValue % 24) + 24) % 24 };
      }
      return { ...prev, minutes: ((newValue % 60) + 60) % 60 };
    });
  };

  const formatDisplayHour = (h: number) => {
    if (use24Hour) {
      return formatTwoDigit(h);
    }
    // Convert 24h to 12h display: 0->12, 13->1, etc.
    const displayHour = h % 12 || 12;
    return String(displayHour);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      <TopHeader title={isEdit ? "Edit Alarm" : "New Alarm"} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Time
          </Text>
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
                  onPress={() => setTime(prev => ({ ...prev, hours: prev.hours >= 12 ? prev.hours - 12 : prev.hours + 12 }))}
                  style={styles.ampmBtn}
                >
                  <Text style={[styles.ampmText, { color: t.text.primary }]}>
                    {time.hours >= 12 ? "PM" : "AM"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Weekdays */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Repeat
          </Text>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day: typeof WEEKDAYS[number]) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => toggleWeekday(day.value)}
                style={[
                  styles.weekdayBtn,
                  {
                    backgroundColor: weekdays.includes(day.value)
                      ? t.action.primaryBg
                      : t.border.subtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    {
                      color: weekdays.includes(day.value)
                        ? t.action.primaryText
                        : t.text.secondary,
                    },
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Label */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Label (Optional)
          </Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Morning Workout"
            placeholderTextColor={t.text.secondary}
            style={[
              styles.input,
              {
                color: t.text.primary,
                borderColor: t.border.default,
              },
            ]}
          />
        </View>

        {/* Vibration */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.sectionTitle, { color: t.text.primary }]}>
              Vibration
            </Text>
            <AppSwitch value={vibration} onValueChange={setVibration} />
          </View>
        </View>

        {/* Ringtone */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Ringtone
          </Text>
          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              const { getDocumentAsync } = await import("expo-document-picker");
              const result = await getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets?.[0]) {
                const file = result.assets[0];
                setSoundType("custom");
                setSoundName(file.name);
                setSoundUri(file.uri);
              }
            }}
          >
            <Text style={[styles.rowLabel, { color: t.text.primary }]}>
              {soundType === "default" ? "Default" : soundName}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={t.icon.secondary} />
          </TouchableOpacity>
          {soundType !== "default" && (
            <TouchableOpacity
              style={[styles.resetButton, { marginTop: 12 }]}
              onPress={() => {
                setSoundType("default");
                setSoundName("Default");
                setSoundUri(undefined);
              }}
            >
              <Text style={{ color: t.action.primaryBg, fontSize: 14 }}>
                Reset to Default
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.bg.app }]}>
        <AppButton
          title={isEdit ? "Save Changes" : "Create Alarm"}
          onPress={handleSave}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

