import { useEffect, useState, useCallback, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform, AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { createNavigationContainerRef } from "@react-navigation/native";

import RootStack, { RootStackParamList } from "./src/navigation/RootStack";
import { ThemeProvider } from "./src/theme";
import { useAlarmStore } from "./src/stores/useAlarmStore";
import { useRingingStore } from "./src/stores/useRingingStore";
import { reconcileAlarms, rescheduleAlarm, setupAlarmNotificationChannel, launchAlarmFromNotification } from "./src/services/alarmScheduler";
import { getLaunchAlarmId, clearLaunchAlarm } from "./src/services/launchIntentService";
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
  const appState = useRef(AppState.currentState);

  // Handle alarm trigger - navigate and reschedule repeating alarms
  const handleAlarmTrigger = useCallback(async (alarmId: string) => {
    // Check if we're already ringing for this alarm (resuming)
    const ringingState = useRingingStore.getState();
    const isResuming = ringingState.isRinging && ringingState.alarmId === alarmId;

    if (!isResuming) {
      // Only start service if not already ringing
      await launchAlarmFromNotification(alarmId);
    }

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

        // Check if there's a stale ringing state (from previous app session)
        // If the app is not being launched from an alarm, clear any old ringing state
        const launchAlarmId = await getLaunchAlarmId();
        const ringingState = useRingingStore.getState();
        if (!launchAlarmId && ringingState.isRinging) {
          if (DEBUG) console.log("Clearing stale ringing state from previous session");
          useRingingStore.getState().reset();
        }

        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setIsReady(true);
      }
    }
    initialize();
  }, [loadAlarms, permissionsGranted]);

  // Handle app launched from killed state via alarm or notification
  useEffect(() => {
    async function checkInitialLaunch() {
      if (DEBUG) console.log("[DEBUG] checkInitialLaunch - isReady:", isReady);

      // First check if launched from alarm (via AlarmManager)
      const launchAlarmId = await getLaunchAlarmId();
      if (DEBUG) console.log("[DEBUG] getLaunchAlarmId returned:", launchAlarmId);

      if (launchAlarmId) {
        if (DEBUG) console.log("[DEBUG] App launched from alarm intent, alarmId:", launchAlarmId);

        // Check if we're resuming an existing alarm session
        const ringingState = useRingingStore.getState();
        const isResuming = ringingState.isRinging && ringingState.alarmId === launchAlarmId;

        if (!isResuming) {
          // Fresh alarm - start alarm service
          await launchAlarmFromNotification(launchAlarmId);
        } else {
          if (DEBUG) console.log("Resuming existing alarm session with progress:",
            ringingState.completedTasks, "/", ringingState.requiredTasks);
        }

        // Wait for navigation to be ready then navigate
        setTimeout(() => {
          if (DEBUG) console.log("[DEBUG] Timeout fired, checking navigation ready...");
          if (navigationRef.current?.isReady()) {
            if (DEBUG) console.log("[DEBUG] Navigating to AlarmRinging with alarmId:", launchAlarmId);
            navigationRef.current?.navigate("AlarmRinging", { alarmId: launchAlarmId });
            clearLaunchAlarm(); // Clear after handling
          } else {
            if (DEBUG) console.log("[DEBUG] Navigation not ready yet!");
          }
        }, 1500);
        return;
      }

      // Fallback: check if launched from notification
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification.request.content.data?.alarmId) {
        const alarmId = response.notification.request.content.data.alarmId as string;
        if (DEBUG) console.log("App launched from notification, alarmId:", alarmId);

        // Start alarm service immediately for sound/vibration
        await launchAlarmFromNotification(alarmId);

        // Wait for navigation to be ready then navigate
        setTimeout(() => {
          if (navigationRef.current?.isReady()) {
            navigationRef.current?.navigate("AlarmRinging", { alarmId });
          }
        }, 1000);
      }
    }
    if (isReady) {
      checkInitialLaunch();
    }
  }, [isReady]);

  // Handle app brought to foreground from alarm (when app was already running)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground - check if it was from an alarm
        if (DEBUG) console.log("[DEBUG] App came to foreground, checking for alarm intent");

        const launchAlarmId = await getLaunchAlarmId();
        if (DEBUG) console.log("[DEBUG] AppState change - getLaunchAlarmId returned:", launchAlarmId);
        if (launchAlarmId) {
          if (DEBUG) console.log("[DEBUG] App resumed from alarm, alarmId:", launchAlarmId);

          // Check if we're resuming an existing alarm session
          const ringingState = useRingingStore.getState();
          const isResuming = ringingState.isRinging && ringingState.alarmId === launchAlarmId;

          if (!isResuming) {
            await launchAlarmFromNotification(launchAlarmId);
          }

          // Navigate to ringing screen
          if (navigationRef.current?.isReady()) {
            navigationRef.current?.navigate("AlarmRinging", { alarmId: launchAlarmId });
            clearLaunchAlarm();
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
