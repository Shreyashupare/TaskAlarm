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

import { styles } from "./styles";
import {
  getReflectionsGroupedByDate,
  getReflectionCount,
  type Reflection,
} from "../../../data/repositories/reflectionRepository";
import type { RootStackParamList } from "../../../navigation/RootStack";
import { useThemeTokens } from "../../../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Reflections Screen
 * V2.0 Feature: View past reflection responses grouped by date
 */

interface GroupedReflections {
  date: string;
  reflections: Reflection[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
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

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ReflectionsScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavigationProp>();
  const [groupedReflections, setGroupedReflections] = useState<GroupedReflections[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadReflections = useCallback(async () => {
    setIsLoading(true);
    try {
      const [grouped, count] = await Promise.all([
        getReflectionsGroupedByDate(),
        getReflectionCount(),
      ]);
      setGroupedReflections(grouped);
      setTotalCount(count);
    } catch (err) {
      console.error("Failed to load reflections:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  const renderReflectionCard = (reflection: Reflection) => (
    <View key={reflection.id} style={[styles.reflectionCard, { backgroundColor: t.bg.surface }]}>
      <Text style={[styles.questionText, { color: t.action.primaryBg }]}>{reflection.question}</Text>
      <Text style={[styles.responseText, { color: t.text.primary }]}>{reflection.response}</Text>
      <Text style={[styles.timeText, { color: t.text.secondary }]}>{formatTime(reflection.createdAt)}</Text>
    </View>
  );

  const renderDateSection = (group: GroupedReflections) => (
    <View key={group.date} style={styles.dateSection}>
      <Text style={[styles.dateHeader, { color: t.text.secondary }]}>{formatDate(group.date)}</Text>
      {group.reflections.map(renderReflectionCard)}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 48 }}>📝</Text>
      <Text style={[styles.emptyStateText, { color: t.text.secondary }]}>No Reflections Yet</Text>
      <Text style={[styles.emptyStateSubtext, { color: t.text.secondary }]}>
        Your morning reflections will appear here after you complete alarms with reflection tasks enabled.
      </Text>
    </View>
  );

  const renderStats = () => {
    const uniqueDays = groupedReflections.length;

    return (
      <View style={[styles.statsContainer, { backgroundColor: t.bg.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: t.action.primaryBg }]}>{totalCount}</Text>
          <Text style={[styles.statLabel, { color: t.text.secondary }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: t.action.primaryBg }]}>{uniqueDays}</Text>
          <Text style={[styles.statLabel, { color: t.text.secondary }]}>Days</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.bg.surface, borderBottomColor: t.border.default }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={t.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text.primary }]}>Reflections</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadReflections} />
        }
      >
        {totalCount > 0 && renderStats()}

        {groupedReflections.length === 0 ? (
          renderEmptyState()
        ) : (
          groupedReflections.map(renderDateSection)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
