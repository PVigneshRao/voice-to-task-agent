const API_URL = "http://192.168.1.7:5000/api";

export interface ProcessedTask {
  transcript: string;
  task: string;
  date: string;
  time: string | null;
}

export async function processVoice(
  audioUri: string
): Promise<ProcessedTask> {
  const formData = new FormData();

  formData.append(
    "audio",
    {
      uri: audioUri,
      name: "voice-task.m4a",
      type: "audio/m4a",
    } as any
  );

  const response = await fetch(
    `${API_URL}/tasks/process-voice`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Server error ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Voice processing failed"
    );
  }

  return result.data;
}