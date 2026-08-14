const express = require("express");
const multer = require("multer");
const fs = require("fs");

const {
  processVoiceTask,
} = require("../services/gemini.service");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Task API is working",
  });
});

router.post(
  "/process-voice",
  upload.single("audio"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Audio file is required",
        });
      }

      console.log(
        "Received audio:",
        req.file.originalname
      );

      const result =
        await processVoiceTask(
          req.file.path
        );

      // Delete temporary audio file
      fs.unlink(
        req.file.path,
        () => {}
      );

      console.log(
        "AI result:",
        result
      );

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {

      console.error(
        "Voice processing error:",
        error
      );

      if (req.file?.path) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      res.status(500).json({
        success: false,
        message:
          "Unable to process voice command",
        error: error.message,
      });
    }
  }
);

module.exports = router;