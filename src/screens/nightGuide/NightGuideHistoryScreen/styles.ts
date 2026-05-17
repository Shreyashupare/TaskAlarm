import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CALENDAR_PADDING = 16;
const DAY_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarHeaderCell: {
    width: DAY_SIZE,
    alignItems: "center",
    paddingVertical: 8,
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: "600",
  },
  calendarDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DAY_SIZE / 2,
  },
  calendarDayText: {
    fontSize: 14,
  },
});
