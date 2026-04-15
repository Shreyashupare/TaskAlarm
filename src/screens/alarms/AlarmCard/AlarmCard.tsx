import { View, Text, TouchableOpacity } from "react-native";
import { useThemeTokens } from "../../../theme";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { AppSwitch } from "../../../components/ui";
import type { Alarm } from "../../../constants/types";
import { formatTime, formatWeekdays } from "./helpers/utils";
import { styles } from "./styles";

type AlarmCardProps = {
  alarm: Alarm;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function AlarmCard({ alarm, onToggle, onEdit, onDelete }: AlarmCardProps) {
  const t = useThemeTokens();
  const { timeFormat } = useSettingsStore();
  const use24Hour = timeFormat === "24h";

  return (
    <TouchableOpacity
      onPress={onEdit}
      onLongPress={onDelete}
      delayLongPress={500}
      style={[
        styles.card,
        {
          backgroundColor: t.bg.surface,
          borderColor: t.border.default,
        },
      ]}
    >
      <View style={styles.cardRow}>
        <Text style={[styles.time, { color: t.text.primary }]}>
          {formatTime(alarm.time, use24Hour)}
        </Text>
        <TouchableOpacity onPress={(e) => e.stopPropagation()} activeOpacity={1}>
          <AppSwitch value={alarm.enabled} onValueChange={onToggle} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.weekdays, { color: t.text.secondary }]}>
          {formatWeekdays(alarm.weekdays)}
        </Text>
        <Text style={[styles.sound, { color: t.text.secondary }]}>
          {alarm.soundName}
        </Text>
      </View>

      {alarm.label && (
        <View style={styles.cardRow}>
          <Text style={[styles.label, { color: t.text.secondary }]}>
            {alarm.label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

