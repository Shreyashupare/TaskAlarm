import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerTitle: { fontSize: 20, fontWeight: "600" },

  // Section
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },

  // Date header
  dateHeader: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Card
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardType: { fontSize: 11, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 },
  cardQuestion: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  cardResponse: { fontSize: 15, lineHeight: 21 },
  cardTime: { fontSize: 11, marginTop: 6 },

  // Empty
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: "500", marginTop: 12 },
  emptySubtext: { fontSize: 13, marginTop: 6, textAlign: "center", paddingHorizontal: 20 },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabLabel: { fontSize: 14, fontWeight: "600" },

  // Stats row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 3 },

  // Unwind progress
  unwindDayCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  unwindStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 4,
  },
  unwindStat: { alignItems: "center" },
  unwindStatValue: { fontSize: 16, fontWeight: "700" },
  unwindStatLabel: { fontSize: 11, marginTop: 2 },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
