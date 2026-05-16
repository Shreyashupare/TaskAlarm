import { StyleSheet } from "react-native";

export const CIRCLE_SIZE = 28;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  list: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  sentence: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 26,
    paddingTop: 2,
  },
  circleHit: {
    padding: 2,
  },
});
