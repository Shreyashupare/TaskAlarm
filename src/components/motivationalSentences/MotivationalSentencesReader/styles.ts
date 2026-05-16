import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  sentence: {
    fontSize: 26,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 40,
  },
  markButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  markButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  readBadgeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
