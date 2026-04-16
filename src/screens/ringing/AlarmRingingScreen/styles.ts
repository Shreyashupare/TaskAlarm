import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color set dynamically via theme
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  errorBanner: {
    backgroundColor: "#f44336",
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  errorBannerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 64,
    fontWeight: "200",
    fontVariant: ["tabular-nums"],
    // Color set dynamically via theme
  },
  label: {
    fontSize: 18,
    marginTop: 8,
    // Color set dynamically via theme
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    // Color set dynamically via theme
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    // Background color set dynamically via theme
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    // Background color set dynamically via theme
  },
  taskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  taskCard: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    // Background color set dynamically via theme
  },
  taskQuestion: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    // Color set dynamically via theme
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
    borderRadius: 12,
    alignItems: "center",
    // Background color set dynamically via theme
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    // Color set dynamically via theme
  },
  colorBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "rgba(128,128,128,0.3)",
  },
  shapeContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(128,128,128,0.1)",
    borderWidth: 3,
    borderColor: "rgba(128,128,128,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  shapeSvg: {
    width: 50,
    height: 50,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
    // Colors set dynamically via theme
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    // Background color set dynamically via theme
  },
  submitText: {
    fontSize: 18,
    fontWeight: "600",
    // Color set dynamically via theme
  },
  stopContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  stopButton: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    // Background color set dynamically via theme
  },
  stopButtonDisabled: {
    // Background color set dynamically via theme
  },
  stopText: {
    fontSize: 20,
    fontWeight: "700",
    // Color set dynamically via theme
  },
  lockedText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    // Color set dynamically via theme
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginTop: 8,
  },
  // V2.0: Reflection task styles
  reflectionInput: {
    minHeight: 120,
    textAlign: "left",
    paddingTop: 12,
    fontSize: 18,
  },
  // V2.0: Count objects task styles
  objectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    maxHeight: 150,
  },
  objectItem: {
    margin: 4,
  },
});
