# VoiceTask AI

VoiceTask AI is a simple voice-powered task assistant built to make creating tasks feel more natural.

Instead of opening an app, typing a task, and manually selecting a date and time, you can just say what you need. The app records your voice, sends it to the backend, uses Google Gemini to understand the command, and turns it into a structured task.

For example:

> "Remind me to call Harsha tomorrow at 5 PM."

The app can turn that into:

```text
Task: Call Harsha
Date: Tomorrow
Time: 5:00 PM
```

---

##  Download the Android APK

The first working Android release is available through the GitHub Releases page.

###  [Download VoiceTask AI v1.0.0](https://github.com/PVigneshRao/voice-to-task-agent/releases/tag/v1.0.0)

Open the release page, scroll to **Assets**, and download the `.apk` file to your Android phone.

After downloading:

1. Open the APK on your Android device.
2. Allow installation if Android asks for permission.
3. Open **VoiceTask AI**.
4. Give the app microphone permission.
5. Start speaking and create your first task.

> This is the first release of the project, so it is mainly intended for testing and demonstration.

---

##  What VoiceTask AI Does

The main goal of the project is to make task creation faster and more conversational.

You speak naturally, and the application handles the rest.

### Voice recording

The mobile application records the user's voice using Expo's audio functionality.

### AI-powered understanding

The recorded audio is sent to the backend, where Gemini processes the voice command and extracts the useful information.

### Structured task generation

The response is converted into a simple structure containing:

- Transcript
- Task
- Date
- Time

### Production backend

The backend is deployed on Render, so the Android application can communicate with it without requiring the developer's laptop to be running.

### Backend error alerts

Important voice-processing errors are sent to a Discord channel using a webhook. This makes it easier to notice backend problems without continuously checking logs.

---

# ️ How the Project Works

The application is split into two main parts:

- `mobile` — React Native / Expo application
- `backend` — Node.js / Express API

The overall flow is:

```text
┌──────────────────────────┐
│      VoiceTask AI        │
│      Android App         │
└────────────┬─────────────┘
             │
             │ Record voice
             ▼
┌──────────────────────────┐
│      Audio (.m4a)        │
└────────────┬─────────────┘
             │
             │ POST /api/tasks/process-voice
             ▼
┌──────────────────────────┐
│ Node.js + Express API    │
│        Render            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Gemini API         │
│  Understands the command │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Structured Task Result   │
│ task / date / time       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Mobile UI          │
└──────────────────────────┘
```

When an important backend error occurs:

```text
Backend Error
      │
      ▼
Notification Service
      │
      ▼
Discord Webhook
      │
      ▼
Developer receives alert
```

---

#  Technology Stack

## Mobile

- React Native
- Expo
- Expo Router
- Expo Audio
- TypeScript
- EAS Build

## Backend

- Node.js
- Express
- Multer
- CORS
- dotenv

## AI

- Google Gemini
- `@google/genai`

## Deployment

- GitHub
- Render
- Expo EAS

## Monitoring

- Discord Webhook

---

#  Project Structure

```text
voice-to-task-agent/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   │
│   │   ├── services/
│   │   │   └── gemini.service.js
│   │   │
│   │   ├── notification.service.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── mobile/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── services/
│   │   └── api.ts
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

The repository keeps the backend and mobile application together so both sides of the project can be developed and maintained in one place.

---

#  Running the Backend Locally

Go into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

Then start the development server:

```bash
npm run dev
```

You should see something similar to:

```text
VoiceTask AI backend running on port 5000
```

The local backend is available at:

```text
http://localhost:5000
```

---

#  Running the Mobile App Locally

Go into the mobile directory:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

You can then open the application using Expo Go on an Android device or use an emulator.

For microphone and audio testing, a physical Android phone is recommended.

---

#  Connecting the Mobile App to the Backend

The API configuration is located in:

```text
mobile/services/api.ts
```

For production builds, the application uses:

```ts
const API_URL = "https://voice-to-task-agent.onrender.com";
```

For local testing with a physical phone, use your laptop's local network IP instead of `localhost`.

For example:

```ts
const API_URL = "http://192.168.1.7:5000";
```

The phone and laptop need to be connected to the same Wi-Fi network.

Before creating a production APK, change the URL back to the Render address.

---

#  Production Backend

The backend is deployed on Render.

### Production URL

https://voice-to-task-agent.onrender.com

### Health check

https://voice-to-task-agent.onrender.com/health

Expected response:

```json
{
  "success": true,
  "message": "VoiceTask AI backend is running"
}
```

The production voice-processing endpoint is:

```text
POST https://voice-to-task-agent.onrender.com/api/tasks/process-voice
```

---

#  API Endpoints

## Health Check

```http
GET /health
```

Used to confirm that the backend is running.

## Task API Test

```http
GET /api/tasks/test
```

Returns:

```json
{
  "success": true,
  "message": "Task API is working"
}
```

## Process Voice

```http
POST /api/tasks/process-voice
```

The request uses `multipart/form-data` with:

```text
audio
```

as the uploaded file.

A successful response looks like:

```json
{
  "success": true,
  "data": {
    "transcript": "Remind me to call Harsha tomorrow at 5 pm.",
    "task": "call Harsha",
    "date": "2026-08-16",
    "time": "17:00"
  }
}
```

---

#  Gemini Integration

The backend uses Google's Gemini API to interpret the uploaded voice command.

The AI processing service takes the audio file and extracts the information needed for the task.

The application currently expects a response containing:

```text
transcript
task
date
time
```

For example:

```json
{
  "transcript": "Driving at 5 PM tomorrow.",
  "task": "Driving",
  "date": "2026-08-16",
  "time": "17:00"
}
```

---

#  Discord Error Notifications

VoiceTask AI also includes a small backend notification system.

The notification service lives here:

```text
backend/src/notification.service.js
```

The Discord webhook is stored in an environment variable:

```env
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

This keeps the webhook out of the source code.

When an important error happens while processing a voice request, the backend can send a message to Discord containing information such as:

```text
 VoiceTask AI Backend Error

Endpoint: POST /api/tasks/process-voice
File: voice-task.m4a
Error: ...
Time: ...
```

This is useful during development and production because backend failures can be noticed quickly without constantly watching the Render logs.

---

#  Environment Variables

Never commit secrets to GitHub.

Local backend example:

```env
GEMINI_API_KEY=your_gemini_key
DISCORD_WEBHOOK_URL=your_discord_webhook
```

These values should also be configured in Render's environment settings.

The `.env` file should remain ignored by Git:

```text
.env
```

Do not place API keys or Discord webhook URLs directly inside the source code.

---

#  Building the Android APK

The Android application is built using Expo EAS.

Make sure EAS CLI is installed:

```bash
npm install -g eas-cli
```

Log in:

```bash
eas login
```

Check the configuration:

```bash
eas build:configure
```

Before building, it is useful to run:

```bash
npx expo-doctor
```

The project should have all Expo dependencies aligned.

The APK build profile is defined in:

```text
mobile/eas.json
```

The preview profile is configured for APK output:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

Build the APK with:

```bash
eas build --platform android --profile preview
```

EAS handles the Android signing credentials and builds the APK in the cloud.

---

# ️ Android Microphone Permission

The app uses microphone access for voice recording.

The Android configuration includes:

```json
"permissions": [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS"
]
```

The project also uses:

```text
expo-audio
```

When the app is installed, Android will request microphone permission from the user.

---

#  Testing

The application has been tested through the full flow:

```text
Record voice
      ↓
Create .m4a file
      ↓
Upload audio
      ↓
Backend receives audio
      ↓
Gemini processes command
      ↓
Structured response returned
      ↓
Mobile app displays task
```

A real test command used during development was:

> "Remind me to call Harsha tomorrow at 5 pm."

The backend successfully produced:

```json
{
  "transcript": "Remind me to call Harsha tomorrow at 5 pm.",
  "task": "call Harsha",
  "date": "2026-08-16",
  "time": "17:00"
}
```

The standalone Android APK was also tested after fixing the Expo native dependency mismatch found during the first APK build.

---

# ️ Troubleshooting

## The browser shows `Cannot GET /`

This usually just means the root route has not been defined.

Use:

```text
/health
```

instead.

Example:

```text
https://voice-to-task-agent.onrender.com/health
```

---

## Render cannot find `package.json`

The repository contains the backend inside:

```text
backend/
```

Render should therefore use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

---

## Local phone cannot reach the backend

Don't use:

```text
http://localhost:5000
```

on the physical phone.

Use your laptop's local IP:

```text
http://YOUR_LAPTOP_IP:5000
```

Also make sure the phone and laptop are on the same network and that the Windows firewall allows the connection.

---

## APK crashes while Expo Go works

Run:

```bash
npx expo-doctor
```

Standalone Android builds include native dependencies directly, so Expo package mismatches can cause startup crashes even when the development version works in Expo Go.

During development, the project had an Expo dependency issue involving `expo-asset` and duplicate native modules. Installing the SDK-compatible package with:

```bash
npx expo install expo-asset
```

and confirming the dependency tree with:

```bash
npx expo-doctor
```

resolved the issue.

The final project reached:

```text
18/18 checks passed. No issues detected!
```

---

#  Release

The current first release is:

```text
v1.0.0
```

### GitHub Release

[VoiceTask AI v1.0.0](https://github.com/PVigneshRao/voice-to-task-agent/releases/tag/v1.0.0)

The APK can be downloaded from the **Assets** section of the release page.

Future releases can use version tags such as:

```text
v1.1.0
v1.2.0
v2.0.0
```

---

#  What's Next

The current version focuses on getting the voice-to-task flow working from end to end. There are a few things that would make the app much more useful in the next versions.

Some planned improvements:

- Save tasks permanently using a database
- Add task editing and deletion
- Mark tasks as completed
- Add reminders and scheduled notifications
- Add user authentication
- Improve task/date parsing for more natural speech
- Add better offline and network error handling
- Improve the UI and overall mobile experience
- Add more production monitoring and analytics
- Publish the application to Google Play

---

# ‍ About the Project

VoiceTask AI was built as a practical project around a simple idea: **turn voice into something actionable**.

The project brings together mobile development, backend APIs, AI processing, deployment, and basic production monitoring in one application.

It is intentionally kept straightforward at the moment. The focus of the first version was getting the complete experience working reliably from recording a voice command to showing the resulting task on the phone.

---

## License

A project license can be added here before wider distribution.

---

## Author

**Vignesh Rao**

GitHub: [PVigneshRao](https://github.com/PVigneshRao)
