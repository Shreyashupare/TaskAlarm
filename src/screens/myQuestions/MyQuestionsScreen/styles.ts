import { StyleSheet } from "react-native";

/**
 * My Questions Screen Styles
 * Following theming standards: use centralized theme tokens
 */

// Theme-compatible styles - colors applied via inline styles in component
export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  questionCount: {
    fontSize: 14,
  },

  // Question List
  questionList: {
    paddingBottom: 100, // Space for FAB
    padding: 16,
  },
  questionCard: {
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
  },
  optionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  optionBadgeText: {
    fontSize: 12,
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

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
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
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalBody: {
    padding: 20,
  },

  // Form Fields
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
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
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  optionRemoveButton: {
    padding: 8,
    marginLeft: 8,
  },
  optionRemoveText: {
    fontSize: 20,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addOptionText: {
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
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  correctAnswerChipText: {
    fontSize: 14,
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
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  // Keep these for component reference - colors applied inline
  editButton: {},
  deleteButton: {},
  fabDisabled: {},
  charCounterWarning: {},
  correctAnswerChipSelected: {},
  correctAnswerChipTextSelected: {},
  buttonSecondary: {},
  buttonPrimary: {},
  buttonPrimaryDisabled: {},
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextSecondary: {},
  buttonTextPrimary: {},
});
