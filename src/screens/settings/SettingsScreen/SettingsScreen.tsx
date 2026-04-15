import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useThemeTokens } from "../../../theme";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { TopHeader } from "../../../components/ui";
import type { ThemePreference, AlarmTaskType } from "../../../constants/types";
import { MIN_TASK_COUNT, MAX_TASK_COUNT } from "../../../constants/AppConstants";
import { styles } from "./styles";
import { THEME_OPTIONS, TASK_TYPE_OPTIONS, SNOOZE_OPTIONS } from "./helpers/constants";

type ModalType = "theme" | "taskType" | "snooze" | null;

export default function SettingsScreen() {
  const t = useThemeTokens();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const {
    theme,
    defaultTaskCount,
    defaultTaskType,
    snoozePolicy,
    minTaskCount,
    maxTaskCount,
    loadSettings,
    updateTheme,
    updateDefaultTaskCount,
    updateDefaultTaskType,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleTaskCountChange = useCallback((delta: number) => {
    const newCount = defaultTaskCount + delta;
    if (newCount >= minTaskCount && newCount <= maxTaskCount) {
      updateDefaultTaskCount(newCount);
    }
  }, [defaultTaskCount, minTaskCount, maxTaskCount, updateDefaultTaskCount]);

  const renderModal = () => {
    if (!activeModal) return null;

    const getOptions = () => {
      switch (activeModal) {
        case "theme":
          return {
            title: "Theme",
            options: THEME_OPTIONS,
            selected: theme,
            onSelect: (val: ThemePreference) => updateTheme(val),
          };
        case "taskType":
          return {
            title: "Default Task Type",
            options: TASK_TYPE_OPTIONS,
            selected: defaultTaskType,
            onSelect: (val: AlarmTaskType) => updateDefaultTaskType(val),
          };
        case "snooze":
          return {
            title: "Snooze Policy",
            options: SNOOZE_OPTIONS,
            selected: snoozePolicy,
            onSelect: () => {}, // Snooze not implemented yet
          };
        default:
          return null;
      }
    };

    const config = getOptions();
    if (!config) return null;

    return (
      <Modal
        visible={true}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveModal(null)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: t.bg.surface },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: t.border.subtle },
              ]}
            >
              <Text style={[styles.modalTitle, { color: t.text.primary }]}>
                {config.title}
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={24} color={t.icon.primary} />
              </TouchableOpacity>
            </View>

            {config.options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionRow,
                  index < config.options.length - 1 && {
                    borderBottomColor: t.border.subtle,
                  },
                  index < config.options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => {
                  config.onSelect(option.value as never);
                  setActiveModal(null);
                }}
              >
                <Text style={[styles.optionLabel, { color: t.text.primary }]}>
                  {option.label}
                </Text>
                {config.selected === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={t.action.primaryBg}
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      <TopHeader title="Settings" />

      <ScrollView style={styles.scroll}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Appearance
          </Text>
          <View
            style={[styles.card, { backgroundColor: t.bg.surface }]}
          >
            <TouchableOpacity
              style={styles.row}
              onPress={() => setActiveModal("theme")}
            >
              <Text style={[styles.rowLabel, { color: t.text.primary }]}>
                Theme
              </Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: t.text.secondary }]}>
                  {THEME_OPTIONS.find(o => o.value === theme)?.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={t.icon.secondary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default Alarm Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            Default Alarm Settings
          </Text>
          <View
            style={[styles.card, { backgroundColor: t.bg.surface }]}
          >
            {/* Task Count */}
            <View
              style={[
                styles.sliderContainer,
                { borderBottomColor: t.border.subtle },
              ]}
            >
              <Text style={[styles.sliderLabel, { color: t.text.primary }]}>
                Default Task Count
              </Text>
              <View style={styles.sliderRow}>
                <TouchableOpacity
                  onPress={() => handleTaskCountChange(-1)}
                  disabled={defaultTaskCount <= minTaskCount}
                >
                  <Ionicons
                    name="remove-circle"
                    size={32}
                    color={
                      defaultTaskCount <= minTaskCount
                        ? t.border.subtle
                        : t.action.primaryBg
                    }
                  />
                </TouchableOpacity>
                <Text style={[styles.sliderValue, { color: t.text.primary }]}>
                  {defaultTaskCount}
                </Text>
                <TouchableOpacity
                  onPress={() => handleTaskCountChange(1)}
                  disabled={defaultTaskCount >= maxTaskCount}
                >
                  <Ionicons
                    name="add-circle"
                    size={32}
                    color={
                      defaultTaskCount >= maxTaskCount
                        ? t.border.subtle
                        : t.action.primaryBg
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Task Type */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setActiveModal("taskType")}
            >
              <Text style={[styles.rowLabel, { color: t.text.primary }]}>
                Default Task Type
              </Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: t.text.secondary }]}>
                  {TASK_TYPE_OPTIONS.find(o => o.value === defaultTaskType)?.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={t.icon.secondary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.text.secondary }]}>
            About
          </Text>
          <View
            style={[styles.card, { backgroundColor: t.bg.surface }]}
          >
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: t.text.primary }]}>
                Version
              </Text>
              <Text style={[styles.rowValue, { color: t.text.secondary }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
}
