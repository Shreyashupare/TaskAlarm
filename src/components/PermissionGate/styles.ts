import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  checkingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionsList: {
    width: "100%",
    gap: 16,
  },
  permissionItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  permissionDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  grantedBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  grantButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  grantButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  warningText: {
    marginTop: 24,
    fontSize: 12,
    textAlign: "center",
  },
});
