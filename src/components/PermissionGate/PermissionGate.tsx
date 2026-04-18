import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { useThemeTokens } from "../../theme";
import { styles } from "./styles";
import { DEBUG } from "../../constants/AppConstants";

// Android native module for battery optimization
let BatteryOptimizationModule: { isIgnoringBatteryOptimizations: () => Promise<boolean>; requestIgnoreBatteryOptimizations: () => Promise<void> } | null = null;
if (Platform.OS === "android") {
  try {
    BatteryOptimizationModule = require("../../native-modules/BatteryOptimization").default;
  } catch {
    // Module not available
  }
}

type PermissionStatus = {
  notifications: boolean;
  exactAlarm: boolean;
  batteryOptimization: boolean;
};

type Props = {
  onPermissionsGranted: () => void;
};

export function PermissionGate({ onPermissionsGranted }: Props) {
  const t = useThemeTokens();
  const [checking, setChecking] = useState(true);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: false,
    exactAlarm: false,
    batteryOptimization: false,
  });
  const [showRetry, setShowRetry] = useState(false);

  const checkPermissions = useCallback(async () => {
    setChecking(true);
    setShowRetry(false);

    try {
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();
      const notificationsGranted = notifStatus === "granted";

      // Check exact alarm permission (Android 12+) - check via trying to schedule
      let exactAlarmGranted = true;
      if (Platform.OS === "android" && Platform.Version >= 31) {
        try {
          // Try scheduling a test notification 1 hour in future
          const testId = await Notifications.scheduleNotificationAsync({
            content: { title: "Test", body: "Test" },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 3600000) },
          });
          await Notifications.cancelScheduledNotificationAsync(testId);
          exactAlarmGranted = true;
        } catch {
          exactAlarmGranted = false;
        }
      }

      // Check battery optimization (Android)
      let batteryOptGranted = true;
      if (Platform.OS === "android" && BatteryOptimizationModule) {
        try {
          batteryOptGranted = await BatteryOptimizationModule.isIgnoringBatteryOptimizations();
        } catch {
          batteryOptGranted = false;
        }
      }

      const newPermissions = {
        notifications: notificationsGranted,
        exactAlarm: exactAlarmGranted,
        batteryOptimization: batteryOptGranted,
      };

      setPermissions(newPermissions);

      if (DEBUG) {
        console.log("Permission check:", newPermissions);
      }

      // If all granted, proceed
      if (notificationsGranted && exactAlarmGranted && batteryOptGranted) {
        onPermissionsGranted();
      } else {
        setShowRetry(true);
      }
    } catch (err) {
      console.error("Permission check failed:", err);
      setShowRetry(true);
    } finally {
      setChecking(false);
    }
  }, [onPermissionsGranted]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
        android: {},
      });

      if (status === "granted") {
        setPermissions(prev => ({ ...prev, notifications: true }));
      } else {
        // Show settings dialog
        Alert.alert(
          "Notification Permission Required",
          "TaskAlarm needs notification permission to show alarms. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  };

  const requestExactAlarmPermission = async () => {
    if (Platform.OS !== "android") return;

    // For Android 12+, exact alarm permission must be granted in system settings
    // Guide user to Settings > Apps > Special app access > Alarms & reminders
    Alert.alert(
      "Exact Alarm Permission Required",
      "Android 12+ requires special permission for exact alarms. Please enable 'Alarms & reminders' for TaskAlarm in system settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== "android") return;

    if (BatteryOptimizationModule) {
      try {
        await BatteryOptimizationModule.requestIgnoreBatteryOptimizations();
        const granted = await BatteryOptimizationModule.isIgnoringBatteryOptimizations();
        setPermissions(prev => ({ ...prev, batteryOptimization: granted }));
      } catch {
        // Fallback to settings
        Linking.openSettings();
      }
    } else {
      // Fallback: open battery optimization settings
      Alert.alert(
        "Battery Optimization",
        "Please disable battery optimization for TaskAlarm to ensure alarms work reliably.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  if (checking) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg.app }]}>
        <ActivityIndicator size="large" color={t.action.primaryBg} />
        <Text style={[styles.checkingText, { color: t.text.primary }]}>
          Checking permissions...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg.app }]}>
      <View style={styles.content}>
        <Ionicons name="alarm" size={64} color={t.action.primaryBg} />
        <Text style={[styles.title, { color: t.text.primary }]}>
          Permissions Required
        </Text>
        <Text style={[styles.subtitle, { color: t.text.secondary }]}>
          TaskAlarm needs these permissions to wake you up reliably
        </Text>

        <View style={styles.permissionsList}>
          {/* Notification Permission */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionHeader}>
                <Ionicons
                  name={permissions.notifications ? "checkmark-circle" : "notifications"}
                  size={24}
                  color={permissions.notifications ? t.state.success : t.state.warning}
                />
              <Text style={[styles.permissionTitle, { color: t.text.primary }]}>
                Notifications
              </Text>
              {permissions.notifications && (
                <Text style={[styles.grantedBadge, { color: t.state.success }]}>
                  ✓ Granted
                </Text>
              )}
            </View>
            <Text style={[styles.permissionDesc, { color: t.text.secondary }]}>
              Required to show alarm notifications
            </Text>
            {!permissions.notifications && (
              <TouchableOpacity
                style={[styles.grantButton, { backgroundColor: t.action.primaryBg }]}
                onPress={requestNotificationPermission}
              >
                <Text style={[styles.grantButtonText, { color: t.action.primaryText }]}>
                  Grant Permission
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Exact Alarm Permission */}
          {Platform.OS === "android" && Platform.Version >= 31 && (
            <View style={styles.permissionItem}>
              <View style={styles.permissionHeader}>
                <Ionicons
                  name={permissions.exactAlarm ? "checkmark-circle" : "time"}
                  size={24}
                  color={permissions.exactAlarm ? t.state.success : t.state.warning}
                />
                <Text style={[styles.permissionTitle, { color: t.text.primary }]}>
                  Exact Alarms
                </Text>
                {permissions.exactAlarm && (
                  <Text style={[styles.grantedBadge, { color: t.state.success }]}>
                    ✓ Granted
                  </Text>
                )}
              </View>
              <Text style={[styles.permissionDesc, { color: t.text.secondary }]}>
                Required for precise alarm timing (Android 12+)
              </Text>
              {!permissions.exactAlarm && (
                <TouchableOpacity
                  style={[styles.grantButton, { backgroundColor: t.action.primaryBg }]}
                  onPress={requestExactAlarmPermission}
                >
                  <Text style={[styles.grantButtonText, { color: t.action.primaryText }]}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Battery Optimization */}
          {Platform.OS === "android" && (
            <View style={styles.permissionItem}>
              <View style={styles.permissionHeader}>
                <Ionicons
                  name={permissions.batteryOptimization ? "checkmark-circle" : "battery-charging"}
                  size={24}
                  color={permissions.batteryOptimization ? t.state.success : t.state.warning}
                />
                <Text style={[styles.permissionTitle, { color: t.text.primary }]}>
                  Battery Optimization
                </Text>
                {permissions.batteryOptimization && (
                  <Text style={[styles.grantedBadge, { color: t.state.success }]}>
                    ✓ Granted
                  </Text>
                )}
              </View>
              <Text style={[styles.permissionDesc, { color: t.text.secondary }]}>
                Required to prevent Android from killing the app
              </Text>
              {!permissions.batteryOptimization && (
                <TouchableOpacity
                  style={[styles.grantButton, { backgroundColor: t.action.primaryBg }]}
                  onPress={requestBatteryOptimization}
                >
                  <Text style={[styles.grantButtonText, { color: t.action.primaryText }]}>
                    Disable Optimization
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {showRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: t.border.default }]}
            onPress={checkPermissions}
          >
            <Text style={[styles.retryText, { color: t.text.secondary }]}>
              Check Again
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.warningText, { color: t.state.warning }]}>
          Without these permissions, alarms may not work when the app is closed.
        </Text>
      </View>
    </View>
  );
}
