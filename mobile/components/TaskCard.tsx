import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Task } from "../types/Task";

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
}

export default function TaskCard({
  task,
  onDelete,
}: TaskCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.task}>
          {task.task}
        </Text>

        <Pressable onPress={onDelete}>
          <Text style={styles.delete}>
            Delete
          </Text>
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          📅 {formatDate(task.date)}
        </Text>

        <Text style={styles.meta}>
          ⏰ {formatTime(task.time)}
        </Text>
      </View>

      <Text style={styles.transcript}>
        "{task.transcript}"
      </Text>
    </View>
  );
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString: string | null) {
  if (!timeString) {
    return "No time";
  }

  const [hours, minutes] =
    timeString.split(":").map(Number);

  const period =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  task: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },

  delete: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10,
  },

  meta: {
    fontSize: 13,
    color: "#64748B",
  },

  transcript: {
    marginTop: 10,
    color: "#94A3B8",
    fontSize: 12,
    fontStyle: "italic",
  },
});