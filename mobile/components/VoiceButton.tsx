import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

interface VoiceButtonProps {
  onRecordingComplete: (uri: string) => void;
  disabled?: boolean;
}

// Tune these if needed.
const SILENCE_THRESHOLD = -45;
const SILENCE_DURATION = 1400;
const MIN_RECORDING_TIME = 1500;
const MAX_RECORDING_TIME = 20000;

export default function VoiceButton({
  onRecordingComplete,
  disabled = false,
}: VoiceButtonProps) {
  /*
   * HIGH_QUALITY already enables metering in Expo.
   * We still keep the explicit option here for clarity.
   */
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  /*
   * Poll every 100 ms so the silence detector reacts quickly.
   */
  const recorderState = useAudioRecorderState(
    recorder,
    100
  );

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  const silenceStartRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    initializeAudio();

    return () => {
      silenceStartRef.current = null;
      stoppingRef.current = false;
      startedRef.current = false;
    };
  }, []);

  async function initializeAudio() {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone Permission",
          "Please allow microphone access to use VoiceTask."
        );
        return;
      }

      setPermissionGranted(true);

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error(
        "Audio initialization error:",
        error
      );
    }
  }

  async function startRecording() {
    try {
      if (!permissionGranted) {
        await initializeAudio();
      }

      /*
       * Reset state before a new recording.
       */
      silenceStartRef.current = null;
      stoppingRef.current = false;
      startedRef.current = false;

      await recorder.prepareToRecordAsync();

      /*
       * Start recording.
       */
      recorder.record();

      startedRef.current = true;

      console.log("🎙️ Recording started");
    } catch (error) {
      console.error(
        "Start recording error:",
        error
      );

      Alert.alert(
        "Recording Error",
        "Unable to start recording."
      );
    }
  }

  async function stopRecording(reason: string) {
    if (stoppingRef.current) {
      return;
    }

    if (!recorderState.isRecording) {
      return;
    }

    stoppingRef.current = true;

    console.log(
      `🛑 Stopping recording: ${reason}`
    );

    try {
      await recorder.stop();

      const uri = recorder.uri;

      console.log(
        "📁 Recording file:",
        uri
      );

      silenceStartRef.current = null;
      startedRef.current = false;

      if (uri) {
        onRecordingComplete(uri);
      } else {
        Alert.alert(
          "Recording Error",
          "No audio file was created."
        );
      }
    } catch (error) {
      console.error(
        "Stop recording error:",
        error
      );
    } finally {
      setTimeout(() => {
        stoppingRef.current = false;
      }, 300);
    }
  }

  /*
   * Automatic silence detection.
   */
  useEffect(() => {
    if (!recorderState.isRecording) {
      silenceStartRef.current = null;
      return;
    }

    const duration =
      recorderState.durationMillis || 0;

    /*
     * Don't trigger silence detection during
     * the first 1.5 seconds.
     */
    if (duration < MIN_RECORDING_TIME) {
      silenceStartRef.current = null;
      return;
    }

    /*
     * Safety timeout.
     */
    if (duration >= MAX_RECORDING_TIME) {
      stopRecording("maximum recording time");
      return;
    }

    const metering =
      recorderState.metering;

    /*
     * Log the microphone level so we can
     * tune the threshold if necessary.
     */
    if (metering !== undefined) {
      console.log(
        `🎚️ Meter: ${metering.toFixed(1)} dB`
      );
    }

    /*
     * If metering isn't available, don't
     * attempt silence detection.
     */
    if (
      metering === undefined ||
      metering === null
    ) {
      return;
    }

    const isSilent =
      metering < SILENCE_THRESHOLD;

    if (isSilent) {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = Date.now();

        console.log(
          "🤫 Possible silence detected..."
        );
      }

      const silentDuration =
        Date.now() -
        silenceStartRef.current;

      if (
        silentDuration >=
        SILENCE_DURATION
      ) {
        console.log(
          "✅ User finished speaking"
        );

        stopRecording(
          "silence detected"
        );
      }
    } else {
      /*
       * User is speaking again.
       */
      if (silenceStartRef.current !== null) {
        console.log(
          "🗣️ Speech detected again"
        );
      }

      silenceStartRef.current = null;
    }
  }, [
    recorderState.isRecording,
    recorderState.durationMillis,
    recorderState.metering,
  ]);

  async function handlePress() {
    if (disabled || stoppingRef.current) {
      return;
    }

    if (recorderState.isRecording) {
      /*
       * Keep manual stop as a fallback.
       */
      await stopRecording(
        "manual stop"
      );
    } else {
      await startRecording();
    }
  }

  const isRecording =
    recorderState.isRecording;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          isRecording && styles.recording,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.innerCircle}>
          <Text style={styles.icon}>
            {isRecording ? "🎙️" : "🎤"}
          </Text>
        </View>
      </Pressable>

      <Text style={styles.status}>
        {isRecording
          ? "Listening..."
          : "Tap to speak"}
      </Text>

      {isRecording && (
        <Text style={styles.helpText}>
          Stop speaking when you're finished.
          {"\n"}
          The recording will stop automatically.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },

  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#4F46E5",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#4F46E5",
    shadowOpacity: 0.30,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 8,
  },

  recording: {
    backgroundColor: "#DC2626",

    shadowColor: "#DC2626",
    shadowOpacity: 0.35,
  },

  innerCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,

    backgroundColor:
      "rgba(255,255,255,0.14)",

    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 42,
  },

  pressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  disabled: {
    opacity: 0.5,
  },

  status: {
    marginTop: 16,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },

  helpText: {
    marginTop: 6,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
  },
});