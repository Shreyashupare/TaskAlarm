import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import type { RootStackParamList } from "../../../navigation/RootStack";
import { useThemeTokens } from "../../../theme";
import { useAlarmStore } from "../../../stores/useAlarmStore";
import { scheduleAlarm } from "../../../services/alarmScheduler";
import { AppButton, AppSwitch, TopHeader } from "../../../components/ui";
import type { Alarm, AlarmTaskType } from "../../../constants/types";
import {
  MIN_TASK_COUNT,
  MAX_TASK_COUNT,
  DEFAULT_TASK_COUNT,
  DEFAULT_TASK_TYPE,
} from "../../../constants/AppConstants";
import { TASK_TYPES, WEEKDAYS } from "./helpers/constants";
import { generateId, formatTwoDigit } from "./helpers/utils";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmForm">;

export default function AlarmFormScreen({ route, navigation }: Props) {
  const t = useThemeTokens();
  const { alarmId } = route.params || {};
  const isEdit = Boolean(alarmId);
  const { alarms, addAlarm, updateAlarm, loadAlarms } = useAlarmStore();

  const [time, setTime] = useState({ hours: 7, minutes: 0 });
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [taskType, setTaskType] = useState<AlarmTaskType>(DEFAULT_TASK_TYPE);
  const [taskCount, setTaskCount] = useState(DEFAULT_TASK_COUNT);
  const [label, setLabel] = useState("");
  const [vibration, setVibration] = useState(true);
  const [soundName] = useState("default");

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
        setTaskType(alarm.taskType);
        setTaskCount(alarm.taskCount);
        setLabel(alarm.label ?? "");
        setVibration(alarm.vibration);
      }
    }
  }, [isEdit, alarmId, alarms]);

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
      soundType: "default",
      soundName,
      vibration,
      taskType,
      taskCount,
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
        return { ...prev, hours: ((newValue % 24) + 24) % 24 };
      }
      return { ...prev, minutes: ((newValue % 60) + 60) % 60 };
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      <TopHeader
        title={isEdit ? "Edit Alarm" : "New Alarm"}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Time
          </Text>
          <View style={styles.timeRow}>
            <View style={styles.timeUnit}>
              <TouchableOpacity
                onPress={() => adjustTime("hours", 1)}
                style={styles.timeBtn}
              >
                <Ionicons name="chevron-up" size={24} color={t.icon.primary} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: t.text.primary }]}>
                {formatTwoDigit(time.hours)}
              </Text>
              <TouchableOpacity
                onPress={() => adjustTime("hours", -1)}
                style={styles.timeBtn}
              >
                <Ionicons name="chevron-down" size={24} color={t.icon.primary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.colon, { color: t.text.primary }]}>:</Text>

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

        {/* Task Type */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Task Type
          </Text>
          <View style={styles.taskTypeRow}>
            {TASK_TYPES.map((type: typeof TASK_TYPES[number]) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setTaskType(type.value)}
                style={[
                  styles.taskTypeBtn,
                  {
                    backgroundColor:
                      taskType === type.value
                        ? t.action.primaryBg
                        : t.border.subtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.taskTypeText,
                    {
                      color:
                        taskType === type.value
                          ? t.action.primaryText
                          : t.text.secondary,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task Count */}
        <View style={[styles.section, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Tasks to Complete: {taskCount}
          </Text>
          <View style={styles.countRow}>
            <TouchableOpacity
              onPress={() => setTaskCount(Math.max(MIN_TASK_COUNT, taskCount - 1))}
              style={styles.countBtn}
            >
              <Ionicons name="remove" size={20} color={t.icon.primary} />
            </TouchableOpacity>
            <Text style={[styles.countValue, { color: t.text.primary }]}>
              {taskCount}
            </Text>
            <TouchableOpacity
              onPress={() => setTaskCount(Math.min(MAX_TASK_COUNT, taskCount + 1))}
              style={styles.countBtn}
            >
              <Ionicons name="add" size={20} color={t.icon.primary} />
            </TouchableOpacity>
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

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title={isEdit ? "Save Changes" : "Create Alarm"}
          onPress={handleSave}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

