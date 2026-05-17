import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { useThemeTokens } from "../../../theme";
import { useNightGuideStore } from "../../../stores/useNightGuideStore";
import { NIGHT_GUIDE_TITLE } from "../../../constants/nightGuideConstants";
import type { NightGuideOccurrence, NightGuide } from "../../../constants/types";
import * as nightGuideRepository from "../../../data/repositories/nightGuideRepository";
import { getIstDateString } from "../../../utils/istDate";
import { styles } from "./styles";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function NightGuideHistoryScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { guides } = useNightGuideStore();

  const [occurrences, setOccurrences] = useState<NightGuideOccurrence[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const occs = await nightGuideRepository.getRecentOccurrences(90);
    setOccurrences(occs);
  };

  const guideMap = useMemo(() => {
    const map = new Map<string, NightGuide>();
    for (const g of guides) map.set(g.id, g);
    return map;
  }, [guides]);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  const monthOccurrences = useMemo(() => {
    return occurrences.filter((o) => {
      const [y, m] = o.scheduledDate.split("-").map(Number);
      return y === currentMonth.year && m === currentMonth.month + 1;
    });
  }, [occurrences, currentMonth]);

  const occurrencesByDate = useMemo(() => {
    const map = new Map<string, NightGuideOccurrence[]>();
    for (const occ of monthOccurrences) {
      const existing = map.get(occ.scheduledDate) || [];
      existing.push(occ);
      map.set(occ.scheduledDate, existing);
    }
    return map;
  }, [monthOccurrences]);

  // Monthly stats: only completed and missed (per-day count)
  const stats = useMemo(() => {
    const scheduledDates = new Set(monthOccurrences.map(o => o.scheduledDate));
    const total = scheduledDates.size;
    // A day is "completed" if ANY occurrence that day was completed
    const completed = new Set(
      monthOccurrences.filter((o) => o.status === "completed").map((o) => o.scheduledDate)
    ).size;
    const missed = total - completed;
    return { total, completed, missed };
  }, [monthOccurrences]);

  const navigateMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const getDayStatus = (dateKey: string): "completed" | "missed" | null => {
    const occs = occurrencesByDate.get(dateKey);
    if (!occs) return null;

    // Don't color future dates
    const todayStr = getIstDateString();
    if (dateKey > todayStr) return null;

    // Day is completed if any occurrence was completed
    const hasCompleted = occs.some((o) => o.status === "completed");
    if (hasCompleted) return "completed";

    // Day is missed if any occurrence was missed (never opened)
    const hasMissed = occs.some((o) => o.status === "missed");
    if (hasMissed) return "missed";

    // Day is still pending (for today) - show warning
    if (dateKey === todayStr) return null;

    return null;
  };

  const handleDayPress = (dateKey: string) => {
    const occs = occurrencesByDate.get(dateKey);
    if (!occs || occs.length === 0) return;
    // Read-only: show task list with checkmarks by navigating in tasks-only mode
    const firstOcc = occs.find(o => o.status === "completed") || occs[0];
    if (firstOcc.nightGuideId) {
      navigation.navigate('NightGuideActive', {
        mode: 'readonly',
        guideId: firstOcc.nightGuideId,
        occurrenceId: firstOcc.id,
      });
    }
  };

  const renderCalendarDay = (day: number, dateKey: string) => {
    const dayStatus = getDayStatus(dateKey);
    const isToday = dateKey === getIstDateString();
    const hasOccurrence = occurrencesByDate.has(dateKey);

    let bgColor = "transparent";
    if (dayStatus === "completed") bgColor = t.state.success;
    else if (dayStatus === "missed") bgColor = t.state.error;

    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.calendarDay,
          { backgroundColor: bgColor },
          isToday && { borderWidth: 2, borderColor: t.action.primaryBg },
        ]}
        onPress={() => hasOccurrence ? handleDayPress(dateKey) : null}
        disabled={!hasOccurrence}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.calendarDayText,
            {
              color: dayStatus ? "#fff" : t.text.primary,
              fontWeight: isToday ? "700" : "400",
            },
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={t.icon.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text.primary }]}>
          {NIGHT_GUIDE_TITLE} History
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color={t.icon.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: t.text.primary }]}>
            {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color={t.icon.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats - only completed and missed */}
        {stats.total > 0 && (
          <View style={[styles.statsCard, { backgroundColor: t.bg.surface }]}>
            <Text style={[styles.statsCardTitle, { color: t.text.secondary }]}>
              Monthly Summary
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: t.state.success }]}>
                  {stats.completed}
                </Text>
                <Text style={[styles.statLabel, { color: t.text.secondary }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: t.state.error }]}>
                  {stats.missed}
                </Text>
                <Text style={[styles.statLabel, { color: t.text.secondary }]}>
                  Missed
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: t.state.success }]} />
            <Text style={[styles.legendLabel, { color: t.text.secondary }]}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: t.state.error }]} />
            <Text style={[styles.legendLabel, { color: t.text.secondary }]}>Missed</Text>
          </View>
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {DAYS_SHORT.map((day) => (
            <View key={day} style={styles.calendarHeaderCell}>
              <Text style={[styles.calendarHeaderText, { color: t.text.secondary }]}>
                {day}
              </Text>
            </View>
          ))}

          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.calendarDay} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            return renderCalendarDay(day, dateStr);
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
