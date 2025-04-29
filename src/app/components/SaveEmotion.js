"use client";

import { getEmotionSummary, clearEmotionLogs } from "../components/EmotionDetector";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SaveEmotion() {
  const saveToFirebase = async () => {
    const summary = getEmotionSummary();

    if (!summary) {
      alert("No emotion data available to save.");
      return;
    }

    try {
      await addDoc(collection(db, "emotionSummaries"), {
        ...summary,
        user: localStorage.getItem("currentUser") || "anonymous",
        savedAt: new Date(),
      });
      alert("✅ Emotion summary saved to Firebase!");
      clearEmotionLogs();
    } catch (error) {
      console.error("❌ Error saving emotion summary:", error.message);
      alert("❌ Failed to save emotion summary.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={saveToFirebase}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Save Emotion Summary
      </button>
    </div>
  );
}
