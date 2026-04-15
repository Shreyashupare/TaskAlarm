import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeTokens } from "../../../theme";
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

  return (
    <View
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
          {formatTime(alarm.time)}
        </Text>
        <AppSwitch value={alarm.enabled} onValueChange={onToggle} />
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.weekdays, { color: t.text.secondary }]}>
          {formatWeekdays(alarm.weekdays)}
        </Text>
        <Text style={[styles.sound, { color: t.text.secondary }]}>
          {alarm.soundName}
        </Text>
      </View>

      <View style={styles.cardRow}>
        {alarm.label ? (
          <Text style={[styles.label, { color: t.text.secondary }]}>
            {alarm.label}
          </Text>
        ) : (
          <View />
        )}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color={t.icon.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={t.state.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

