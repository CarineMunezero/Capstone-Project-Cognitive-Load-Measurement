'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Chatbot from '../components/Chatbot';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ReportPage() {
  const [gameData, setGameData] = useState(null);
  const [nasaData, setNasaData] = useState(null);
  const [eegData, setEegData] = useState(null);
  const [eegHistory, setEegHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [overallCognitiveLoad, setOverallCognitiveLoad] = useState(0);

  const getLoadColor = (score) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-500';
  };

  const loadLatestData = async (user) => {
    const fetchLatest = async (col, sortField = 'timestamp') => {
      try {
        const q = query(
          collection(db, col),
          where('user', '==', user),
          orderBy(sortField, 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs[0]?.data();
      } catch (err) {
        console.error(`Error fetching ${col}:`, err);
        return null;
      }
    };

    const fetchRecentEEGData = async (user) => {
      try {
        const q = query(
          collection(db, 'eegSummaries'),
          where('user', '==', user),
          orderBy('savedAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error('Error fetching EEG history:', err);
        return [];
      }
    };

    const [session, nasa, eeg, eegHistoryList] = await Promise.all([
      fetchLatest('sessionSummaries', 'savedAt'),
      fetchLatest('nasaTLXResults', 'timestamp'),
      fetchLatest('eegSummaries', 'savedAt'),
      fetchRecentEEGData(user),
    ]);

    setGameData(session);
    setNasaData(nasa);
    setEegData(eeg);
    setEegHistory(eegHistoryList);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUserId(storedUser);
  }, []);

  useEffect(() => {
    if (userId) {
      loadLatestData(userId);
    }
  }, [userId]);

  // Debugging logs here
  useEffect(() => {
    if (eegData && gameData?.emotion?.cognitiveLoad) {
      const eegCognitiveLoad = eegData.medianCognitiveLoad || 0;
      const emotionCognitiveLoad = getEmotionCognitiveLoadValue(gameData.emotion.cognitiveLoad) || 0;
      const combinedCognitiveLoad = (eegCognitiveLoad + emotionCognitiveLoad) / 2;

      // Log the individual values and the combined cognitive load
      console.log("EEG Cognitive Load:", eegCognitiveLoad);
      console.log("Emotion Cognitive Load:", emotionCognitiveLoad);
      console.log("Combined Cognitive Load:", combinedCognitiveLoad);

      setOverallCognitiveLoad(combinedCognitiveLoad);
    }
  }, [eegData, gameData]);

  // Function to convert emotion cognitive load to a numeric value
  const getEmotionCognitiveLoadValue = (emotion) => {
    switch (emotion) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'neutral':
        return 0; // Neutral considered as the baseline
      default:
        return 0; // Default to neutral if the value is unexpected
    }
  };

  // Ensure loading state when all data is not available
  if (!gameData && !nasaData && !eegData) {
    return <div className="text-white p-6 text-center">Loading your report...</div>;
  }

  const gameTasks = gameData?.taskBreakdown || {};
  const emotionInfo = gameData?.emotion || {};
  const weightedScore = parseFloat(nasaData?.weightedScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1c4e] text-white space-y-12 mt-15">

      {/* Header */}
      <header className="fixed w-full top-0 z-50 p-4 backdrop-blur-sm bg-[rgba(2,62,138,0.1)] border-b border-white/10 transition-all">
  <div className="max-w-5xl mx-auto flex items-center justify-between">
    <span id="welcome-text" className="font-bold">
      <a href="#" className="hover:underline">
        {userId ? `Home ${"⬅️"}` : 'Welcome, Guest'}
      </a>
    </span>
    <nav>
      <button onClick={() => router.push('/game/')} className="ml-4 hover:underline">
        Game
      </button>
      <button onClick={() => router.push('/nasatlx/')} className="ml-4 hover:underline">
        NASA TLX
      </button>
      <button onClick={() => router.push('/report/')} className="ml-4 hover:underline">
        Report
      </button>
      <button onClick={() => logout()} className="ml-4 hover:underline">
        Logout
      </button>
    </nav>
  </div>
</header>
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">🧠 Cognisense Report</h1>
        <p className="text-gray-300 max-w-3xl mx-auto">
          This dashboard summarizes your mental performance across four domains:
          <span className="text-blue-300 font-medium"> Game Accuracy</span>,
          <span className="text-yellow-300 font-medium"> NASA-TLX</span>,
          <span className="text-pink-300 font-medium"> Emotion Recognition</span>,
          and
          <span className="text-green-300 font-medium"> EEG signals</span>.
        </p>
      </div>

      {/* NASA Score + Game Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 mx-10 -mt-3">
        {/* Combined Cognitive Load (EEG + Emotion Recognition) */}
       {/* Combined Cognitive Load (EEG + Emotion Recognition) */}
{overallCognitiveLoad > 0 && (
  <div className="bg-white/10 p-5 rounded shadow-md w-full max-w-lg mx-auto">
    <h2 className="text-2xl font-semibold">🔍 Overall Cognitive Load</h2>
    
    {/* Display the Combined EEG Cognitive Load */}
    <p className="mt-2 flex items-center space-x-2">
  <span>Combined Score (EEG + Emotion):</span>
  <span className={`font-bold ${getLoadColor(overallCognitiveLoad)}`}>
    {overallCognitiveLoad.toFixed(2)}
  </span>
  <span>→</span>
  <span className={`font-semibold ${getLoadColor(overallCognitiveLoad)}`}>
    {overallCognitiveLoad < 1.5 ? "Low" : overallCognitiveLoad < 3.0 ? "Medium" : "High"}
  </span>
</p>


    {/* Optional: Additional Notes on the Score */}
    <p className="mt-2 text-sm text-gray-400">
    Score (out of 5): Lower → less mental effort, Medium → moderate effort, Higher → extensive.
    </p>
     {/* Display NASA-TLX Score */}
     {nasaData?.weightedScore && (
      <p className="mt-2 text-lg">
        <strong>NASA-TLX Weighted Score: </strong>
        <span className="font-bold">{nasaData?.weightedScore}</span>
      </p>
    )}
  </div>
)}

        {emotionInfo?.dominantEmotion && (
          <div className="bg-white/10 p-5 rounded shadow-md w-full max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-2">Session Summary (Emotions 😊 + Game Score)</h3>
            <p><strong>Game Score:</strong> {gameData?.gameScore}</p>
            <p><strong>Dominant Emotion:</strong> {emotionInfo.dominantEmotion}</p>
            <p><strong>Emotion Count:</strong> {emotionInfo.emotionCount}</p>
            <p><strong>Estimated Load:</strong> {emotionInfo.cognitiveLoad}</p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 mx-20 -mt-8">
        {/* NASA-TLX Workload Breakdown */}
        {nasaData && (
          <div className="bg-white/10 p-4 rounded shadow-md w-full max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">📋 NASA-TLX Workload Breakdown</h3>
            <div className="flex items-start space-x-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                  <span className="text-white">Performance</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-white">Physical Demand</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></span>
                  <span className="text-white">Frustration</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-white">Effort</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-white">Temporal Demand</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-pink-500 mr-2"></span>
                  <span className="text-white">Mental Demand</span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="w-1/2">
                <Pie
                  data={{
                    labels: Object.keys(nasaData.scores),
                    datasets: [{
                      data: Object.values(nasaData.scores),
                      backgroundColor: [
                        '#7c3aed', '#ef4444', '#facc15',
                        '#10b981', '#3b82f6', '#ec4899',
                      ],
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Game Task Breakdown */}
      {/* Game Task Breakdown */}
{Object.keys(gameTasks).length > 0 && (
  <div className="bg-white/10 p-4 rounded shadow-md w-full max-w-md mx-auto">
    <h3 className="text-lg font-semibold mb-2">🎮 Game Task Breakdown</h3>
    <div className="h-64">
      <Bar
        data={{
          labels: Object.keys(gameTasks),
          datasets: [{
            label: 'Score by Task',
            // Ensure the data passed here comes from gameData.gameScore or another valid source
            data: Object.values(gameTasks).map(taskScore => taskScore), 
            backgroundColor: '#3b82f6',
          }],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: { color: '#fff', font: { size: 14 } },
              title: { display: true, text: 'Task', color: '#fff', font: { size: 16 } },
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff', font: { size: 14 } },
              title: { display: true, text: 'Score', color: '#fff', font: { size: 16 } },
            },
          },
        }}
      />
    </div>
  </div>
)}
      </div>

      {/* EEG Summary + Chart */}
      {eegData && (
        <div className="grid grid-cols-1 md:grid-cols-2 mx-10 -mt-8 items-start">
          {eegHistory.length > 0 && (
           <div className="bg-white/10 p-5 rounded shadow-md w-full max-w-lg mx-auto">
              <h3 className="text-lg font-semibold mb-2">📈 EEG Cognitive Load Over Time</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: eegHistory.map((d) => {
                      const date = new Date(d.savedAt?.seconds * 1000);
                      return date.toLocaleTimeString();
                    }),
                    datasets: [{
                      label: 'Median Cognitive Load',
                      data: eegHistory.map(d => d.medianCognitiveLoad),
                      backgroundColor: eegHistory.map(d =>
                        d.medianCognitiveLoad > 4.0 ? '#ef4444' : '#10b981'
                      ),
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        ticks: { color: '#fff', font: { size: 14 } },
                        title: { display: true, text: 'Time', color: '#fff', font: { size: 16 } },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#fff', font: { size: 14 } },
                        title: { display: true, text: 'Cognitive Load', color: '#fff', font: { size: 16 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

<div className="bg-white/10 p-5 rounded shadow-md w-full max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-2">⚡ EEG Summary</h3>
            <p><strong>Median Cognitive Load:</strong> {eegData.medianCognitiveLoad?.toFixed(2)}</p>
            <p><strong>Session Time:</strong> {eegData.startTime} – {eegData.stopTime}</p>
            <p className="mt-1 text-sm text-gray-400">{eegData.feedback}</p>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}
