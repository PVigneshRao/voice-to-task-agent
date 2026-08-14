const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function processVoiceTask(filePath) {
  const audioBuffer = fs.readFileSync(filePath);

  const base64Audio =
    audioBuffer.toString("base64");

  const prompt = `
You are a voice-to-task extraction assistant.

Listen to the attached audio.

Today's date is ${new Date()
    .toISOString()
    .split("T")[0]}.

Extract the actionable task, date, and time.

For relative dates such as:
- today
- tomorrow
- next Monday

convert them to YYYY-MM-DD.

Convert times such as:
- 5 PM
- 5:30 PM
- noon

to 24-hour HH:mm format.

Return ONLY valid JSON in exactly this format:

{
  "transcript": "what the user said",
  "task": "the actionable task",
  "date": "YYYY-MM-DD",
  "time": "HH:mm"
}

If no date is mentioned, use today's date.

If no time is mentioned, use null.

Do not include markdown.
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          inlineData: {
            mimeType: "audio/m4a",
            data: base64Audio,
          },
        },
        {
          text: prompt,
        },
      ],
    });

  const text = response.text;

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

module.exports = {
  processVoiceTask,
};