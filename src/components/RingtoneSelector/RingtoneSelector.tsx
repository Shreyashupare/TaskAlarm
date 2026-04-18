import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useThemeTokens } from "../../theme";
import { DEBUG } from "../../constants/AppConstants";
import {
  getDeviceRingtones,
  previewRingtone,
  stopPreview,
  type DeviceRingtone,
} from "../../services/ringtoneService";

type Ringtone = {
  type: "default" | "notification" | "reminder" | "custom" | "device";
  name: string;
  uri?: string;
};

type Props = {
  selectedRingtone: Ringtone;
  onSelect: (ringtone: Ringtone) => void;
  vibration: boolean;
  onVibrationChange: (enabled: boolean) => void;
};

export function RingtoneSelector({
  selectedRingtone,
  onSelect,
  vibration,
  onVibrationChange,
}: Props) {
  const t = useThemeTokens();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewingRingtone, setPreviewingRingtone] = useState<string | null>(null);
  const [deviceRingtones, setDeviceRingtones] = useState<DeviceRingtone[]>([]);
  const [isLoadingRingtones, setIsLoadingRingtones] = useState(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load device ringtones when modal opens
  useEffect(() => {
    if (modalVisible) {
      loadDeviceRingtones();
    }
  }, [modalVisible]);

  const loadDeviceRingtones = async () => {
    setIsLoadingRingtones(true);
    try {
      const ringtones = await getDeviceRingtones();
      setDeviceRingtones(ringtones);
    } catch (e) {
      console.error("Failed to load ringtones:", e);
    } finally {
      setIsLoadingRingtones(false);
    }
  };

  const stopPreviewCallback = useCallback(async () => {
    // Clear any pending timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }

    // Stop native ringtone preview
    await stopPreview();
    setPreviewingRingtone(null);
  }, []);

  const handlePreview = useCallback(async (ringtone: Ringtone) => {
    if (DEBUG) console.log("Previewing ringtone:", ringtone.name, "URI:", ringtone.uri);

    // If already previewing this ringtone, stop it
    if (previewingRingtone === ringtone.name) {
      await stopPreviewCallback();
      return;
    }

    // Stop any current preview first
    await stopPreviewCallback();

    // Set new preview state
    setPreviewingRingtone(ringtone.name);

    try {
      // Use the actual ringtone URI for preview
      const uriToPlay = ringtone.uri || "default";
      await previewRingtone(uriToPlay);

      // Auto stop after 3 seconds
      previewTimeoutRef.current = setTimeout(() => {
        stopPreviewCallback();
      }, 3000);
    } catch (err) {
      console.error("Failed to preview ringtone:", err);
      setPreviewingRingtone(null);
    }
  }, [previewingRingtone, stopPreviewCallback]);

  const handleSelectCustom = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const customRingtone: Ringtone = {
        type: "custom",
        name: file.name || "Custom Sound",
        uri: file.uri,
      };

      await stopPreviewCallback();
      onSelect(customRingtone);
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", "Failed to select audio file");
      console.error("Document picker error:", err);
    }
  };

  const renderRingtoneItem = ({ item }: { item: Ringtone }) => {
    const isSelected = selectedRingtone.name === item.name;
    const isPreviewing = previewingRingtone === item.name;

    return (
      <View style={[styles.ringtoneItem, { backgroundColor: t.bg.surface }]}
      testID={`ringtone-${item.name}`}>
        <TouchableOpacity
          style={styles.ringtoneContent}
          onPress={() => {
            void stopPreviewCallback();
            onSelect(item);
            setModalVisible(false);
          }}
        >
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={24}
            color={isSelected ? t.action.primaryBg : t.text.secondary}
          />
          <View style={styles.ringtoneInfo}>
            <Text style={[styles.ringtoneName, { color: t.text.primary }]}>
              {item.name}
            </Text>
            {item.type === "custom" && item.uri && (
              <Text style={[styles.ringtoneUri, { color: t.text.secondary }]} numberOfLines={1}>
                Custom file
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.previewButton,
            { backgroundColor: isPreviewing ? t.action.primaryBg : t.action.secondaryBg },
          ]}
          onPress={() => void handlePreview(item)}
        >
          <Ionicons
            name={isPreviewing ? "stop" : "play"}
            size={16}
            color={isPreviewing ? t.action.primaryText : t.action.secondaryText}
          />
          <Text
            style={[
              styles.previewText,
              { color: isPreviewing ? t.action.primaryText : t.action.secondaryText },
            ]}
          >
            {isPreviewing ? "Stop" : "Preview"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {/* Selected Ringtone Display */}
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: t.bg.surface, borderColor: t.border.default }]}
        onPress={() => setModalVisible(true)}
        testID="ringtone-selector"
      >
        <View style={styles.selectorLeft}>
          <Ionicons name="musical-note" size={20} color={t.text.secondary} />
          <Text style={[styles.selectorText, { color: t.text.primary }]}>
            {selectedRingtone.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.text.secondary} />
      </TouchableOpacity>

      {/* Vibration Toggle */}
      <TouchableOpacity
        style={[styles.vibrationToggle, { backgroundColor: t.bg.surface }]}
        onPress={() => onVibrationChange(!vibration)}
        testID="vibration-toggle"
      >
        <View style={styles.vibrationLeft}>
          <Ionicons 
            name={vibration ? "volume-high" : "volume-mute"} 
            size={20} 
            color={vibration ? t.action.primaryBg : t.text.secondary} 
          />
          <Text style={[styles.vibrationText, { color: t.text.primary }]}>
            Vibration
          </Text>
        </View>
        <View
          style={[
            styles.toggle,
            {
              backgroundColor: vibration ? t.action.primaryBg : t.border.default,
            },
          ]}
        >
          <View
            style={[
              styles.toggleCircle,
              {
                backgroundColor: t.bg.surface,
                transform: [{ translateX: vibration ? 20 : 0 }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Ringtone Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          void stopPreviewCallback();
          setModalVisible(false);
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: t.bg.app }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.text.primary }]}>
                Select Ringtone
              </Text>
              <TouchableOpacity onPress={() => { void stopPreviewCallback(); setModalVisible(false); }}>
                <Ionicons name="close" size={24} color={t.text.secondary} />
              </TouchableOpacity>
            </View>

            {isLoadingRingtones ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={t.action.primaryBg} />
                <Text style={[styles.loadingText, { color: t.text.secondary }]}>
                  Loading ringtones...
                </Text>
              </View>
            ) : (
              <FlatList
                data={[
                  ...deviceRingtones.map(r => ({
                    type: r.type as Ringtone["type"],
                    name: r.name,
                    uri: r.uri,
                  })),
                ]}
                renderItem={renderRingtoneItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.ringtoneList}
                showsVerticalScrollIndicator={false}
              />
            )}

            <TouchableOpacity
              style={[styles.customButton, { backgroundColor: t.action.secondaryBg }]}
              onPress={handleSelectCustom}
              testID="select-custom-ringtone"
            >
              <Ionicons name="folder-open" size={20} color={t.action.secondaryText} />
              <Text style={[styles.customButtonText, { color: t.action.secondaryText }]}>
                Choose Custom Sound
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  vibrationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  vibrationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vibrationText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  ringtoneList: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  ringtoneItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  ringtoneContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  ringtoneInfo: {
    flex: 1,
  },
  ringtoneName: {
    fontSize: 16,
    fontWeight: "500",
  },
  ringtoneUri: {
    fontSize: 12,
    marginTop: 2,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 12,
    fontWeight: "500",
  },
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
