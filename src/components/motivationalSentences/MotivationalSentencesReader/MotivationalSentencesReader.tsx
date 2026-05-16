import { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOTIVATIONAL_SENTENCE_DELAY_MS } from "../../../constants/AppConstants";
import { speakSentence, stopSpeaking } from "../../../services/speechService";
import { useThemeTokens } from "../../../theme";
import { styles } from "./styles";
import {
  MARK_AS_READ_LABEL,
  READ_OUT_LOUD_TITLE,
  SENTENCE_READ_LABEL,
} from "./helpers/constants";

type MotivationalSentencesReaderProps = {
  sentences: string[];
  onComplete: () => void;
  enableTextToSpeech: boolean;
};

export default function MotivationalSentencesReader({
  sentences,
  onComplete,
  enableTextToSpeech,
}: MotivationalSentencesReaderProps) {
  const t = useThemeTokens();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentSentence = sentences[currentIndex] ?? "";

  useEffect(() => {
    if (!enableTextToSpeech || !currentSentence) return;
    speakSentence(currentSentence);
    return () => {
      stopSpeaking();
    };
  }, [currentIndex, currentSentence, enableTextToSpeech]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleMarkAsRead = useCallback(() => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    stopSpeaking();

    setTimeout(() => {
      if (currentIndex + 1 >= sentences.length) {
        onComplete();
      } else {
        setCurrentIndex((i) => i + 1);
        setIsAdvancing(false);
      }
    }, MOTIVATIONAL_SENTENCE_DELAY_MS);
  }, [currentIndex, sentences.length, isAdvancing, onComplete]);

  const canMark = !isAdvancing;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: t.text.primary }]}>{READ_OUT_LOUD_TITLE}</Text>
      <Text style={[styles.sentence, { color: t.text.primary }]}>{currentSentence}</Text>
      {isAdvancing ? (
        <View style={styles.readBadge}>
          <Ionicons name="checkmark-circle" size={24} color={t.action.primaryBg} />
          <Text style={[styles.readBadgeText, { color: t.action.primaryBg }]}>
            {SENTENCE_READ_LABEL}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.markButton,
            { backgroundColor: canMark ? t.action.primaryBg : t.border.default },
          ]}
          onPress={handleMarkAsRead}
          disabled={!canMark}
        >
          <Text
            style={[
              styles.markButtonText,
              { color: canMark ? t.action.primaryText : t.text.secondary },
            ]}
          >
            {MARK_AS_READ_LABEL}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
