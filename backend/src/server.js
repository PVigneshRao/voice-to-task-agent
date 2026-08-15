require("dotenv").config();

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/task.routes");
const {
  sendDiscordNotification,
} = require("./notification.service");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "VoiceTask AI backend is running",
  });
});

app.use("/api/tasks", taskRoutes);

// Global error handler
app.use(async (err, req, res, next) => {
  console.error("Backend Error:", err);

  await sendDiscordNotification(
    "🚨 VoiceTask AI Backend Error",
    `**Endpoint:** ${req.method} ${req.originalUrl}\n**Error:** ${err.message}`
  );

  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `VoiceTask AI backend running on port ${PORT}`
  );
});

