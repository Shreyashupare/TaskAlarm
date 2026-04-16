import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color set dynamically via theme
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  greeting: {
    fontSize: 18,
    marginBottom: 8,
    // Color set dynamically via theme
  },
  time: {
    fontSize: 48,
    fontWeight: "200",
    marginBottom: 48,
    fontVariant: ["tabular-nums"],
    // Color set dynamically via theme
  },
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    // Background color set dynamically via theme
  },
  quoteText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
    // Color set dynamically via theme
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    // Color set dynamically via theme
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    // Color set dynamically via theme
  },
  dismissButton: {
    marginTop: 48,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    // Background color set dynamically via theme
  },
  dismissText: {
    fontSize: 16,
    fontWeight: "600",
    // Color set dynamically via theme
  },
});
