import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeTokens } from "../../../theme";
import { getRandomNightReflectionQuestion } from "../../../constants/defaultNightReflectionQuestions";
import { styles } from "./styles";

type ReflectionInputProps = {
  onComplete: (question: string, response: string) => void;
};

export default function ReflectionInput({ onComplete }: ReflectionInputProps) {
  const t = useThemeTokens();
  const [question] = useState(getRandomNightReflectionQuestion);
  const [response, setResponse] = useState("");

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: t.text.secondary }]}>Night Reflection</Text>
      <Text style={[styles.question, { color: t.text.primary }]}>{question}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: t.bg.surfaceElevated,
            color: t.text.primary,
            borderColor: t.border.default,
          },
        ]}
        placeholder="Type your reflection..."
        placeholderTextColor={t.text.secondary}
        value={response}
        onChangeText={setResponse}
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: response.trim()
              ? t.action.primaryBg
              : t.border.default,
          },
        ]}
        onPress={() => response.trim() && onComplete(question, response.trim())}
        disabled={!response.trim()}
      >
        <Ionicons name="checkmark-circle" size={20} color={t.action.primaryText} />
        <Text style={[styles.buttonText, { color: t.action.primaryText }]}>Complete Reflection</Text>
      </TouchableOpacity>
    </View>
  );
}
