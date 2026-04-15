import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e", // Dark background for ringing screen
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  time: {
    fontSize: 64,
    fontWeight: "200",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 18,
    color: "#aaa",
    marginTop: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  taskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  taskQuestion: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  optionButton: {
    minWidth: 80,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  stopContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  stopButton: {
    backgroundColor: "#f44336",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  stopButtonDisabled: {
    backgroundColor: "rgba(244,67,54,0.3)",
  },
  stopText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  lockedText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginTop: 8,
  },
});
