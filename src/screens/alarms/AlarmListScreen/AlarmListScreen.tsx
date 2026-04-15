import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useThemeTokens } from "../../../theme";
import { useAlarmStore } from "../../../stores/useAlarmStore";
import { scheduleAlarm, cancelAlarm } from "../../../services/alarmScheduler";
import type { RootStackParamList } from "../../../navigation/RootStack";
import type { Alarm } from "../../../constants/types";
import { AlarmCard } from "../AlarmCard/AlarmCard";
import { styles } from "./styles";
import { formatTime } from "./helpers/utils";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AlarmListScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavigationProp>();
  const { alarms, loadAlarms, toggleAlarm, deleteAlarm } = useAlarmStore();

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  // Debug: log alarms count
  useEffect(() => {
    console.log("AlarmListScreen alarms count:", alarms.length);
  }, [alarms]);

  const handleEdit = (alarm: Alarm) => {
    navigation.navigate("AlarmForm", { alarmId: alarm.id });
  };

  const handleToggle = async (alarm: Alarm) => {
    const newEnabled = !alarm.enabled;

    // Schedule or cancel based on new state
    if (newEnabled) {
      await scheduleAlarm({ ...alarm, enabled: newEnabled });
    } else {
      await cancelAlarm(alarm.id);
    }

    await toggleAlarm(alarm.id);
  };

  const handleDelete = (alarm: Alarm) => {
    Alert.alert(
      "Delete Alarm",
      `Are you sure you want to delete "${alarm.label || formatTime(alarm.time)}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await cancelAlarm(alarm.id);
            await deleteAlarm(alarm.id);
          },
        },
      ]
    );
  };

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <AlarmCard
      alarm={item}
      onToggle={() => handleToggle(item)}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text.primary }]}>
          TaskAlarm
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs", { screen: "Settings" })}
        >
          <Ionicons name="settings-outline" size={24} color={t.icon.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: t.text.secondary }]}>
        Wake up by solving
      </Text>

      <FlatList
        data={alarms}
        keyExtractor={item => item.id}
        renderItem={renderAlarm}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: t.text.primary }]}>
              No alarms yet
            </Text>
            <Text style={[styles.emptySubtext, { color: t.text.secondary }]}>
              Tap + to create your first alarm
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: t.action.primaryBg }]}
        onPress={() => navigation.navigate("AlarmForm", {})}
      >
        <Ionicons name="add" size={28} color={t.action.primaryText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

