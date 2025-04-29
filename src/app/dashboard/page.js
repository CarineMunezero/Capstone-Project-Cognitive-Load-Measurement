'use client';

import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import { addDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';  // Adjust path to your Firebase instance if necessary
import { auth } from '../firebase/firebase';  // Assuming you have it initialized in your Firebase config file




export default function EEGDashboard() {
  const BASELINE_DURATION = 12; // seconds

  // ------------------------
  // STATE
  // ------------------------
  const [isCalibrating, setIsCalibrating]     = useState(false);
  const [countdown, setCountdown]             = useState(BASELINE_DURATION);
  const [baselineDone, setBaselineDone]       = useState(false);

  const [isEEGRunning, setIsEEGRunning]       = useState(false);
  const [cognitiveLoad, setCognitiveLoad]     = useState(0);
  const [feedback, setFeedback]               = useState(null);

  // Chart & WebSocket refs
  const chartRef          = useRef(null);
  const [chartInstance, setChartInstance]     = useState(null);
  const websocketRef      = useRef(null);

  // Tabs & history
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [testHistory, setTestHistory]         = useState([]);
  const [currentTestUsername, setCurrentTestUsername] = useState('');
  const [filterUsername, setFilterUsername]   = useState('');
  const [filterCognitive, setFilterCognitive] = useState('all');

  // Distraction toggles
  const [isHeavyMetalOn, setIsHeavyMetalOn]   = useState(false);
  const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
  const [isClassicOn, setIsClassicOn]         = useState(false);

  // ------------------------
  // HELPERS
  // ------------------------
  const saveDistractionToFirebase = async (type) => {
    try {
      const user = auth.currentUser;  // Get the current authenticated user from Firebase
      const username = user ? user.uid : "anonymous";  // If the user is not logged in, use "anonymous"
  
      await addDoc(collection(db, "distractions"), {
        user: username,  // Save the Firebase user UID
        type: type,
        timestamp: new Date(),  // Store the timestamp
      });
    } catch (err) {
      console.error("Error saving distraction:", err);
    }
  };
  
  
  const sendDistraction = (type) => {
    saveDistractionToFirebase(type);  // Save distraction to Firestore
    const channel = new BroadcastChannel('distraction_channel');
    channel.postMessage({ type });
    channel.close();
  };

  const toggleHeavyMetal = () => {
    sendDistraction(isHeavyMetalOn ? 'HEAVY METAL_STOP' : 'HEAVY METAL_START');
    setIsHeavyMetalOn(!isHeavyMetalOn);
  };
  const toggleCrowdTalking = () => {
    sendDistraction(isCrowdTalkingOn ? 'CROWD_TALKING_STOP' : 'CROWD_TALKING_START');
    setIsCrowdTalkingOn(!isCrowdTalkingOn);
  };
  const toggleClassic = () => {
    sendDistraction(isClassicOn ? 'CLASSIC_STOP' : 'CLASSIC_START');
    setIsClassicOn(!isClassicOn);
  };

  const getColorForRatio = (ratio) => {
    if (ratio < 2.0) return 'green';
    if (ratio > 4.0) return 'red';
    return 'white';
  };

  const saveEEGResults = async (feedback, medianCognitiveLoad, startTime, stopTime, user) => {
    try {
      await addDoc(collection(db, "eegSummaries"), {
        feedback,
        medianCognitiveLoad,
        savedAt: new Date(),
        startTime,
        stopTime,
        user: user?.uid|| "anonymous",
      });
      console.log("✅ EEG results saved!");
    } catch (err) {
      console.error("❌ Error saving EEG results:", err);
    }
  };  
  

  // ------------------------
  // INITIALIZE CHART
  // ------------------------
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    const dataset = {
      label: 'Normalized β/α Ratio (1 = baseline)',
      data: [],
      borderColor: 'white',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointBackgroundColor: 'white',
    };
    const inst = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false, title: { display: true, text: 'Ratio' } },
          x: { title: { display: true, text: 'Time' } },
        },
      },
    });
    setChartInstance(inst);
    return () => inst.destroy();
  }, []);

  const clearChartData = () => {
    if (!chartInstance) return;
    chartInstance.data.labels = [];
    chartInstance.data.datasets[0].data = [];
    chartInstance.update();
  };

  // ------------------------
  // COUNTDOWN LOGIC
  // ------------------------
  useEffect(() => {
    let timer;
    if (isCalibrating && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isCalibrating && countdown === 0) {
      setIsCalibrating(false);
      setBaselineDone(true);
      clearChartData();
    }
    return () => clearTimeout(timer);
  }, [isCalibrating, countdown]);

  // ------------------------
  // OPEN SOCKET AFTER BASELINE
  // ------------------------
  useEffect(() => {
    if (baselineDone && isEEGRunning) {
      const ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = ({ data }) => {
        const { current_ratio } = JSON.parse(data);
        const now = new Date().toLocaleTimeString();
        chartInstance.data.labels.push(now);
        chartInstance.data.datasets[0].data.push(current_ratio);
        if (chartInstance.data.labels.length > 50) {
          chartInstance.data.labels.shift();
          chartInstance.data.datasets[0].data.shift();
        }
        const color = getColorForRatio(current_ratio);
        chartInstance.data.datasets[0].borderColor = color;
        chartInstance.data.datasets[0].pointBackgroundColor = color;
        chartInstance.update();
        setCognitiveLoad(current_ratio);
      };
      ws.onerror = console.error;
      ws.onclose = () => console.log('WebSocket disconnected');
      websocketRef.current = ws;
      return () => ws.close();
    }
  }, [baselineDone, isEEGRunning, chartInstance]);

   // ------------------------
  // for listening to distractions
  // ------------------------

  useEffect(() => {
    const q = query(
      collection(db, "distractions"),
      orderBy("timestamp", "desc"),
      limit(1)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const { type } = change.doc.data();
          window.dispatchEvent(new CustomEvent("distraction", { detail: type }));
          console.log(" Received distraction via Firestore:", type);
        }
      });
    });
  
    return () => unsubscribe();
  }, []);
  
  // ------------------------
  // START EEG
  // ------------------------
  const startEEG = async () => {
    if (isEEGRunning) return;
    setBaselineDone(false);
    setIsCalibrating(true);
    setCountdown(BASELINE_DURATION);
    clearChartData();
    setFeedback(null);
    await fetch('http://localhost:8000/start-eeg');
    setIsEEGRunning(true);
    // socket will open in the effect above after baselineDone
  };

  // ------------------------
  // STOP EEG
  // ------------------------
  const stopEEG = async () => {
    try {
      const res = await fetch('http://localhost:8000/stop-eeg');
      const data = await res.json();
      setIsEEGRunning(false);
      // Close the WebSocket connection if it exists.
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      setFeedback(data.feedback);
      const user = auth.currentUser;

      const session = {
        feedback: data.feedback.feedback,
        medianCognitiveLoad: data.feedback.median_cognitive_load,
        savedAt: new Date(),
        startTime: data.feedback.start_time,
        stopTime: data.feedback.stop_time,
        user: user?.uid || 'anonymous'
      };
      
      await addDoc(collection(db, "eegSummaries"), session);
      console.log("EEG summary saved to Firebase");
      
      setTestHistory(prev => [...prev, {
        username: auth.currentUser,
        date: new Date().toLocaleDateString(),
        feedback: session.feedback,
        startTime: session.startTime,
        stopTime: session.stopTime,
        medianCognitiveLoad: session.medianCognitiveLoad
      }]);
      
    } catch (err) {
      console.error(err);
    }
  };
  // ------------------------
  // PDF & HISTORY FILTER
  // ------------------------
  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const username = currentTestUsername.trim() || 'Unknown User';
    const assessedDate = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${username} | Cognisense Report`, pageWidth/2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessed on ${assessedDate}`, pageWidth/2, 23, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(100);
    doc.line(10, 28, pageWidth-10, 28);

    doc.setFontSize(14);
    doc.setFont('helvetica','bold');
    doc.text("EEG Real-Time Chart", 10, 40);

    const chartCanvas = chartRef.current;
    const chartImage = chartCanvas.toDataURL('image/png',1.0);
    doc.addImage(chartImage,'PNG',10,45,pageWidth-20,80);

    doc.setLineWidth(0.3);
    doc.setDrawColor(150);
    doc.line(10,135,pageWidth-10,135);

    let y = 145;
    doc.setFontSize(14);
    doc.setFont('helvetica','bold');
    doc.text("Session Details",10,y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica','normal');
    if (feedback) {
      doc.text(`Feedback: ${feedback.feedback}`,10,y); y+=7;
      doc.text(`Session Time: ${feedback.start_time} - ${feedback.stop_time}`,10,y); y+=7;
      doc.text(`Median Load: ${feedback.median_cognitive_load.toFixed(2)}`,10,y); y+=10;
    } else {
      doc.text("No session feedback available.",10,y); y+=10;
    }
    doc.text(`Current Load: ${cognitiveLoad.toFixed(3)}`,10,y);

    const pages = doc.internal.getNumberOfPages();
    for (let i=1; i<=pages; i++){
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128);
      doc.text(`Page ${i} of ${pages}`, pageWidth/2, pageHeight-10, { align: 'center' });
    }

    doc.save("CognitiveLoadReport.pdf");
  };

  const filteredHistory = testHistory.filter(s => {
    // Match by user ID (email) in the filter or by cognitive load
    const byUser = filterUsername
      ? s.user.toLowerCase().includes(filterUsername.toLowerCase())  // Use the user UID or email
      : true;
  
    let cat = 'medium';
    if (s.medianCognitiveLoad > 1.5) cat = 'high';
    else if (s.medianCognitiveLoad < 0.8) cat = 'low';
    const byCog = filterCognitive === 'all' ? true : cat === filterCognitive;
    return byUser && byCog;
  });
  

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
          <p className="mt-2 text-lg text-gray-300">
            Real-time EEG data visualization and session feedback
          </p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={()=>setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${activeTab==='dashboard'?'bg-blue-600':'bg-blue-400'}`}
          >Dashboard</button>
          <button
            onClick={()=>setActiveTab('history')}
            className={`px-4 py-2 rounded ${activeTab==='history'?'bg-blue-600':'bg-blue-400'}`}
          >User History</button>
        </div>

        {activeTab==='dashboard' && <>
          {/* Test User Details */}
          <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
            <input
              type="text"
              placeholder="Enter Username"
              value={currentTestUsername}
              onChange={e=>setCurrentTestUsername(e.target.value)}
              className="p-2 rounded text-white w-full"
            />
          </div>

          {/* Controls + Load */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
              <div className="flex space-x-4">
                <button
                  onClick={startEEG}
                  disabled={isEEGRunning}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
                >Start EEG</button>
                <button
                  onClick={stopEEG}
                  disabled={!isEEGRunning}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
                >Stop EEG</button>
                <button
                  onClick={downloadPDF}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
                >Download PDF</button>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
              {isCalibrating && (
                <>
                  <p className="text-yellow-400 text-4xl font-bold">{countdown}s</p>
                  <p className="mt-1 text-sm text-gray-300">Calculating baseline…</p>
                </>
              )}
              {!isCalibrating && baselineDone && !isEEGRunning && (
                <p className="text-green-400 text-xl font-semibold">
                Baseline completed. Ready to start EEG.
                </p>
              )}
              {!isCalibrating && isEEGRunning && (
                <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              EEG Real-Time Chart
            </h2>
            <div className="relative h-64">
              <canvas ref={chartRef} />
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
              parseFloat(feedback.median_cognitive_load) < 2.0
                ? 'border-4 border-green-500'
                : parseFloat(feedback.median_cognitive_load) > 4.0
                  ? 'border-4 border-red-500'
                  : 'border-4 border-white'
            }`}>
              <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
              <p className="text-xl font-medium">{feedback.feedback}</p>
              <p className="mt-2"><span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}</p>
              <p className="mt-2"><span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}</p>
            </div>
          )}

          {/* Distractions */}
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button onClick={toggleCrowdTalking} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">CROWD TALKING</button>
              <button onClick={toggleHeavyMetal}    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">HEAVY METAL</button>
              <button onClick={toggleClassic}       className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">CLASSIC MUSIC</button>
              <button onClick={()=>sendDistraction('FLASH')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">FLASH</button>
              <button onClick={()=>sendDistraction('SHAKE')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">SHAKE</button>
              <button onClick={()=>sendDistraction('ROTATE')}className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded">ROTATE</button>
            </div>
          </div>
        </>}

        {activeTab==='history' && (
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Filter by Username"
                value={filterUsername}
                onChange={e=>setFilterUsername(e.target.value)}
                className="p-2 rounded text-black"
              />
              <select
                value={filterCognitive}
                onChange={e=>setFilterCognitive(e.target.value)}
                className="p-2 rounded text-black"
              >
                <option value="all">All Cognitive Loads</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 border-b">Username</th>
                  <th className="p-2 border-b">Date</th>
                  <th className="p-2 border-b">Session Time</th>
                  <th className="p-2 border-b">Median Cognitive Load</th>
                  <th className="p-2 border-b">Feedback</th>
                </tr>
              </thead>
              <tbody>
  {filteredHistory.map((s, i) => (
    <tr key={i}>
    <td className="p-2 border-b">
      {auth.currentUser ? auth.currentUser.displayName || auth.currentUser.email : 'Anonymous'}
    </td> 
      <td className="p-2 border-b">{s.date}</td>
      <td className="p-2 border-b">{s.startTime} - {s.stopTime}</td>
      <td className="p-2 border-b">{s.medianCognitiveLoad.toFixed(2)}</td>
      <td className="p-2 border-b">{s.feedback}</td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}