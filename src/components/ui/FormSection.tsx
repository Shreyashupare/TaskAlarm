import { View, Text, StyleSheet, ViewProps } from "react-native";
import { useThemeTokens } from "../../theme";

type FormSectionProps = ViewProps & {
  title?: string;
  children: React.ReactNode;
};

export function FormSection({ title, children, style, ...rest }: FormSectionProps) {
  const t = useThemeTokens();

  return (
    <View style={[styles.container, style]} {...rest}>
      {title && (
        <Text style={[styles.title, { color: t.text.secondary }]}>
          {title}
        </Text>
      )}
      <View
        style={[
          styles.content,
          {
            backgroundColor: t.bg.surface,
            borderColor: t.border.default,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 16,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
});
