import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  greeting: {
    fontSize: 18,
    color: "#aaa",
    marginBottom: 8,
  },
  time: {
    fontSize: 48,
    fontWeight: "200",
    color: "#fff",
    marginBottom: 48,
    fontVariant: ["tabular-nums"],
  },
  quoteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
  },
  quoteAuthor: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 16,
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  dismissButton: {
    marginTop: 48,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  dismissText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
