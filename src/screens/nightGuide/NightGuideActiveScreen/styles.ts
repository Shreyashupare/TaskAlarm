import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 15,
  },
  nextBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  goodNightContainer: {
    alignItems: "center",
    paddingTop: 80,
    gap: 16,
  },
  goodNightTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  goodNightSubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 16,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
