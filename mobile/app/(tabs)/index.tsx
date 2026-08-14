import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import VoiceButton from "../../components/VoiceButton";
import TaskCard from "../../components/TaskCard";

import {
  processVoice,
  ProcessedTask,
} from "../../services/api";

import {
  getTasks,
  removeTask,
  saveTask,
} from "../../services/storage";

import { Task } from "../../types/Task";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pendingTask, setPendingTask] =
    useState<ProcessedTask | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const savedTasks = await getTasks();
      setTasks(savedTasks);
    } catch (error) {
      console.error("Load tasks error:", error);
    }
  }

  async function handleRecording(audioUri: string) {
    try {
      setProcessing(true);

      console.log("Sending audio:", audioUri);

      const result = await processVoice(audioUri);

      console.log("AI result:", result);

      setPendingTask(result);
    } catch (error) {
      console.error("Voice processing error:", error);

      Alert.alert(
        "Processing Error",
        "Unable to understand your voice command. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function savePendingTask() {
    if (!pendingTask) {
      return;
    }

    try {
      const newTask: Task = {
        id: Date.now().toString(),
        transcript: pendingTask.transcript,
        task: pendingTask.task,
        date: pendingTask.date,
        time: pendingTask.time,
        createdAt: new Date().toISOString(),
      };

      await saveTask(newTask);

      setTasks((previous) => [
        newTask,
        ...previous,
      ]);

      setPendingTask(null);

      Alert.alert(
        "Task Saved",
        "Your task has been saved successfully."
      );
    } catch (error) {
      console.error("Save task error:", error);

      Alert.alert(
        "Error",
        "Could not save your task."
      );
    }
  }

  function cancelPendingTask() {
    setPendingTask(null);
  }

  async function deleteTask(id: string) {
    try {
      await removeTask(id);

      setTasks((previous) =>
        previous.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error("Delete task error:", error);

      Alert.alert(
        "Error",
        "Could not delete the task."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          VoiceTask
        </Text>

        <Text style={styles.subtitle}>
          Turn your voice into tasks
        </Text>
      </View>

      {/* Voice / Confirmation section */}
      {pendingTask ? (
        <ConfirmationCard
          task={pendingTask}
          onCancel={cancelPendingTask}
          onSave={savePendingTask}
        />
      ) : (
        <View style={styles.voiceCard}>
          <Text style={styles.question}>
            What do you need to remember?
          </Text>

          <VoiceButton
            disabled={processing}
            onRecordingComplete={handleRecording}
          />

          {processing && (
            <View style={styles.processing}>
              <ActivityIndicator size="small" />

              <Text style={styles.processingText}>
                Understanding your task...
              </Text>
            </View>
          )}

          <Text style={styles.exampleLabel}>
            EXAMPLE
          </Text>

          <Text style={styles.exampleText}>
            "Remind me to call John tomorrow at 5 PM."
          </Text>
        </View>
      )}

      {/* Task heading */}
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>
          My Tasks
        </Text>

        <Text style={styles.count}>
          {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </Text>
      </View>

      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onDelete={() => deleteTask(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !processing ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                📋
              </Text>

              <Text style={styles.emptyTitle}>
                No tasks yet
              </Text>

              <Text style={styles.emptyText}>
                Tap the microphone and speak your task.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ---------------- Confirmation Card ---------------- */

function ConfirmationCard({
  task,
  onCancel,
  onSave,
}: {
  task: ProcessedTask;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.confirmationCard}>
      <Text style={styles.confirmationTitle}>
        Task Detected
      </Text>

      <Text style={styles.label}>
        TASK
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.taskValue}>
          {task.task}
        </Text>
      </View>

      <Text style={styles.label}>
        DATE
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.value}>
          📅 {formatDate(task.date)}
        </Text>
      </View>

      <Text style={styles.label}>
        TIME
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.value}>
          ⏰ {formatTime(task.time)}
        </Text>
      </View>

      <Text style={styles.label}>
        YOU SAID
      </Text>

      <View style={styles.transcriptBox}>
        <Text style={styles.transcript}>
          "{task.transcript}"
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          style={styles.saveButton}
          onPress={onSave}
        >
          <Text style={styles.saveText}>
            ✓ Save Task
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Formatting ---------------- */

function formatDate(dateString: string): string {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(
  timeString: string | null
): string {
  if (!timeString) {
    return "No time specified";
  }

  const [hours, minutes] =
    timeString.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 25,
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
  },

  voiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },

  processing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },

  processingText: {
    color: "#64748B",
  },

  exampleLabel: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
  },

  exampleText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
  },

  confirmationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  confirmationTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    marginTop: 12,
    marginBottom: 6,
  },

  infoBox: {
    backgroundColor: "#F8FAFC",
    padding: 13,
    borderRadius: 12,
  },

  taskValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  value: {
    fontSize: 15,
    color: "#334155",
  },

  transcriptBox: {
    backgroundColor: "#F8FAFC",
    padding: 13,
    borderRadius: 12,
  },

  transcript: {
    color: "#64748B",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelText: {
    color: "#475569",
    fontWeight: "700",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  taskHeader: {
    marginTop: 25,
    marginBottom: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  taskTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  count: {
    color: "#64748B",
    fontSize: 14,
  },

  list: {
    paddingBottom: 30,
  },

  empty: {
    alignItems: "center",
    marginTop: 35,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 7,
    color: "#94A3B8",
    textAlign: "center",
  },
});