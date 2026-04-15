import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useThemeTokens } from "../../theme";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const t = useThemeTokens();

  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === "primary"
      ? t.action.primaryBg
      : variant === "danger"
        ? t.action.dangerBg
        : t.action.secondaryBg;

  const textColor =
    variant === "primary"
      ? t.action.primaryText
      : variant === "danger"
        ? t.action.dangerText
        : t.action.secondaryText;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor },
        isDisabled && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
