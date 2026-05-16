import * as Speech from "expo-speech";

export function speakSentence(sentence: string): void {
  Speech.speak(sentence, {
    language: "en",
    pitch: 1.0,
    rate: 0.8,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
