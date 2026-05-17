import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeTokens } from "../../../theme";
import { getReflectionsGroupedByDate, type Reflection } from "../../../data/repositories/reflectionRepository";
import {
  getNightReflectionsGroupedByDate,
  getRecentOccurrences,
  getTasksForNightGuide,
} from "../../../data/repositories/nightGuideRepository";
import type { NightReflection, NightGuideOccurrence, NightGuideTask } from "../../../constants/types";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { styles } from "./styles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = "morning" | "unwind" | "night";

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface MorningGroup {
  date: string;
  reflections: Reflection[];
}
interface NightGroup {
  date: string;
  reflections: NightReflection[];
}

interface UnwindDayEntry {
  date: string;
  occurrences: NightGuideOccurrence[];
  tasks: NightGuideTask[];
  completedPct: number;
}

export default function HistoryScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>("morning");
  const [morningReflections, setMorningReflections] = useState<MorningGroup[]>([]);
  const [nightReflections, setNightReflections] = useState<NightGroup[]>([]);
  const [morningCount, setMorningCount] = useState(0);
  const [nightCount, setNightCount] = useState(0);
  const [unwindDays, setUnwindDays] = useState<UnwindDayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [morningGrouped, nightGrouped, occs] = await Promise.all([
        getReflectionsGroupedByDate(),
        getNightReflectionsGroupedByDate(),
        getRecentOccurrences(90),
      ]);
      setMorningReflections(morningGrouped);
      setNightReflections(nightGrouped);
      setMorningCount(morningGrouped.reduce((sum, g) => sum + g.reflections.length, 0));
      setNightCount(nightGrouped.reduce((sum, g) => sum + g.reflections.length, 0));

      // Build unwind day entries with task data
      const grouped = new Map<string, NightGuideOccurrence[]>();
      for (const occ of occs) {
        const existing = grouped.get(occ.scheduledDate) || [];
        existing.push(occ);
        grouped.set(occ.scheduledDate, existing);
      }
      const sortedDates = Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));

      const dayEntries: UnwindDayEntry[] = [];
      for (const [date, dateOccs] of sortedDates) {
        const firstOcc = dateOccs[0];
        let tasks: NightGuideTask[] = [];
        try {
          tasks = await getTasksForNightGuide(firstOcc.nightGuideId);
        } catch { /* ignore */ }

        // Calculate: done = completed tasks count, notDone = total - done
        // completionPercentage represents % of tasks done (0-100)
        const completedOcc = dateOccs.find(o => o.status === "completed");
        const completedPct = completedOcc ? completedOcc.completionPercentage : 0;

        dayEntries.push({ date, occurrences: dateOccs, tasks, completedPct });
      }
      setUnwindDays(dayEntries);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderReflectionCard = (
    question: string,
    response: string,
    createdAt: number,
  ) => (
    <View key={`${createdAt}_${question.slice(0, 20)}`} style={[styles.card, { backgroundColor: t.bg.surface }]}>
      <Text style={[styles.cardQuestion, { color: t.text.primary }]}>{question}</Text>
      <Text style={[styles.cardResponse, { color: t.text.secondary }]}>"{response}"</Text>
    </View>
  );

  const renderUnwindProgress = () => {
    if (unwindDays.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyText, { color: t.text.primary }]}>
            No Unwind History
          </Text>
          <Text style={[styles.emptySubtext, { color: t.text.secondary }]}>
            Completed unwind routines will appear here.
          </Text>
        </View>
      );
    }

    return unwindDays.map((entry) => {
      const tasksTotal = entry.tasks.length;
      const bestOcc = entry.occurrences.find(o => o.status === "completed") || entry.occurrences[0];
      const occStatus = bestOcc?.status || "pending";

      // For completed days, show task breakdown
      const doneCount = tasksTotal > 0 && occStatus === "completed"
        ? Math.round((entry.completedPct / 100) * tasksTotal)
        : 0;
      const notDoneCount = tasksTotal - doneCount;

      let iconName: "checkmark-circle" | "close-circle" | "time";
      let iconColor: string;
      let label: string;

      if (occStatus === "completed") {
        iconName = "checkmark-circle";
        iconColor = t.state.success;
        label = "Completed";
      } else if (occStatus === "missed") {
        iconName = "close-circle";
        iconColor = t.state.error;
        label = "Missed";
      } else {
        iconName = "time";
        iconColor = t.state.warning;
        label = "Pending";
      }

      return (
        <TouchableOpacity
          key={entry.date}
          style={[styles.unwindDayCard, { backgroundColor: t.bg.surface }]}
          onPress={() => {
            const firstOcc = entry.occurrences[0];
            if (firstOcc) {
              navigation.navigate("NightGuideActive", {
                guideId: firstOcc.nightGuideId,
                occurrenceId: firstOcc.id,
                mode: "readonly",
              });
            }
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Text style={[styles.dateHeader, { color: t.text.secondary, marginBottom: 0 }]}>{formatDate(entry.date)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name={iconName} size={16} color={iconColor} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: iconColor }}>{label}</Text>
            </View>
          </View>

          {/* Task breakdown + progress bar: only for completed days */}
          {occStatus === "completed" && tasksTotal > 0 && (
            <>
              <View style={styles.unwindStatsRow}>
                <View style={styles.unwindStat}>
                  <Ionicons name="checkmark-circle" size={20} color={t.state.success} />
                  <Text style={[styles.unwindStatValue, { color: t.state.success }]}> {doneCount}</Text>
                  <Text style={[styles.unwindStatLabel, { color: t.text.secondary }]}>Done</Text>
                </View>
                <View style={styles.unwindStat}>
                  <Ionicons name="close-circle" size={20} color={t.text.secondary} />
                  <Text style={[styles.unwindStatValue, { color: t.text.secondary }]}> {notDoneCount}</Text>
                  <Text style={[styles.unwindStatLabel, { color: t.text.secondary }]}>Not Done</Text>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressBarBg, { backgroundColor: t.border.subtle, marginTop: 6 }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: t.state.success,
                      width: tasksTotal > 0 ? `${Math.round((doneCount / tasksTotal) * 100)}%` : "0%",
                    },
                  ]}
                />
              </View>
            </>
          )}

          {/* Chevron */}
          <View style={{ alignItems: "flex-end", marginTop: 4 }}>
            <Ionicons name="chevron-forward" size={20} color={t.icon.secondary} />
          </View>
        </TouchableOpacity>
      );
    });
  };

  const renderGroupedList = () => {
    const data = activeTab === "morning" ? morningReflections : nightReflections;

    if (data.length === 0) {
      const label = activeTab === "morning" ? "morning" : "night";
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyText, { color: t.text.primary }]}>
            No {label === "morning" ? "Morning" : "Night"} Reflections Yet
          </Text>
          <Text style={[styles.emptySubtext, { color: t.text.secondary }]}>
            {label === "morning"
              ? "Your morning reflections will appear here after you complete alarms with reflection tasks enabled."
              : "Your night reflections will appear here after you complete your Night Guide routine."}
          </Text>
        </View>
      );
    }

    return data.map((group) => (
      <View key={group.date}>
        <Text style={[styles.dateHeader, { color: t.text.secondary }]}>{formatDate(group.date)}</Text>
        {group.reflections.map((r: any) =>
          renderReflectionCard(r.question, r.response, r.createdAt)
        )}
      </View>
    ));
  };

  const totalCount = activeTab === "morning" ? morningCount : nightCount;
  const uniqueDays = activeTab === "morning" ? morningReflections.length : nightReflections.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      <View style={{ borderBottomColor: t.border.default, borderBottomWidth: 1, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center", backgroundColor: t.bg.surface }}>
        <Text style={{ color: t.text.primary, fontSize: 20, fontWeight: "600" }}>History</Text>
      </View>

      <View style={[styles.tabRow, { backgroundColor: t.border.subtle }]}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: activeTab === "morning" ? t.bg.surface : "transparent" }]}
          onPress={() => setActiveTab("morning")}
        >
          <Text style={[styles.tabLabel, { color: activeTab === "morning" ? t.text.primary : t.text.secondary }]}>Morning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: activeTab === "unwind" ? t.bg.surface : "transparent" }]}
          onPress={() => setActiveTab("unwind")}
        >
          <Text style={[styles.tabLabel, { color: activeTab === "unwind" ? t.text.primary : t.text.secondary }]}>Unwind</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: activeTab === "night" ? t.bg.surface : "transparent" }]}
          onPress={() => setActiveTab("night")}
        >
          <Text style={[styles.tabLabel, { color: activeTab === "night" ? t.text.primary : t.text.secondary }]}>Night</Text>
        </TouchableOpacity>
      </View>

      {activeTab !== "unwind" && totalCount > 0 && (
        <View style={[styles.statsRow, { backgroundColor: t.bg.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: t.action.primaryBg }]}>{totalCount}</Text>
            <Text style={[styles.statLabel, { color: t.text.secondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: t.action.primaryBg }]}>{uniqueDays}</Text>
            <Text style={[styles.statLabel, { color: t.text.secondary }]}>Days</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {activeTab === "unwind" ? renderUnwindProgress() : renderGroupedList()}
      </ScrollView>
    </SafeAreaView>
  );
}
