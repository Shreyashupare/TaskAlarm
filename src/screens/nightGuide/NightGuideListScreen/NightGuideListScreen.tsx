import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeTokens } from "../../../theme";
import { useNightGuideStore } from "../../../stores/useNightGuideStore";
import { TopHeader } from "../../../components/ui";
import { NIGHT_GUIDE_TITLE } from "../../../constants/nightGuideConstants";
import type { RootStackParamList } from "../../../navigation/RootStack";
import type { NightGuide, NightGuideOccurrence } from "../../../constants/types";
import * as nightGuideRepository from "../../../data/repositories/nightGuideRepository";
import { getIstWeekday, getIstDateString } from "../../../utils/istDate";
import { styles } from "./styles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getWeekdayLabel(wd: number): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[wd];
}

/** Find which enabled guide should fire today (matches weekday or one-time pending) */
function findTodayGuide(guides: NightGuide[], pendingOccs: NightGuideOccurrence[]): NightGuide | null {
  const todayIst = getIstWeekday();
  const todayStr = getIstDateString();

  const pendingGuideIds = new Set(pendingOccs.filter(o => o.scheduledDate === todayStr).map(o => o.nightGuideId));

  for (const guide of guides) {
    if (!guide.enabled) continue;
    if (guide.weekdays.length === 0 && pendingGuideIds.has(guide.id)) return guide;
    if (guide.weekdays.includes(todayIst)) return guide;
  }
  return null;
}

function getTodayStatus(
  guide: NightGuide | null,
  occurrences: NightGuideOccurrence[]
): { label: string; status: "pending" | "completed" | "missed" | "upcoming" } {
  if (!guide) return { label: "No guide today", status: "upcoming" };

  const todayStr = getIstDateString();
  const todayOcc = occurrences.find(
    (o) => o.nightGuideId === guide.id && o.scheduledDate === todayStr
  );

  if (todayOcc) {
    if (todayOcc.status === "completed") {
      const pct = todayOcc.completionPercentage;
      const taskCount = todayOcc.completedTaskIds.length;
      if (taskCount > 0 && taskCount < 100 && pct < 100) {
        return { label: `${taskCount} tasks done`, status: "pending" };
      }
      return { label: "Completed", status: "completed" };
    }
    if (todayOcc.status === "missed") return { label: "Missed", status: "missed" };
    if (todayOcc.status === "pending") {
      const taskCount = todayOcc.completedTaskIds.length;
      if (taskCount > 0) {
        return { label: `${taskCount} task${taskCount > 1 ? "s" : ""} done`, status: "pending" };
      }
      return { label: "Pending", status: "pending" };
    }
  }

  return { label: "Upcoming", status: "upcoming" };
}

function GuideCard({
  guide,
  onToggle,
  onEdit,
  onDelete,
}: {
  guide: NightGuide;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useThemeTokens();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.bg.surface,
          opacity: guide.enabled ? 1 : 0.5,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardBody}
        onPress={() => onEdit(guide.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.time, { color: t.text.primary }]}>
            {guide.time}
          </Text>
          <TouchableOpacity
            onPress={() => onToggle(guide.id, !guide.enabled)}
            style={[
              styles.toggle,
              {
                backgroundColor: guide.enabled
                  ? t.action.primaryBg
                  : t.border.default,
              },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: "#fff",
                  transform: [
                    { translateX: guide.enabled ? 20 : 0 },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        {guide.label ? (
          <Text style={[styles.label, { color: t.text.secondary }]}>
            {guide.label}
          </Text>
        ) : null}
        <View style={styles.weekdaysRow}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const active = guide.weekdays.length === 0 || guide.weekdays.includes(d);
            return (
              <Text
                key={d}
                style={[
                  styles.weekday,
                  {
                    color: active ? t.text.primary : t.text.secondary,
                    fontWeight: active ? "600" : "400",
                    opacity: active ? 1 : 0.4,
                  },
                ]}
              >
                {getWeekdayLabel(d)}
              </Text>
            );
          })}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function NightGuideListScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavigationProp>();
  const { guides, isLoading, loadGuides, toggleGuide, deleteGuide } =
    useNightGuideStore();
  const [occurrences, setOccurrences] = useState<NightGuideOccurrence[]>([]);

  const loadData = useCallback(async () => {
    await loadGuides();
    const occs = await nightGuideRepository.getRecentOccurrences(30);
    setOccurrences(occs);
  }, [loadGuides]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const todayGuide = useMemo(() => {
    const pendingOccs = occurrences.filter((o) => o.status === "pending");
    return findTodayGuide(guides, pendingOccs);
  }, [guides, occurrences]);

  const todayStatus = useMemo(
    () => getTodayStatus(todayGuide, occurrences),
    [todayGuide, occurrences]
  );

  const handleTodayPress = useCallback(() => {
    if (!todayGuide) return;
    if (todayStatus.status === "completed" || todayStatus.status === "missed") return;
    const todayStr = getIstDateString();
    const pendingOcc = occurrences.find(
      (o) => o.nightGuideId === todayGuide.id && o.scheduledDate === todayStr && o.status === "pending"
    );
    navigation.navigate("NightGuideActive", { mode: "tasks-only",
      guideId: todayGuide.id,
      occurrenceId: pendingOcc?.id,
    });
  }, [todayGuide, todayStatus, occurrences, navigation]);

  const handleAdd = useCallback(() => {
    navigation.navigate("NightGuideForm", {});
  }, [navigation]);

  const handleEdit = useCallback(
    (id: string) => {
      navigation.navigate("NightGuideForm", { nightGuideId: id });
    },
    [navigation]
  );

  const handleHistory = useCallback(() => {
    navigation.navigate("NightGuideHistory");
  }, [navigation]);

  const renderTodaySection = () => {
    if (!todayGuide) {
      return (
        <View style={[styles.todayEmpty, { backgroundColor: t.bg.surface }]}>
          <Text style={[styles.todayEmptyText, { color: t.text.secondary }]}>
            No {NIGHT_GUIDE_TITLE} scheduled for today
          </Text>
        </View>
      );
    }

    const canStart = todayStatus.status !== "completed" && todayStatus.status !== "missed";
    const statusColors: Record<string, string> = {
      pending: t.state.warning,
      completed: t.state.success,
      missed: t.state.error,
      upcoming: t.icon.secondary,
    };

    return (
      <TouchableOpacity
        style={[styles.todaySection, { backgroundColor: t.bg.surface }]}
        onPress={handleTodayPress}
        disabled={!canStart}
        activeOpacity={0.7}
      >
        <View style={styles.todayLeft}>
          <Text style={[styles.todayLabel, { color: t.text.secondary }]}>
            Today's {NIGHT_GUIDE_TITLE}
          </Text>
          <Text style={[styles.todayTime, { color: t.text.primary }]}>
            {todayGuide.time}
          </Text>
          {todayGuide.label ? (
            <Text style={{ fontSize: 13, color: t.text.secondary, marginTop: 2 }}>
              {todayGuide.label}
            </Text>
          ) : null}
        </View>
        <View style={[styles.todayStatusBadge, { backgroundColor: statusColors[todayStatus.status] + "20" }]}>
          <Text style={[styles.todayStatusText, { color: statusColors[todayStatus.status] }]}>
            {todayStatus.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
      <TopHeader
        title={NIGHT_GUIDE_TITLE}
        rightAction={{ icon: "calendar-outline", onPress: handleHistory }}
      />
      <FlatList
        data={guides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderTodaySection}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor={t.text.primary}
          />
        }
        ListEmptyComponent={
          guides.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="moon-outline" size={64} color={t.icon.secondary} />
              <Text style={[styles.emptyTitle, { color: t.text.primary }]}>
                No {NIGHT_GUIDE_TITLE} Guides
              </Text>
              <Text style={[styles.emptySubtitle, { color: t.text.secondary }]}>
                Create a bedtime routine to wind down
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <GuideCard
            guide={item}
            onToggle={(id, enabled) => toggleGuide(id, enabled)}
            onEdit={(id) => handleEdit(id)}
            onDelete={(id) => deleteGuide(id)}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: t.action.primaryBg }]}
        onPress={handleAdd}
      >
        <Ionicons name="add" size={28} color={t.action.primaryText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
