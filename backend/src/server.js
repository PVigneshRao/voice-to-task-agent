require("dotenv").config();

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/task.routes");

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `VoiceTask AI backend running on port ${PORT}`
  );
});