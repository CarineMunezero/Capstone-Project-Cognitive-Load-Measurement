'use client';

import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function EEGDashboard() {
  // State variables
  const [isEEGRunning, setIsEEGRunning] = useState(false);
  const [cognitiveLoad, setCognitiveLoad] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Define colors for 8 channels (customize as needed)
  const channelColors = [
    'rgba(75,192,192,1)',
    'rgba(192,75,192,1)',
    'rgba(192,192,75,1)',
    'rgba(75,75,192,1)',
    'rgba(192,75,75,1)',
    'rgb(15, 245, 15)',
    'rgba(255,0,0,1)',
    'rgba(0,0,255,1)',
  ];

  // Initialize chart with 8 datasets
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    const datasets = Array.from({ length: 8 }, (_, i) => ({
      label: `Channel ${i + 1}`,
      data: [],
      borderColor: channelColors[i],
      borderWidth: 2,
      fill: false,
    }));

    const instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Amplitude' },
          },
          x: {
            title: { display: true, text: 'Time' },
          },
        },
      },
    });
    setChartInstance(instance);

    return () => {
      instance.destroy();
    };
  }, []);

  // Start EEG: call backend and begin polling realtime data
  const startEEG = async () => {
    if (isEEGRunning) return;
    // Clear previous feedback when starting a new session
    setFeedback(null);
    try {
      await fetch('http://localhost:8000/start-eeg');
      setIsEEGRunning(true);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8000/realtime');
          const data = await res.json();
          // Expecting data.eeg as an array of samples (each sample is an 8-element array)
          if (data.eeg && data.eeg.length > 0) {
            const lastSample = data.eeg[data.eeg.length - 1]; // [ch0, ch1, ..., ch7]
            setCognitiveLoad(data.cognitive_load);
            const now = new Date().toLocaleTimeString();
            // Append new timestamp
            chartInstance.data.labels.push(now);
            // Append each channel's value (use 0 if missing)
            for (let i = 0; i < 8; i++) {
              const value = lastSample[i] !== undefined ? lastSample[i] : 0;
              chartInstance.data.datasets[i].data.push(value);
            }
            // Keep only the last 50 data points
            if (chartInstance.data.labels.length > 50) {
              chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
              chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
            }
            chartInstance.update();
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Stop EEG: call backend, stop polling, and get session feedback
  const stopEEG = async () => {
    try {
      const res = await fetch('http://localhost:8000/stop-eeg');
      const data = await res.json();
      setIsEEGRunning(false);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      // Set feedback from the backend (includes session time range and median cognitive load)
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
    }
  };

  // Example distraction function (placeholder)
  const sendDistraction = (type) => {
    console.log('sendDistraction called with:', type); // Log the call
    if (type === 'HEAVY METAL') {
      const audio = document.getElementById('heavyMetalAudio');
      if (audio) {
        audio.muted = false;
        audio.volume = 0.5;
        audio.currentTime = 0;  // Reset to start
        audio.play().catch(err => console.warn('Audio play failed:', err));
        console.log('Heavy Metal audio should be playing'); // Log success
        alert(`Distraction sent: ${type}`);
      } else {
        console.warn('No heavyMetalAudio element found');
      }
    }
    // Add similar logs for other distraction types if needed.
  };
  
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
          <p className="mt-2 text-lg text-gray-300">
            Real-time EEG data visualization and session feedback
          </p>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={startEEG}
                disabled={isEEGRunning}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                Start EEG
              </button>
              <button
                onClick={stopEEG}
                disabled={!isEEGRunning}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                Stop EEG
              </button>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
            <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
          <div className="relative h-64">
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* Session Feedback */}
        {feedback && (
          <div
            className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
              parseFloat(feedback.median_cognitive_load) > 1.0
                ? 'border-4 border-red-500'
                : 'border-4 border-green-500'
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
            <p className="text-xl font-medium">{feedback.feedback}</p>
            <p className="mt-2">
              <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
            </p>
          </div>
        )}

        {/* Distraction Buttons */}
        <div className="bg-white/10 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              onClick={() => sendDistraction('FLASH')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              FLASH
            </button>
            <button
              onClick={() => sendDistraction('HEAVY METAL')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              HEAVY METAL
            </button>
            <button
              onClick={() => sendDistraction('CLASSIC')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              CLASSIC MUSIC
            </button>
            <button
              onClick={() => sendDistraction('HIDE_TEXT')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              HIDE_TEXT
            </button>
            <button
              onClick={() => sendDistraction('INVERT_COLORS')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              INVERT_COLORS
            </button>
            <button
              onClick={() => sendDistraction('RANDOM_POPUP')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
            >
              RANDOM_POPUP
            </button>
          
          </div>
        </div>
      </div>
    </div>
  );
}
