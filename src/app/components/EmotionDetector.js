"use client";

import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

// Store emotion logs in memory during session
const emotionLogsRef = {
  current: [],
};

// Store test start time globally
let testStartTime = null;

// Optional weighting (tweak later)
const emotionWeights = {
  angry: 2,
  sad: 2,
  fearful: 2,
  disgusted: 1.5,
  neutral: 1,
  surprised: 1,
  happy: 0,
};

const EmotionDetector = () => {
  const videoRef = useRef();
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log("FaceAPI models loaded");
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("❌ Webcam error:", err));
    };

    const detectExpressions = () => {
      testStartTime = new Date(); // Start tracking test time

      intervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detection?.expressions) {
            const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
            const [topEmotion, confidence] = sorted[0];

            console.log("🎭", topEmotion, "|", confidence.toFixed(2));

            emotionLogsRef.current.push({
              emotion: topEmotion,
              confidence,
              timestamp: new Date(),
            });
          }
        }
      }, 1000);
    };

    loadModels().then(() => {
      startVideo();
      detectExpressions();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="130"
        height="110"
        style={{ borderRadius: "10px", marginTop: "20px" }}
      />
    </div>
  );
};

export default EmotionDetector;

// ✅ Export helpers for getting summary
export const getEmotionSummary = () => {
  const logs = emotionLogsRef.current;
  if (logs.length === 0) return null;

  const counts = {};
  let total = 0;

  for (const { emotion, confidence } of logs) {
    counts[emotion] = (counts[emotion] || 0) + 1;
    const weight = emotionWeights[emotion] ?? 1;
    total += confidence * weight;
  }

  const avgScore = total / logs.length;
  let cognitiveLoad = "low";
  if (avgScore > 1.5) cognitiveLoad = "high";
  else if (avgScore > 0.8) cognitiveLoad = "medium";

  const dominantEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  return {
    dominantEmotion,
    cognitiveLoad,
    emotionCount: logs.length,
    timestamp: testStartTime || new Date(), // Use start time instead of save time
  };
};

export const clearEmotionLogs = () => {
  emotionLogsRef.current = [];
};
