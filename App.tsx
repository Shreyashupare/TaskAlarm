import { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { createNavigationContainerRef } from "@react-navigation/native";

import RootStack, { RootStackParamList } from "./src/navigation/RootStack";
import { ThemeProvider } from "./src/theme";
import { useAlarmStore } from "./src/stores/useAlarmStore";
import { reconcileAlarms, rescheduleAlarm, setupAlarmNotificationChannel, launchAlarmFromNotification } from "./src/services/alarmScheduler";
import { initDatabase } from "./src/data/db/sqlite";
import { seedQuotesIfEmpty } from "./src/data/repositories/quoteRepository";
import { PermissionGate } from "./src/components/PermissionGate/PermissionGate";
import type { Alarm } from "./src/constants/types";
import { DEBUG } from "./src/constants/AppConstants";

// Global navigation ref for background events
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function AppContent() {
  const { alarms, loadAlarms } = useAlarmStore();
  const [isReady, setIsReady] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Handle alarm trigger - navigate and reschedule repeating alarms
  const handleAlarmTrigger = useCallback(async (alarmId: string) => {
    // Immediately start alarm service for sound/vibration (even if app was closed)
    await launchAlarmFromNotification(alarmId);

    // Navigate to ringing screen
    navigationRef.current?.navigate("AlarmRinging", { alarmId });

    // For repeating alarms, schedule the next occurrence
    const alarm = alarms.find((a: Alarm) => a.id === alarmId);
    if (alarm && alarm.weekdays.length > 0) {
      await rescheduleAlarm(alarm);
    }
  }, [alarms]);

  // Initialize after permissions granted
  useEffect(() => {
    if (!permissionsGranted) return;

    async function initialize() {
      try {
        if (DEBUG) console.log("Permissions granted, initializing app...");

        // Setup Android notification channel for alarms
        await setupAlarmNotificationChannel();

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
  }, [loadAlarms, permissionsGranted]);

  // Handle app launched from killed state via notification
  useEffect(() => {
    async function checkInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification.request.content.data?.alarmId) {
        const alarmId = response.notification.request.content.data.alarmId as string;
        if (DEBUG) console.log("App launched from notification, alarmId:", alarmId);

        // Start alarm service immediately for sound/vibration
        await launchAlarmFromNotification(alarmId);

        // Wait for navigation to be ready then navigate
        setTimeout(() => {
          navigationRef.current?.navigate("AlarmRinging", { alarmId });
        }, 1000);
      }
    }
    if (isReady) {
      checkInitialNotification();
    }
  }, [isReady]);

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

  // Show permission gate until all permissions granted
  if (!permissionsGranted) {
    return <PermissionGate onPermissionsGranted={() => setPermissionsGranted(true)} />;
  }

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
