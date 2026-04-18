import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useThemeTokens } from "../../../theme";
import type { CustomQuestion } from "../../../constants/types";
import {
  MAX_QUESTIONS,
  MAX_OPTIONS,
  MIN_OPTIONS,
  MAX_QUESTION_LENGTH,
  MAX_OPTION_LENGTH,
  generateQuestionId,
  validateQuestion,
  createEmptyQuestion,
} from "./helpers/constants";
import {
  truncateQuestion,
  getOptionCountLabel,
  cloneQuestion,
  areQuestionsEqual,
} from "./helpers/utils";

/**
 * My Questions Screen
 * V2.0 Feature: CRUD for custom user questions
 * - Max 10 questions
 * - 2-4 options per question
 * - 80 char limit for questions, 20 for options
 */

export default function MyQuestionsScreen() {
  const t = useThemeTokens();
  const { customQuestions, updateCustomQuestions } = useSettingsStore();
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [originalQuestion, setOriginalQuestion] = useState<CustomQuestion | null>(null);

  const questions = customQuestions;
  const canAddMore = questions.length < MAX_QUESTIONS;

  // Handle add new question
  const handleAdd = useCallback(() => {
    if (!canAddMore) {
      Alert.alert("Maximum Reached", `You can only have up to ${MAX_QUESTIONS} questions.`);
      return;
    }
    const empty = createEmptyQuestion();
    setEditingQuestion(empty);
    setOriginalQuestion(null);
    setIsModalVisible(true);
  }, [canAddMore]);

  // Handle edit question
  const handleEdit = useCallback((question: CustomQuestion) => {
    const clone = cloneQuestion(question);
    setEditingQuestion(clone);
    setOriginalQuestion(cloneQuestion(question));
    setIsModalVisible(true);
  }, []);

  // Handle delete question
  const handleDelete = useCallback(
    (questionId: string) => {
      Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = questions.filter((q: CustomQuestion) => q.id !== questionId);
            updateCustomQuestions(updated);
          },
        },
      ]);
    },
    [questions]
  );

  // Handle save question
  const handleSave = useCallback(() => {
    if (!editingQuestion) return;

    const validation = validateQuestion(editingQuestion);
    if (!validation.isValid) {
      Alert.alert("Invalid Question", validation.error);
      return;
    }

    let updated: CustomQuestion[];
    const existingIndex = questions.findIndex((q: CustomQuestion) => q.id === editingQuestion.id);

    if (existingIndex >= 0) {
      // Update existing
      updated = [...questions];
      updated[existingIndex] = editingQuestion;
    } else {
      // Add new
      updated = [...questions, editingQuestion];
    }

    updateCustomQuestions(updated);
    setIsModalVisible(false);
    setEditingQuestion(null);
    setOriginalQuestion(null);
  }, [editingQuestion, questions, updateCustomQuestions]);

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    if (editingQuestion && originalQuestion) {
      const isDirty = !areQuestionsEqual(editingQuestion, originalQuestion);
      if (isDirty) {
        Alert.alert("Discard Changes?", "You have unsaved changes. Discard them?", [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setIsModalVisible(false);
              setEditingQuestion(null);
              setOriginalQuestion(null);
            },
          },
        ]);
        return;
      }
    }
    setIsModalVisible(false);
    setEditingQuestion(null);
    setOriginalQuestion(null);
  }, [editingQuestion, originalQuestion]);

  // Update question text
  const updateQuestionText = useCallback((text: string) => {
    setEditingQuestion((prev) => (prev ? { ...prev, question: text } : null));
  }, []);

  // Update option text
  const updateOption = useCallback((index: number, text: string) => {
    setEditingQuestion((prev) => {
      if (!prev) return null;
      const options = [...prev.options];
      options[index] = text;
      return { ...prev, options };
    });
  }, []);

  // Add new option
  const addOption = useCallback(() => {
    setEditingQuestion((prev) => {
      if (!prev || prev.options.length >= MAX_OPTIONS) return prev;
      return { ...prev, options: [...prev.options, ""] };
    });
  }, []);

  // Remove option
  const removeOption = useCallback((index: number) => {
    setEditingQuestion((prev) => {
      if (!prev || prev.options.length <= MIN_OPTIONS) return prev;
      const options = prev.options.filter((_, i) => i !== index);

      // Update correct answer if the removed option was selected
      let correctAnswer = prev.correctAnswer;
      if (prev.options[index] === prev.correctAnswer) {
        correctAnswer = "";
      }

      return { ...prev, options, correctAnswer };
    });
  }, []);

  // Set correct answer
  const setCorrectAnswer = useCallback((answer: string) => {
    setEditingQuestion((prev) => (prev ? { ...prev, correctAnswer: answer } : null));
  }, []);

  // Check if form is valid for saving
  const isFormValid = useMemo(() => {
    if (!editingQuestion) return false;
    const validation = validateQuestion(editingQuestion);
    return validation.isValid;
  }, [editingQuestion]);

  // Render question item
  const renderQuestionItem = useCallback(
    ({ item }: { item: CustomQuestion }) => (
      <View style={[styles.questionCard, { backgroundColor: t.bg.surface }]}>
        <Text style={[styles.questionText, { color: t.text.primary }]}>{truncateQuestion(item.question)}</Text>
        <View style={[styles.optionBadge, { backgroundColor: t.action.primaryBg + "20" }]}>
          <Text style={[styles.optionBadgeText, { color: t.action.primaryBg }]}>{getOptionCountLabel(item.options.length)}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.action.primaryBg + "15" }]}
            onPress={() => handleEdit(item)}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.action.dangerBg + "15" }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEdit, handleDelete, t]
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 48 }}>❓</Text>
      <Text style={[styles.emptyStateText, { color: t.text.secondary }]}>No Questions Yet</Text>
      <Text style={[styles.emptyStateSubtext, { color: t.text.secondary }]}>
        Tap the + button to add your first custom question. These will appear in your alarm tasks.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.bg.surface, borderBottomColor: t.border.default }]}>
        <Text style={[styles.headerTitle, { color: t.text.primary }]}>My Questions</Text>
        <Text style={[styles.questionCount, { color: t.text.secondary }]}>
          {questions.length}/{MAX_QUESTIONS}
        </Text>
      </View>

      {/* Question List */}
      {questions.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={questions}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.questionList}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: canAddMore ? t.action.primaryBg : t.border.default }]}
        onPress={handleAdd}
        disabled={!canAddMore}
      >
        <Text style={[styles.fabText, { color: t.action.primaryText }]}>+</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={isModalVisible} animationType="fade" transparent onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t.bg.surface }]}>
            <ScrollView>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: t.border.default }]}>
                <Text style={[styles.modalTitle, { color: t.text.primary }]}>
                  {originalQuestion ? "Edit Question" : "New Question"}
                </Text>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={{ fontSize: 24, color: t.text.primary }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              {editingQuestion && (
                <View style={styles.modalBody}>
                  {/* Question Input */}
                  <View style={styles.formLabelRow}>
                    <Text style={[styles.formLabel, { color: t.text.primary }]}>Question</Text>
                    <Text
                      style={[
                        styles.charCounter,
                        { color: editingQuestion.question.length > MAX_QUESTION_LENGTH * 0.8 ? t.state.warning : t.text.secondary },
                      ]}
                    >
                      {editingQuestion.question.length}/{MAX_QUESTION_LENGTH}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: t.text.primary,
                        backgroundColor: t.bg.app,
                        borderColor: editingQuestion.question.length > MAX_QUESTION_LENGTH ? t.action.dangerBg : t.border.default,
                      },
                    ]}
                    value={editingQuestion.question}
                    onChangeText={updateQuestionText}
                    placeholder="Enter your question..."
                    placeholderTextColor={t.text.secondary}
                    multiline
                    maxLength={MAX_QUESTION_LENGTH}
                    autoFocus
                  />
                  {editingQuestion.question.length > MAX_QUESTION_LENGTH && (
                    <Text style={[styles.errorText, { color: t.action.dangerBg }]}>
                      Maximum {MAX_QUESTION_LENGTH} characters
                    </Text>
                  )}

                  {/* Options Section */}
                  <View style={styles.optionsSection}>
                    <View style={styles.formLabelRow}>
                      <Text style={[styles.formLabel, { color: t.text.primary }]}>Options</Text>
                      <Text style={[styles.charCounter, { color: t.text.secondary }]}>
                        {editingQuestion.options.length}/{MAX_OPTIONS}
                      </Text>
                    </View>

                    {editingQuestion.options.map((option, index) => (
                      <View key={index} style={styles.optionRow}>
                        <TextInput
                          style={[
                            styles.optionInput,
                            {
                              color: t.text.primary,
                              backgroundColor: t.bg.app,
                              borderColor: option.length > MAX_OPTION_LENGTH ? t.state.error : t.border.default,
                            },
                          ]}
                          value={option}
                          onChangeText={(text) => updateOption(index, text)}
                          placeholder={`Option ${index + 1}`}
                          placeholderTextColor={t.text.secondary}
                          maxLength={MAX_OPTION_LENGTH}
                        />
                        {editingQuestion.options.length > MIN_OPTIONS && (
                          <TouchableOpacity
                            style={styles.optionRemoveButton}
                            onPress={() => removeOption(index)}
                          >
                            <Text style={[styles.optionRemoveText, { color: t.state.error }]}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {editingQuestion.options.length < MAX_OPTIONS && (
                      <TouchableOpacity
                        style={[styles.addOptionButton, { borderColor: t.action.primaryBg }]}
                        onPress={addOption}
                      >
                        <Text style={[styles.addOptionText, { color: t.action.primaryBg }]}>+ Add Option</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Correct Answer Section */}
                  <View style={styles.correctAnswerSection}>
                    <Text style={[styles.formLabel, { color: t.text.primary }]}>Correct Answer</Text>
                    <View style={styles.chipsContainer}>
                      {editingQuestion.options
                        .filter((o) => o.trim().length > 0)
                        .map((option, index) => {
                          const isSelected = editingQuestion.correctAnswer === option;
                          return (
                            <TouchableOpacity
                              key={`${option}_${index}`}
                              style={[
                                styles.correctAnswerChip,
                                {
                                  backgroundColor: isSelected ? t.action.primaryBg + "20" : t.bg.app,
                                  borderColor: isSelected ? t.action.primaryBg : t.border.default,
                                },
                              ]}
                              onPress={() => setCorrectAnswer(option)}
                            >
                              <Text
                                style={[
                                  styles.correctAnswerChipText,
                                  { color: isSelected ? t.action.primaryBg : t.text.secondary },
                                ]}
                              >
                                {truncateQuestion(option, 20)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View>
                </View>
              )}

              {/* Modal Actions */}
              <View style={[styles.modalActions, { borderTopColor: t.border.default }]}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: t.bg.app }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, { color: t.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: isFormValid ? t.action.primaryBg : t.border.default }]}
                  onPress={handleSave}
                  disabled={!isFormValid}
                >
                  <Text style={[styles.buttonText, { color: isFormValid ? t.action.primaryText : t.text.secondary }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
