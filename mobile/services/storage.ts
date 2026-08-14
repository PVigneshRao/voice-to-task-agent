import AsyncStorage from "@react-native-async-storage/async-storage";

import { Task } from "../types/Task";

const TASK_KEY = "@voice_task_ai_tasks";

export async function getTasks(): Promise<Task[]> {
  try {
    const stored = await AsyncStorage.getItem(TASK_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return [];
  }
}

export async function saveTask(task: Task): Promise<void> {
  const existingTasks = await getTasks();

  const updatedTasks = [
    task,
    ...existingTasks,
  ];

  await AsyncStorage.setItem(
    TASK_KEY,
    JSON.stringify(updatedTasks)
  );
}

export async function removeTask(id: string): Promise<void> {
  const existingTasks = await getTasks();

  const updatedTasks = existingTasks.filter(
    (task) => task.id !== id
  );

  await AsyncStorage.setItem(
    TASK_KEY,
    JSON.stringify(updatedTasks)
  );
}