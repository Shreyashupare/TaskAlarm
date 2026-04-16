import { StyleSheet } from "react-native";

/**
 * My Questions Screen Styles
 * Following theming standards: use centralized theme tokens
 */

// Placeholder - will use useThemeTokens hook in actual components
// Colors match existing app palette
export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  questionCount: {
    fontSize: 14,
    color: "#666666",
  },

  // Question List
  questionList: {
    paddingBottom: 100, // Space for FAB
  },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  optionBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  optionBadgeText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },

  // Actions
  actionButtons: {
    flexDirection: "row",
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#e3f2fd",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1976d2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabDisabled: {
    backgroundColor: "#b0bec5",
  },
  fabText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalBody: {
    padding: 20,
  },

  // Form Fields
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  formLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: "#999999",
  },
  charCounterWarning: {
    color: "#ff9800",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#f44336",
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 4,
  },

  // Options Section
  optionsSection: {
    marginTop: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionRemoveButton: {
    padding: 8,
    marginLeft: 8,
  },
  optionRemoveText: {
    fontSize: 20,
    color: "#f44336",
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addOptionText: {
    color: "#1976d2",
    fontWeight: "500",
  },

  // Correct Answer Selector
  correctAnswerSection: {
    marginTop: 20,
  },
  correctAnswerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  correctAnswerChipSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1976d2",
  },
  correctAnswerChipText: {
    color: "#666666",
    fontSize: 14,
  },
  correctAnswerChipTextSelected: {
    color: "#1976d2",
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: "#f5f5f5",
  },
  buttonPrimary: {
    backgroundColor: "#1976d2",
  },
  buttonPrimaryDisabled: {
    backgroundColor: "#b0bec5",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#666666",
  },
  buttonTextPrimary: {
    color: "#ffffff",
  },
});
