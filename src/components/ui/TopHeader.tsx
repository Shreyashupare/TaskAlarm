import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeTokens } from "../../theme";

type TopHeaderProps = {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
};

export function TopHeader({ title, onBack, rightAction }: TopHeaderProps) {
  const t = useThemeTokens();

  return (
    <View style={[styles.container, { backgroundColor: t.bg.app }]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={t.action.primaryBg} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: t.text.primary }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress}>
            <Ionicons
              name={rightAction.icon}
              size={24}
              color={t.action.primaryBg}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  right: {
    width: 40,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 24,
  },
});
