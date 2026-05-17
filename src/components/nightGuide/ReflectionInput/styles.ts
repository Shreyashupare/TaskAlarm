import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
