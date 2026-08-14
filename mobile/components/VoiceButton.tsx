import React, { useEffect, useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
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

export default function VoiceButton({
  onRecordingComplete,
  disabled = false,
}: VoiceButtonProps) {
  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState = useAudioRecorderState(
    recorder
  );

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  useEffect(() => {
    initializeAudio();
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
      console.error("Audio initialization error:", error);
    }
  }

  async function startRecording() {
    try {
      if (!permissionGranted) {
        await initializeAudio();
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      console.log("Recording started");
    } catch (error) {
      console.error("Start recording error:", error);

      Alert.alert(
        "Recording Error",
        "Unable to start recording."
      );
    }
  }

  async function stopRecording() {
    try {
      await recorder.stop();

      const uri = recorder.uri;

      console.log("Recording stopped:", uri);

      if (!uri) {
        Alert.alert(
          "Recording Error",
          "No audio file was created."
        );
        return;
      }

      onRecordingComplete(uri);
    } catch (error) {
      console.error("Stop recording error:", error);

      Alert.alert(
        "Recording Error",
        "Unable to stop recording."
      );
    }
  }

  async function handlePress() {
    if (disabled) {
      return;
    }

    if (recorderState.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        recorderState.isRecording && styles.recording,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.icon}>
        {recorderState.isRecording ? "⏹️" : "🎙️"}
      </Text>

      <Text style={styles.text}>
        {recorderState.isRecording
          ? "Tap to stop"
          : "Tap to speak"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  recording: {
    backgroundColor: "#DC2626",
  },

  disabled: {
    opacity: 0.5,
  },

  icon: {
    fontSize: 38,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
});