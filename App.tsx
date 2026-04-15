import { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { createNavigationContainerRef } from "@react-navigation/native";

import RootStack, { RootStackParamList } from "./src/navigation/RootStack";
import { ThemeProvider } from "./src/theme";
import { useAlarmStore } from "./src/stores/useAlarmStore";
import { reconcileAlarms, rescheduleAlarm } from "./src/services/alarmScheduler";
import { initDatabase } from "./src/data/db/sqlite";
import { seedQuotesIfEmpty } from "./src/data/repositories/quoteRepository";
import type { Alarm } from "./src/constants/types";

// Global navigation ref for background events
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function AppContent() {
  const { alarms, loadAlarms } = useAlarmStore();
  const [isReady, setIsReady] = useState(false);

  // Handle alarm trigger - navigate and reschedule repeating alarms
  const handleAlarmTrigger = useCallback(async (alarmId: string) => {
    // Navigate to ringing screen
    navigationRef.current?.navigate("AlarmRinging", { alarmId });

    // For repeating alarms, schedule the next occurrence
    const alarm = alarms.find((a: Alarm) => a.id === alarmId);
    if (alarm && alarm.weekdays.length > 0) {
      await rescheduleAlarm(alarm);
    }
  }, [alarms]);

  // Initialize database on app start
  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        await seedQuotesIfEmpty();
        await loadAlarms();
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setIsReady(true);
      }
    }
    initialize();
  }, [loadAlarms]);

  useEffect(() => {
    if (isReady && alarms.length > 0) {
      reconcileAlarms(alarms);
    }
  }, [alarms, isReady]);

  // Handle Notifications (alarm triggers)
  useEffect(() => {
    // Listener for when a notification is received while the app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      const alarmId = notification.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        handleAlarmTrigger(alarmId);
      }
    });

    // Listener for when a user interacts with a notification (e.g., taps it)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        handleAlarmTrigger(alarmId);
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [handleAlarmTrigger]);

  return <RootStack ref={navigationRef} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
