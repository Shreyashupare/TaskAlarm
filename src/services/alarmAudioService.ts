import { useAudioPlayer } from "expo-audio";
import { useEffect, useRef, useCallback } from "react";

// MVP: The alarm sound is primarily handled by the notification system
// which plays the default alarm sound when triggered.
// This hook provides a placeholder for future in-app audio enhancements.

export function useAlarmAudio() {
  // Use default empty source initially - will be set when starting
  const player = useAudioPlayer(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
          player.remove();
        } catch {
          // Ignore cleanup errors
        }
      }
      isPlayingRef.current = false;
    };
  }, [player]);

  const startLoop = useCallback(async () => {
    if (!player) return;
    try {
      // For MVP, we rely on the notification sound primarily
      // In-app audio is optional enhancement
      isPlayingRef.current = true;
    } catch (err) {
      console.error("Failed to start alarm audio:", err);
    }
  }, [player]);

  const stop = useCallback(async () => {
    if (!player) return;
    try {
      player.loop = false;
      await player.pause();
      isPlayingRef.current = false;
    } catch (err) {
      console.error("Failed to stop alarm audio:", err);
    }
  }, [player]);

  return { startLoop, stop, player, isPlaying: () => isPlayingRef.current };
}

export async function configureAudioSession(): Promise<void> {
  // MVP: Audio session is handled by the notification system
  // The notification's sound plays even when app is in background
  console.log("Audio session configured (using notification sound)");
}
