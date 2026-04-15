import { Switch, StyleProp, ViewStyle } from "react-native";
import { useThemeTokens } from "../../theme";

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppSwitch({
  value,
  onValueChange,
  disabled = false,
  style,
}: AppSwitchProps) {
  const t = useThemeTokens();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      style={style}
      trackColor={{
        false: t.border.default,
        true: t.action.primaryBg,
      }}
      thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
    />
  );
}
