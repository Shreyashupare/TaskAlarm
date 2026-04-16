import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import type { RootStackParamList } from "../../../navigation/RootStack";
import { useRingingStore } from "../../../stores/useRingingStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import type { Quote } from "../../../constants/types";
import * as quoteRepository from "../../../data/repositories/quoteRepository";
import { DEBUG } from "../../../constants/AppConstants";
import { useThemeTokens } from "../../../theme";
import { styles } from "./styles";
import { getGreeting, formatTime } from "./helpers/utils";

type Props = NativeStackScreenProps<RootStackParamList, "Quote">;

export default function QuoteScreen({ navigation }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { reset, quote: storeQuote } = useRingingStore();
  const { timeFormat } = useSettingsStore();
  const t = useThemeTokens();
  const use24Hour = timeFormat === "24h";

  useEffect(() => {
    // Update clock
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load quote - use store quote if available, otherwise fetch new
    const loadQuote = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        // Seed quotes if empty first (with retry)
        await quoteRepository.seedQuotesIfEmpty();

        // Small delay to ensure DB is ready
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Use store quote if available
        if (storeQuote) {
          setQuote(storeQuote);
        } else {
          // Fetch random quote
          const randomQuote = await quoteRepository.getRandomQuote();
          setQuote(randomQuote);
        }
      } catch (err) {
        if (DEBUG) console.error("Failed to load quote:", err);
        // Retry once if initial load fails
        if (retryCount < 1) {
          setTimeout(() => loadQuote(retryCount + 1), 500);
          return;
        }
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuote();
  }, [storeQuote]);

  const handleDismiss = () => {
    reset();
    navigation.navigate("MainTabs", { screen: "Alarms" });
  };

  const greeting = getGreeting();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg.app }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("MainTabs", { screen: "Alarms" })}
      >
        <Ionicons name="arrow-back" size={28} color={t.icon.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Greeting and Time */}
        <Text style={[styles.greeting, { color: t.text.secondary }]}>{greeting}</Text>
        <Text style={[styles.time, { color: t.text.primary }]}>{formatTime(currentTime, use24Hour)}</Text>

        {/* Quote or Fallback */}
        <View style={[styles.quoteCard, { backgroundColor: t.bg.surfaceElevated }]}>
          {isLoading ? (
            <Text style={[styles.quoteText, { color: t.text.primary }]}>Loading...</Text>
          ) : quote ? (
            <>
              <Text style={[styles.quoteText, { color: t.text.primary }]}>
                &ldquo;{quote.text}&rdquo;
              </Text>
              {quote.author && (
                <Text style={[styles.quoteAuthor, { color: t.text.secondary }]}>
                  &mdash; {quote.author}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.fallbackText, { color: t.text.primary }]}>
              {greeting}!
            </Text>
          )}
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          style={[styles.dismissButton, { backgroundColor: t.action.secondaryBg }]}
          onPress={handleDismiss}
        >
          <Text style={[styles.dismissText, { color: t.action.secondaryText }]}>Start Your Day</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
