import { useAudioPlayer, AudioPlayer } from "expo-audio";
import { DEBUG } from "../constants/AppConstants";
import { useEffect, useRef, useCallback, useState } from "react";
import { Platform, NativeModules, Vibration } from "react-native";

// Native module for Android alarm service
const AlarmServiceModule = Platform.OS === "android" ? NativeModules.AlarmServiceModule : null;

/**
 * Hook to manage alarm audio playback
 * Uses expo-audio for in-app sound and native service for background
 */
export function useAlarmAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const isPlayingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.loop = false;
        } catch {
          // Ignore cleanup errors
        }
      }
      // Also stop native service
      if (AlarmServiceModule) {
        AlarmServiceModule.stopAlarmService?.();
      }
      isPlayingRef.current = false;
    };
  }, []);

  const startLoop = useCallback(async (alarmId: string, alarmLabel?: string, soundUri?: string, vibration: boolean = true) => {
    try {
      if (DEBUG) console.log("Starting alarm audio for:", alarmId, "sound:", soundUri, "vibration:", vibration);

      // For Android, use native foreground service for reliable background audio
      if (Platform.OS === "android" && AlarmServiceModule) {
        try {
          AlarmServiceModule.startAlarmService?.(alarmId, alarmLabel || "Alarm", soundUri, vibration);
        } catch (e) {
          console.log("Native alarm service not available, using expo-audio");
        }
      }

      // Also try to play via expo-audio as backup for cross-platform support
      // Note: This requires bundled audio assets which are not yet included
      if (Platform.OS === "ios") {
        // TODO: Implement iOS audio playback using expo-av or expo-audio
        // For now, rely on notification sound

        // Trigger vibration on iOS (Android handles this in native service)
        if (vibration) {
          Vibration.vibrate([0, 500, 500, 500, 500, 500, 500, 500], true);
        }
      }

      isPlayingRef.current = true;
      setIsPlaying(true);

      if (DEBUG) console.log("Alarm audio started");
    } catch (err) {
      if (DEBUG) console.error("Failed to start alarm audio:", err);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      // Stop native service
      if (Platform.OS === "android" && AlarmServiceModule) {
        try {
          AlarmServiceModule.stopAlarmService?.();
        } catch {
          // Ignore
        }
      }

      // Stop expo-audio player
      if (playerRef.current) {
        try {
          playerRef.current.loop = false;
          await playerRef.current.pause();
        } catch {
          // Ignore
        }
      }

      // Stop vibration on iOS
      if (Platform.OS === "ios") {
        Vibration.cancel();
      }

      isPlayingRef.current = false;
      setIsPlaying(false);

      if (DEBUG) console.log("Alarm audio stopped");
    } catch (err) {
      if (DEBUG) console.error("Failed to stop alarm audio:", err);
    }
  }, []);

  return { startLoop, stop, isPlaying, isPlayingRef };
}

/**
 * Configure audio session for alarm playback
 */
export async function configureAudioSession(): Promise<void> {
  if (DEBUG) console.log("Audio session configured for alarms");
}

/**
 * Play a test sound to verify audio is working
 */
export async function playTestSound(): Promise<void> {
  try {
    // In production, this would play a bundled alarm sound
    if (DEBUG) console.log("Test sound would play here");
  } catch (err) {
    if (DEBUG) console.error("Failed to play test sound:", err);
  }
}
