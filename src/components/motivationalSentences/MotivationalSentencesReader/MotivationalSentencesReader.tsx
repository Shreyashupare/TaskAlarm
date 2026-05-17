import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOTIVATIONAL_SENTENCE_DELAY_MS } from "../../../constants/AppConstants";
import { speakSentence, stopSpeaking } from "../../../services/speechService";
import { useThemeTokens } from "../../../theme";
import { styles, CIRCLE_SIZE } from "./styles";
import { READ_OUT_LOUD_TITLE } from "./helpers/constants";

type SentenceStatus = "locked" | "active" | "read";

type MotivationalSentencesReaderProps = {
  sentences: string[];
  onComplete: () => void;
  enableTextToSpeech: boolean;
};

function getSentenceStatus(index: number, readIndices: Set<number>, activeIndex: number): SentenceStatus {
  if (readIndices.has(index)) return "read";
  if (index === activeIndex) return "active";
  return "locked";
}

export default function MotivationalSentencesReader({
  sentences,
  onComplete,
  enableTextToSpeech,
}: MotivationalSentencesReaderProps) {
  const t = useThemeTokens();
  const [readIndices, setReadIndices] = useState<Set<number>>(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const activeSentence = sentences[activeIndex] ?? "";

  useEffect(() => {
    if (!enableTextToSpeech || !activeSentence || isAdvancing) return;
    speakSentence(activeSentence);
    return () => {
      stopSpeaking();
    };
  }, [activeIndex, activeSentence, enableTextToSpeech, isAdvancing]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleMarkSentence = useCallback(
    (index: number) => {
      if (isAdvancing || index !== activeIndex || readIndices.has(index)) return;

      setIsAdvancing(true);
      stopSpeaking();
      setReadIndices((prev) => new Set(prev).add(index));

      const next = index + 1;
      if (next >= sentences.length) {
        // No delay for last sentence - immediately finish
        onComplete();
      } else {
        setTimeout(() => {
          setActiveIndex(next);
          setIsAdvancing(false);
        }, MOTIVATIONAL_SENTENCE_DELAY_MS);
      }
    },
    [activeIndex, isAdvancing, readIndices, sentences.length, onComplete]
  );

  const rows = useMemo(
    () =>
      sentences.map((sentence, index) => ({
        sentence,
        index,
        status: getSentenceStatus(index, readIndices, activeIndex),
      })),
    [sentences, readIndices, activeIndex]
  );

  const renderCircle = (status: SentenceStatus, index: number) => {
    if (status === "read") {
      return (
        <Ionicons name="checkmark-circle" size={CIRCLE_SIZE} color={t.action.primaryBg} />
      );
    }

    if (status === "active") {
      return (
        <Ionicons
          name="ellipse-outline"
          size={CIRCLE_SIZE}
          color={isAdvancing ? t.text.secondary : t.action.primaryBg}
        />
      );
    }

    return <Ionicons name="ellipse-outline" size={CIRCLE_SIZE} color={t.border.default} />;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: t.text.primary }]}>{READ_OUT_LOUD_TITLE}</Text>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {rows.map(({ sentence, index, status }) => {
          const canTap = status === "active" && !isAdvancing;

          return (
            <View key={`${index}-${sentence}`} style={styles.row}>
              <TouchableOpacity
                style={styles.circleHit}
                onPress={() => handleMarkSentence(index)}
                disabled={!canTap}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: status === "read", disabled: !canTap }}
              >
                {renderCircle(status, index)}
              </TouchableOpacity>
              <Text
                style={[
                  styles.sentence,
                  {
                    color: status === "locked" ? t.text.secondary : t.text.primary,
                    opacity: status === "locked" ? 0.55 : 1,
                  },
                ]}
              >
                {sentence}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
