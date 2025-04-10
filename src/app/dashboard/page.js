// // // 'use client';

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import Chart from 'chart.js/auto';

// // // export default function EEGDashboard() {
// // //   // Existing state variables
// // //   const [isEEGRunning, setIsEEGRunning] = useState(false);
// // //   const [cognitiveLoad, setCognitiveLoad] = useState(0);
// // //   const [feedback, setFeedback] = useState(null);
// // //   const chartRef = useRef(null);
// // //   const [chartInstance, setChartInstance] = useState(null);
// // //   const pollingIntervalRef = useRef(null);

// // //   // New state variables for tabs, history, and filtering
// // //   const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
// // //   const [testHistory, setTestHistory] = useState([]);
// // //   const [currentTestUsername, setCurrentTestUsername] = useState('');
// // //   const [filterUsername, setFilterUsername] = useState('');
// // //   const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low
// // //   const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
// // //   const sendDistraction = (type) => {
// // //     const channel = new BroadcastChannel('distraction_channel');
// // //     channel.postMessage({ type });
// // //     console.log(`Distraction sent: ${type}`);
// // //     // Optionally close the channel if you don't plan to reuse it immediately:
// // //     channel.close();
// // //   };
  

// // //   // Define colors for 8 channels (customize as needed)
// // //   const channelColors = [
// // //     'rgba(75,192,192,1)',
// // //     'rgba(192,75,192,1)',
// // //     'rgba(192,192,75,1)',
// // //     'rgba(75,75,192,1)',
// // //     'rgba(192,75,75,1)',
// // //     'rgb(15, 245, 15)',
// // //     'rgba(255,0,0,1)',
// // //     'rgba(0,0,255,1)',
// // //   ];

// // //   // Initialize chart with 8 datasets
// // //   useEffect(() => {
// // //     const ctx = chartRef.current.getContext('2d');
// // //     const datasets = Array.from({ length: 8 }, (_, i) => ({
// // //       label: `Channel ${i + 1}`,
// // //       data: [],
// // //       borderColor: channelColors[i],
// // //       borderWidth: 2,
// // //       fill: false,
// // //     }));

// // //     const instance = new Chart(ctx, {
// // //       type: 'line',
// // //       data: {
// // //         labels: [],
// // //         datasets: datasets,
// // //       },
// // //       options: {
// // //         responsive: true,
// // //         maintainAspectRatio: false,
// // //         scales: {
// // //           y: {
// // //             beginAtZero: true,
// // //             title: { display: true, text: 'Amplitude' },
// // //           },
// // //           x: {
// // //             title: { display: true, text: 'Time' },
// // //           },
// // //         },
// // //       },
// // //     });
// // //     setChartInstance(instance);

// // //     return () => {
// // //       instance.destroy();
// // //     };
// // //   }, []);

// // //   // Optional: Clear chart data before starting a new test if testing multiple users.
// // //   const clearChartData = () => {
// // //     if (chartInstance) {
// // //       chartInstance.data.labels = [];
// // //       chartInstance.data.datasets.forEach(ds => {
// // //         ds.data = [];
// // //       });
// // //       chartInstance.update();
// // //     }
// // //   };

// // //   // Start EEG: call backend and begin polling realtime data
// // //   const startEEG = async () => {
// // //     if (isEEGRunning) return;
// // //     // Optionally clear chart data for a new test session
// // //     clearChartData();
// // //     // Clear previous feedback when starting a new session
// // //     setFeedback(null);
// // //     try {
// // //       await fetch('http://localhost:8000/start-eeg');
// // //       setIsEEGRunning(true);

// // //       pollingIntervalRef.current = setInterval(async () => {
// // //         try {
// // //           const res = await fetch('http://localhost:8000/realtime');
// // //           const data = await res.json();
// // //           // Expecting data.eeg as an array of samples (each sample is an 8-element array)
// // //           if (data.eeg && data.eeg.length > 0) {
// // //             const lastSample = data.eeg[data.eeg.length - 1]; // [ch0, ch1, ..., ch7]
// // //             setCognitiveLoad(data.cognitive_load);
// // //             const now = new Date().toLocaleTimeString();
// // //             // Append new timestamp
// // //             chartInstance.data.labels.push(now);
// // //             // Append each channel's value (use 0 if missing)
// // //             for (let i = 0; i < 8; i++) {
// // //               const value = lastSample[i] !== undefined ? lastSample[i] : 0;
// // //               chartInstance.data.datasets[i].data.push(value);
// // //             }
// // //             // Keep only the last 50 data points
// // //             if (chartInstance.data.labels.length > 50) {
// // //               chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
// // //               chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
// // //             }
// // //             chartInstance.update();
// // //           }
// // //         } catch (err) {
// // //           console.error(err);
// // //         }
// // //       }, 2000);
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // Stop EEG: call backend, stop polling, and get session feedback.
// // //   // Also save session details to testHistory.
// // //   const stopEEG = async () => {
// // //     try {
// // //       const res = await fetch('http://localhost:8000/stop-eeg');
// // //       const data = await res.json();
// // //       setIsEEGRunning(false);
// // //       if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
// // //       // Set feedback from the backend (includes session time range and median cognitive load)
// // //       setFeedback(data.feedback);

// // //       // Save the completed session in history if username is provided
// // //       if (currentTestUsername.trim() !== '') {
// // //         const session = {
// // //           username: currentTestUsername,
// // //           date: new Date().toLocaleDateString(),
// // //           feedback: data.feedback.feedback,
// // //           startTime: data.feedback.start_time,
// // //           stopTime: data.feedback.stop_time,
// // //           medianCognitiveLoad: data.feedback.median_cognitive_load,
// // //         };
// // //         setTestHistory(prev => [...prev, session]);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // Filtering the test history based on username and cognitive load category
// // //   const filteredHistory = testHistory.filter(session => {
// // //     // Filter by username if provided (case insensitive, substring match)
// // //     const matchesUsername = filterUsername
// // //       ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
// // //       : true;
// // //     // Define cognitive load categories thresholds (example values)
// // //     let loadCategory = 'medium';
// // //     if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
// // //     else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
// // //     // Filter by cognitive load category if a specific one is chosen
// // //     const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
// // //     return matchesUsername && matchesCognitive;
// // //   });

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
// // //       <div className="max-w-5xl mx-auto">
// // //         {/* Header */}
// // //         <header className="mb-4 text-center">
// // //           <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
// // //           <p className="mt-2 text-lg text-gray-300">
// // //             Real-time EEG data visualization and session feedback
// // //           </p>
// // //         </header>

// // //         {/* 
// // //           Moved the Tab Navigation BELOW the header and CENTERED it.
// // //           Changed "flex space-x-4" to "flex justify-center space-x-4" 
// // //           to keep it centered.
// // //         */}
// // //         <div className="flex justify-center space-x-4 mb-8">
// // //           <button
// // //             onClick={() => setActiveTab('dashboard')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             Dashboard
// // //           </button>
// // //           <button
// // //             onClick={() => setActiveTab('history')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             User History
// // //           </button>
// // //         </div>

// // //         {/* Dashboard Section (always mounted but toggled by CSS) */}
// // //         <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
// // //           {/* User input for current test */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
// // //             <input
// // //               type="text"
// // //               placeholder="Enter Username "
// // //               value={currentTestUsername}
// // //               onChange={(e) => setCurrentTestUsername(e.target.value)}
// // //               className="p-2 rounded text-white mr-4"
// // //             />
// // //           </div>

// // //           {/* Controls */}
// // //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
// // //               <div className="flex space-x-4">
// // //                 <button
// // //                   onClick={startEEG}
// // //                   disabled={isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Start EEG
// // //                 </button>
// // //                 <button
// // //                   onClick={stopEEG}
// // //                   disabled={!isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Stop EEG
// // //                 </button>
// // //               </div>
// // //             </div>
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
// // //               <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
// // //             </div>
// // //           </div>

// // //           {/* EEG Chart */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
// // //             <div className="relative h-64">
// // //               <canvas ref={chartRef} />
// // //             </div>
// // //           </div>

// // //           {/* Session Feedback */}
// // //           {feedback && (
// // //             <div
// // //               className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
// // //                 parseFloat(feedback.median_cognitive_load) > 1.0
// // //                   ? 'border-4 border-red-500'
// // //                   : 'border-4 border-green-500'
// // //               }`}
// // //             >
// // //               <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
// // //               <p className="text-xl font-medium">{feedback.feedback}</p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
// // //               </p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
// // //               </p>
// // //             </div>
// // //           )}

// // //           {/* Distraction Buttons */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
// // //             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
// // //               <button
// // //                 onClick={() => console.log('sendDistraction: FLASH')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CROWD TALKING
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('HEAVY METAL')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 HEAVY METAL
// // //               </button>
// // //               <button
// // //                 onClick={() => {
// // //                   sendDistraction('HEAVY METAL');
// // //                   setIsHeavyMetalPlaying(prev => !prev);
// // //                 }}                
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CLASSIC MUSIC
// // //               </button>
// // //               <button
// // //                 onClick={() => console.log('sendDistraction: HIDE_TEXT')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 FLASH
// // //               </button>
// // //               <button
// // //                 onClick={() => console.log('sendDistraction: INVERT_COLORS')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 SHAKE
// // //               </button>
// // //               <button
// // //                 onClick={() => console.log('sendDistraction: RANDOM_POPUP')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 ROTATE
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* History Section */}
// // //         <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
// // //             {/* Filters */}
// // //             <div className="flex space-x-4 mb-4">
// // //               <input
// // //                 type="text"
// // //                 placeholder="Filter by Username"
// // //                 value={filterUsername}
// // //                 onChange={(e) => setFilterUsername(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               />
// // //               <select
// // //                 value={filterCognitive}
// // //                 onChange={(e) => setFilterCognitive(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               >
// // //                 <option value="all">All Cognitive Loads</option>
// // //                 <option value="low">Low</option>
// // //                 <option value="medium">Medium</option>
// // //                 <option value="high">High</option>
// // //               </select>
// // //             </div>
// // //             {/* History Table */}
// // //             <table className="w-full text-left">
// // //               <thead>
// // //                 <tr>
// // //                   <th className="p-2 border-b">Username</th>
// // //                   <th className="p-2 border-b">Date</th>
// // //                   <th className="p-2 border-b">Session Time</th>
// // //                   <th className="p-2 border-b">Median Cognitive Load</th>
// // //                   <th className="p-2 border-b">Feedback</th>
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {filteredHistory.map((session, index) => (
// // //                   <tr key={index}>
// // //                     <td className="p-2 border-b">{session.username}</td>
// // //                     <td className="p-2 border-b">{session.date}</td>
// // //                     <td className="p-2 border-b">
// // //                       {session.startTime} - {session.stopTime}
// // //                     </td>
// // //                     <td className="p-2 border-b">
// // //                       {session.medianCognitiveLoad.toFixed(2)}
// // //                     </td>
// // //                     <td className="p-2 border-b">{session.feedback}</td>
// // //                   </tr>
// // //                 ))}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // 'use client';

// // import React, { useState, useEffect, useRef } from 'react';
// // import Chart from 'chart.js/auto';
// // import jsPDF from 'jspdf';

// // export default function EEGDashboard() {
// //   // Existing state variables
// //   const [isEEGRunning, setIsEEGRunning] = useState(false);
// //   const [cognitiveLoad, setCognitiveLoad] = useState(0);
// //   const [feedback, setFeedback] = useState(null);
// //   const chartRef = useRef(null);
// //   const [chartInstance, setChartInstance] = useState(null);
// //   const pollingIntervalRef = useRef(null);

// //   // New state variables for tabs, history, and filtering
// //   const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
// //   const [testHistory, setTestHistory] = useState([]);
// //   const [currentTestUsername, setCurrentTestUsername] = useState('');
// //   const [filterUsername, setFilterUsername] = useState('');
// //   const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low

// //   // New toggle states for distractions
// //   const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
// //   const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
// //   const [isClassicOn, setIsClassicOn] = useState(false);

// //   // Broadcast function for distractions
// //   const sendDistraction = (type) => {
// //     const channel = new BroadcastChannel('distraction_channel');
// //     channel.postMessage({ type });
// //     console.log(`Distraction sent: ${type}`);
// //     channel.close();
// //   };

// //   // Toggle functions for heavy metal, crowd talking, and classic music
// //   const toggleHeavyMetal = () => {
// //     if (isHeavyMetalPlaying) {
// //       sendDistraction('HEAVY METAL_STOP');
// //       setIsHeavyMetalPlaying(false);
// //     } else {
// //       sendDistraction('HEAVY METAL_START');
// //       setIsHeavyMetalPlaying(true);
// //     }
// //   };

// //   const toggleCrowdTalking = () => {
// //     if (isCrowdTalkingOn) {
// //       sendDistraction('CROWD_TALKING_STOP');
// //       setIsCrowdTalkingOn(false);
// //     } else {
// //       sendDistraction('CROWD_TALKING_START');
// //       setIsCrowdTalkingOn(true);
// //     }
// //   };

// //   const toggleClassic = () => {
// //     if (isClassicOn) {
// //       sendDistraction('CLASSIC_STOP');
// //       setIsClassicOn(false);
// //     } else {
// //       sendDistraction('CLASSIC_START');
// //       setIsClassicOn(true);
// //     }
// //   };

// //   // Define colors for 8 channels (customize as needed)
// //   const channelColors = [
// //     'rgba(75,192,192,1)',
// //     'rgba(192,75,192,1)',
// //     'rgba(192,192,75,1)',
// //     'rgba(75,75,192,1)',
// //     'rgba(192,75,75,1)',
// //     'rgb(15, 245, 15)',
// //     'rgba(255,0,0,1)',
// //     'rgba(0,0,255,1)',
// //   ];

// //   // Initialize chart with 8 datasets
// //   useEffect(() => {
// //     const ctx = chartRef.current.getContext('2d');
// //     const datasets = Array.from({ length: 8 }, (_, i) => ({
// //       label: `Channel ${i + 1}`,
// //       data: [],
// //       borderColor: channelColors[i],
// //       borderWidth: 2,
// //       fill: false,
// //     }));

// //     const instance = new Chart(ctx, {
// //       type: 'line',
// //       data: {
// //         labels: [],
// //         datasets: datasets,
// //       },
// //       options: {
// //         responsive: true,
// //         maintainAspectRatio: false,
// //         scales: {
// //           y: {
// //             beginAtZero: true,
// //             title: { display: true, text: 'Amplitude' },
// //           },
// //           x: {
// //             title: { display: true, text: 'Time' },
// //           },
// //         },
// //       },
// //     });
// //     setChartInstance(instance);

// //     return () => {
// //       instance.destroy();
// //     };
// //   }, []);

// //   // Optional: Clear chart data before starting a new test if testing multiple users.
// //   const clearChartData = () => {
// //     if (chartInstance) {
// //       chartInstance.data.labels = [];
// //       chartInstance.data.datasets.forEach(ds => {
// //         ds.data = [];
// //       });
// //       chartInstance.update();
// //     }
// //   };

// //   // Start EEG: call backend and begin polling realtime data
// //   const startEEG = async () => {
// //     if (isEEGRunning) return;
// //     clearChartData();
// //     setFeedback(null);
// //     try {
// //       await fetch('http://localhost:8000/start-eeg');
// //       setIsEEGRunning(true);

// //       pollingIntervalRef.current = setInterval(async () => {
// //         try {
// //           const res = await fetch('http://localhost:8000/realtime');
// //           const data = await res.json();
// //           if (data.eeg && data.eeg.length > 0) {
// //             const lastSample = data.eeg[data.eeg.length - 1];
// //             setCognitiveLoad(data.cognitive_load);
// //             const now = new Date().toLocaleTimeString();
// //             chartInstance.data.labels.push(now);
// //             for (let i = 0; i < 8; i++) {
// //               const value = lastSample[i] !== undefined ? lastSample[i] : 0;
// //               chartInstance.data.datasets[i].data.push(value);
// //             }
// //             if (chartInstance.data.labels.length > 50) {
// //               chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
// //               chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
// //             }
// //             chartInstance.update();
// //           }
// //         } catch (err) {
// //           console.error(err);
// //         }
// //       }, 2000);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   // Stop EEG: call backend, stop polling, and get session feedback.
// //   const stopEEG = async () => {
// //     try {
// //       const res = await fetch('http://localhost:8000/stop-eeg');
// //       const data = await res.json();
// //       setIsEEGRunning(false);
// //       if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
// //       setFeedback(data.feedback);
// //       if (currentTestUsername.trim() !== '') {
// //         const session = {
// //           username: currentTestUsername,
// //           date: new Date().toLocaleDateString(),
// //           feedback: data.feedback.feedback,
// //           startTime: data.feedback.start_time,
// //           stopTime: data.feedback.stop_time,
// //           medianCognitiveLoad: data.feedback.median_cognitive_load,
// //         };
// //         setTestHistory(prev => [...prev, session]);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   // ============================================================================
// //   // PDF Generation
// //   // ============================================================================
// //   const downloadPDF = () => {
// //     // Create an A4 portrait document in mm units
// //     const doc = new jsPDF('p', 'mm', 'a4');
// //     const pageWidth = doc.internal.pageSize.getWidth();
// //     const pageHeight = doc.internal.pageSize.getHeight();

// //     // Header Section
// //     const username = currentTestUsername.trim() || 'Unknown User'; // Fallback if blank
// //     const assessedDate = new Date().toLocaleDateString();

// //     doc.setFontSize(18);
// //     doc.setFont('helvetica', 'bold');
// //     // Title: "username | Cognisense Report"
// //     doc.text(`${username} | Cognisense Report`, pageWidth / 2, 15, { align: 'center' });

// //     doc.setFontSize(11);
// //     doc.setFont('helvetica', 'normal');
// //     doc.text(`Asessed on ${assessedDate}`, pageWidth / 2, 23, { align: 'center' });

// //     // Divider line
// //     doc.setLineWidth(0.5);
// //     doc.setDrawColor(100);
// //     doc.line(10, 28, pageWidth - 10, 28);

// //     // EEG Chart Section
// //     doc.setFontSize(14);
// //     doc.setFont('helvetica', 'bold');
// //     doc.text("EEG Real-Time Chart", 10, 40);

// //     // Insert chart image (using chartRef.current)
// //     const chartCanvas = chartRef.current;
// //     const chartImage = chartCanvas.toDataURL('image/png', 1.0);
// //     const imgX = 10, imgY = 45, imgWidth = pageWidth - 20, imgHeight = 80;
// //     doc.setLineWidth(0.4);
// //     doc.rect(imgX, imgY, imgWidth, imgHeight); // Border for the chart image
// //     doc.addImage(chartImage, 'PNG', imgX, imgY, imgWidth, imgHeight);

// //     // Divider line
// //     doc.setLineWidth(0.3);
// //     doc.setDrawColor(150);
// //     doc.line(10, 135, pageWidth - 10, 135);

// //     // Session Details Section
// //     let yPosition = 145;
// //     doc.setFontSize(14);
// //     doc.setFont('helvetica', 'bold');
// //     doc.text("Session Details", 10, yPosition);
// //     yPosition += 8;

// //     doc.setFontSize(12);
// //     doc.setFont('helvetica', 'normal');
// //     if (feedback) {
// //       doc.text(`Feedback: ${feedback.feedback}`, 10, yPosition);
// //       yPosition += 7;
// //       doc.text(`Session Time: ${feedback.start_time} - ${feedback.stop_time}`, 10, yPosition);
// //       yPosition += 7;
// //       doc.text(`Median Cognitive Load: ${feedback.median_cognitive_load.toFixed(2)}`, 10, yPosition);
// //       yPosition += 10;
// //     } else {
// //       doc.text("No session feedback available.", 10, yPosition);
// //       yPosition += 10;
// //     }
   
// //     doc.text(`Current Cognitive Load: ${cognitiveLoad.toFixed(3)}`, 10, yPosition);
// //     yPosition += 10;

// //     // Footer with Page Numbers
// //     const pageCount = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= pageCount; i++) {
// //       doc.setPage(i);
// //       doc.setFontSize(10);
// //       doc.setTextColor(128);
// //       doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
// //     }

// //     // Save the PDF
// //     doc.save("CognitiveLoadReport.pdf");
// //   };

// //   // Filtering the test history based on username and cognitive load category
// //   const filteredHistory = testHistory.filter(session => {
// //     const matchesUsername = filterUsername
// //       ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
// //       : true;
// //     let loadCategory = 'medium';
// //     if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
// //     else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
// //     const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
// //     return matchesUsername && matchesCognitive;
// //   });

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
// //       <div className="max-w-5xl mx-auto">
// //         {/* Header */}
// //         <header className="mb-4 text-center">
// //           <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
// //           <p className="mt-2 text-lg text-gray-300">
// //             Real-time EEG data visualization and session feedback
// //           </p>
// //         </header>

// //         {/* Tab Navigation */}
// //         <div className="flex justify-center space-x-4 mb-8">
// //           <button
// //             onClick={() => setActiveTab('dashboard')}
// //             className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
// //           >
// //             Dashboard
// //           </button>
// //           <button
// //             onClick={() => setActiveTab('history')}
// //             className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
// //           >
// //             User History
// //           </button>
// //         </div>

// //         {/* Dashboard Section */}
// //         <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
// //           {/* User input for current test */}
// //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// //             <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
// //             <input
// //               type="text"
// //               placeholder="Enter Username"
// //               value={currentTestUsername}
// //               onChange={(e) => setCurrentTestUsername(e.target.value)}
// //               className="p-2 rounded text-white mr-4"
// //             />
// //           </div>

// //           {/* Controls */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
// //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// //               <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
// //               <div className="flex space-x-4">
// //                 <button
// //                   onClick={startEEG}
// //                   disabled={isEEGRunning}
// //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //                 >
// //                   Start EEG
// //                 </button>
// //                 <button
// //                   onClick={stopEEG}
// //                   disabled={!isEEGRunning}
// //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //                 >
// //                   Stop EEG
// //                 </button>
// //                 {/* NEW BUTTON HERE */}
// //                 <button
// //                   onClick={downloadPDF}
// //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //                 >
// //                   Download PDF Report
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// //               <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
// //               <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
// //             </div>
// //           </div>

// //           {/* EEG Chart */}
// //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// //             <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
// //             <div className="relative h-64">
// //               <canvas ref={chartRef} />
// //             </div>
// //           </div>

// //           {/* Session Feedback */}
// //           {feedback && (
// //             <div
// //               className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
// //                 parseFloat(feedback.median_cognitive_load) > 1.0
// //                   ? 'border-4 border-red-500'
// //                   : 'border-4 border-green-500'
// //               }`}
// //             >
// //               <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
// //               <p className="text-xl font-medium">{feedback.feedback}</p>
// //               <p className="mt-2">
// //                 <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
// //               </p>
// //               <p className="mt-2">
// //                 <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
// //               </p>
// //             </div>
// //           )}

// //           {/* Distraction Buttons */}
// //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// //             <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
// //             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
// //               <button
// //                 onClick={toggleCrowdTalking}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 CROWD TALKING
// //               </button>
// //               <button
// //                 onClick={toggleHeavyMetal}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 HEAVY METAL
// //               </button>
// //               <button
// //                 onClick={toggleClassic}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 CLASSIC MUSIC
// //               </button>
// //               <button
// //                 onClick={() => sendDistraction('FLASH')}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 FLASH
// //               </button>
// //               <button
// //                 onClick={() => sendDistraction('SHAKE')}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 SHAKE
// //               </button>
// //               <button
// //                 onClick={() => sendDistraction('ROTATE')}
// //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// //               >
// //                 ROTATE
// //               </button>
// //             </div>
// //           </div>
// //         </div>

// //         {/* History Section */}
// //         <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
// //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// //             <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
// //             <div className="flex space-x-4 mb-4">
// //               <input
// //                 type="text"
// //                 placeholder="Filter by Username"
// //                 value={filterUsername}
// //                 onChange={(e) => setFilterUsername(e.target.value)}
// //                 className="p-2 rounded text-black"
// //               />
// //               <select
// //                 value={filterCognitive}
// //                 onChange={(e) => setFilterCognitive(e.target.value)}
// //                 className="p-2 rounded text-black"
// //               >
// //                 <option value="all">All Cognitive Loads</option>
// //                 <option value="low">Low</option>
// //                 <option value="medium">Medium</option>
// //                 <option value="high">High</option>
// //               </select>
// //             </div>
// //             <table className="w-full text-left">
// //               <thead>
// //                 <tr>
// //                   <th className="p-2 border-b">Username</th>
// //                   <th className="p-2 border-b">Date</th>
// //                   <th className="p-2 border-b">Session Time</th>
// //                   <th className="p-2 border-b">Median Cognitive Load</th>
// //                   <th className="p-2 border-b">Feedback</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {filteredHistory.map((session, index) => (
// //                   <tr key={index}>
// //                     <td className="p-2 border-b">{session.username}</td>
// //                     <td className="p-2 border-b">{session.date}</td>
// //                     <td className="p-2 border-b">{session.startTime} - {session.stopTime}</td>
// //                     <td className="p-2 border-b">{session.medianCognitiveLoad.toFixed(2)}</td>
// //                     <td className="p-2 border-b">{session.feedback}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // USING THIS up--------------------------------------------------------------
// // // 'use client';

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import Chart from 'chart.js/auto';
// // // import jsPDF from 'jspdf';

// // // export default function EEGDashboard() {
// // //   // Existing state variables
// // //   const [isEEGRunning, setIsEEGRunning] = useState(false);
// // //   const [cognitiveLoad, setCognitiveLoad] = useState(0);
// // //   const [feedback, setFeedback] = useState(null);
// // //   const chartRef = useRef(null);
// // //   const [chartInstance, setChartInstance] = useState(null);
// // //   const pollingIntervalRef = useRef(null);

// // //   // New state variables for tabs, history, and filtering
// // //   const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
// // //   const [testHistory, setTestHistory] = useState([]);
// // //   const [currentTestUsername, setCurrentTestUsername] = useState('');
// // //   const [filterUsername, setFilterUsername] = useState('');
// // //   const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low

// // //   // New toggle states for distractions
// // //   const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
// // //   const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
// // //   const [isClassicOn, setIsClassicOn] = useState(false);

// // //   // Broadcast function for distractions
// // //   const sendDistraction = (type) => {
// // //     const channel = new BroadcastChannel('distraction_channel');
// // //     channel.postMessage({ type });
// // //     console.log(`Distraction sent: ${type}`);
// // //     channel.close();
// // //   };

// // //   // Toggle functions for heavy metal, crowd talking, and classic music
// // //   const toggleHeavyMetal = () => {
// // //     if (isHeavyMetalPlaying) {
// // //       sendDistraction('HEAVY METAL_STOP');
// // //       setIsHeavyMetalPlaying(false);
// // //     } else {
// // //       sendDistraction('HEAVY METAL_START');
// // //       setIsHeavyMetalPlaying(true);
// // //     }
// // //   };

// // //   const toggleCrowdTalking = () => {
// // //     if (isCrowdTalkingOn) {
// // //       sendDistraction('CROWD_TALKING_STOP');
// // //       setIsCrowdTalkingOn(false);
// // //     } else {
// // //       sendDistraction('CROWD_TALKING_START');
// // //       setIsCrowdTalkingOn(true);
// // //     }
// // //   };

// // //   const toggleClassic = () => {
// // //     if (isClassicOn) {
// // //       sendDistraction('CLASSIC_STOP');
// // //       setIsClassicOn(false);
// // //     } else {
// // //       sendDistraction('CLASSIC_START');
// // //       setIsClassicOn(true);
// // //     }
// // //   };

// // //   // Define colors for 8 channels (customize as needed)
// // //   const channelColors = [
// // //     'rgba(75,192,192,1)',
// // //     'rgba(192,75,192,1)',
// // //     'rgba(192,192,75,1)',
// // //     'rgba(75,75,192,1)',
// // //     'rgba(192,75,75,1)',
// // //     'rgb(15, 245, 15)',
// // //     'rgba(255,0,0,1)',
// // //     'rgba(0,0,255,1)',
// // //   ];

// // //   // Initialize chart with 8 datasets
// // //   useEffect(() => {
// // //     const ctx = chartRef.current.getContext('2d');
// // //     const datasets = Array.from({ length: 8 }, (_, i) => ({
// // //       label: `Channel ${i + 1}`,
// // //       data: [],
// // //       borderColor: channelColors[i],
// // //       borderWidth: 2,
// // //       fill: false,
// // //     }));

// // //     const instance = new Chart(ctx, {
// // //       type: 'line',
// // //       data: {
// // //         labels: [],
// // //         datasets: datasets,
// // //       },
// // //       options: {
// // //         responsive: true,
// // //         maintainAspectRatio: false,
// // //         scales: {
// // //           y: {
// // //             beginAtZero: true,
// // //             title: { display: true, text: 'Amplitude' },
// // //           },
// // //           x: {
// // //             title: { display: true, text: 'Time' },
// // //           },
// // //         },
// // //       },
// // //     });
// // //     setChartInstance(instance);

// // //     return () => {
// // //       instance.destroy();
// // //     };
// // //   }, []);

// // //   // Optional: Clear chart data before starting a new test if testing multiple users.
// // //   const clearChartData = () => {
// // //     if (chartInstance) {
// // //       chartInstance.data.labels = [];
// // //       chartInstance.data.datasets.forEach(ds => {
// // //         ds.data = [];
// // //       });
// // //       chartInstance.update();
// // //     }
// // //   };

// // //   // Start EEG: call backend and begin polling realtime data
// // //   const startEEG = async () => {
// // //     if (isEEGRunning) return;
// // //     clearChartData();
// // //     setFeedback(null);
// // //     try {
// // //       await fetch('http://localhost:8000/start-eeg');
// // //       setIsEEGRunning(true);

// // //       pollingIntervalRef.current = setInterval(async () => {
// // //         try {
// // //           const res = await fetch('http://localhost:8000/realtime');
// // //           const data = await res.json();
// // //           if (data.eeg && data.eeg.length > 0) {
// // //             const lastSample = data.eeg[data.eeg.length - 1];
// // //             setCognitiveLoad(data.cognitive_load);
// // //             const now = new Date().toLocaleTimeString();
// // //             chartInstance.data.labels.push(now);
// // //             for (let i = 0; i < 8; i++) {
// // //               const value = lastSample[i] !== undefined ? lastSample[i] : 0;
// // //               chartInstance.data.datasets[i].data.push(value);
// // //             }
// // //             if (chartInstance.data.labels.length > 50) {
// // //               chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
// // //               chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
// // //             }
// // //             chartInstance.update();
// // //           }
// // //         } catch (err) {
// // //           console.error(err);
// // //         }
// // //       }, 2000);
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // Stop EEG: call backend, stop polling, and get session feedback.
// // //   const stopEEG = async () => {
// // //     try {
// // //       const res = await fetch('http://localhost:8000/stop-eeg');
// // //       const data = await res.json();
// // //       setIsEEGRunning(false);
// // //       if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
// // //       setFeedback(data.feedback);
// // //       if (currentTestUsername.trim() !== '') {
// // //         const session = {
// // //           username: currentTestUsername,
// // //           date: new Date().toLocaleDateString(),
// // //           feedback: data.feedback.feedback,
// // //           startTime: data.feedback.start_time,
// // //           stopTime: data.feedback.stop_time,
// // //           medianCognitiveLoad: data.feedback.median_cognitive_load,
// // //         };
// // //         setTestHistory(prev => [...prev, session]);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // ============================================================================
// // //   // PDF Generation (Only the PDF report text is changed for clarity and ease of understanding)
// // //   // ============================================================================
// // //   const downloadPDF = () => {
// // //     const doc = new jsPDF('p', 'mm', 'a4');
// // //     const pageWidth = doc.internal.pageSize.getWidth();
// // //     const pageHeight = doc.internal.pageSize.getHeight();

// // //     // Header Section
// // //     const username = currentTestUsername.trim() || 'Unknown User';
// // //     const assessedDate = new Date().toLocaleDateString();

// // //     doc.setFontSize(18);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text(`${username} | Cognisense Report`, pageWidth / 2, 15, { align: 'center' });

// // //     doc.setFontSize(11);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(`Assessed on ${assessedDate}`, pageWidth / 2, 23, { align: 'center' });

// // //     // Divider line
// // //     doc.setLineWidth(0.5);
// // //     doc.setDrawColor(100);
// // //     doc.line(10, 28, pageWidth - 10, 28);

// // //     // EEG Chart Section
// // //     doc.setFontSize(14);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text("EEG Real-Time Chart", 10, 40);

// // //     const chartCanvas = chartRef.current;
// // //     const chartImage = chartCanvas.toDataURL('image/png', 1.0);
// // //     const imgX = 10, imgY = 45, imgWidth = pageWidth - 20, imgHeight = 80;
// // //     doc.setLineWidth(0.4);
// // //     doc.rect(imgX, imgY, imgWidth, imgHeight);
// // //     doc.addImage(chartImage, 'PNG', imgX, imgY, imgWidth, imgHeight);

// // //     // Divider line
// // //     doc.setLineWidth(0.3);
// // //     doc.setDrawColor(150);
// // //     doc.line(10, 135, pageWidth - 10, 135);

// // //     // Custom PDF Session Report Section
// // //     let yPosition = 145;
// // //     doc.setFontSize(14);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text("Session Details", 10, yPosition);
// // //     yPosition += 8;
// // //     doc.setFontSize(12);
// // //     doc.setFont('helvetica', 'normal');

// // //     if (feedback) {
// // //       // Custom friendly report text for users who don't understand graphs:
// // //       const customReport = 
// // // `Your brain had a busy moment!
// // // During this session (from ${feedback.start_time} to ${feedback.stop_time}), your brain was working hard.
// // // A median cognitive load value of ${feedback.median_cognitive_load.toFixed(2)} indicates that you were under high mental effort.
// // // Currently, your cognitive load is ${cognitiveLoad.toFixed(3)}.
// // // In simple terms, this report shows that your brain was “in overdrive” for a brief burst.
// // // If you feel this is too intense, consider taking regular breaks, getting some rest, or trying a relaxation technique.`;
// // //       const lines = doc.splitTextToSize(customReport, pageWidth - 20);
// // //       doc.text(lines, 10, yPosition);
// // //       yPosition += lines.length * 7;
// // //     } else {
// // //       doc.text("No session feedback available.", 10, yPosition);
// // //       yPosition += 10;
// // //     }
    
// // //     // Current Cognitive Load
// // //     doc.text(`Current Cognitive Load: ${cognitiveLoad.toFixed(3)}`, 10, yPosition);
// // //     yPosition += 10;

// // //     // Footer with Page Numbers
// // //     const pageCount = doc.internal.getNumberOfPages();
// // //     for (let i = 1; i <= pageCount; i++) {
// // //       doc.setPage(i);
// // //       doc.setFontSize(10);
// // //       doc.setTextColor(128);
// // //       doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
// // //     }

// // //     doc.save("CognitiveLoadReport.pdf");
// // //   };

// // //   // ============================================================================
// // //   // Filtering the test history based on username and cognitive load category
// // //   // ============================================================================
// // //   const filteredHistory = testHistory.filter(session => {
// // //     const matchesUsername = filterUsername
// // //       ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
// // //       : true;
// // //     let loadCategory = 'medium';
// // //     if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
// // //     else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
// // //     const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
// // //     return matchesUsername && matchesCognitive;
// // //   });

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
// // //       <div className="max-w-5xl mx-auto">
// // //         {/* Header */}
// // //         <header className="mb-4 text-center">
// // //           <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
// // //           <p className="mt-2 text-lg text-gray-300">
// // //             Real-time EEG data visualization and session feedback
// // //           </p>
// // //         </header>

// // //         {/* Tab Navigation */}
// // //         <div className="flex justify-center space-x-4 mb-8">
// // //           <button
// // //             onClick={() => setActiveTab('dashboard')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             Dashboard
// // //           </button>
// // //           <button
// // //             onClick={() => setActiveTab('history')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             User History
// // //           </button>
// // //         </div>

// // //         {/* Dashboard Section */}
// // //         <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
// // //           {/* User input for current test */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
// // //             <input
// // //               type="text"
// // //               placeholder="Enter Username"
// // //               value={currentTestUsername}
// // //               onChange={(e) => setCurrentTestUsername(e.target.value)}
// // //               className="p-2 rounded text-white mr-4"
// // //             />
// // //           </div>

// // //           {/* Controls */}
// // //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
// // //               <div className="flex space-x-4">
// // //                 <button
// // //                   onClick={startEEG}
// // //                   disabled={isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Start EEG
// // //                 </button>
// // //                 <button
// // //                   onClick={stopEEG}
// // //                   disabled={!isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Stop EEG
// // //                 </button>
// // //                 <button
// // //                   onClick={downloadPDF}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Download PDF Report
// // //                 </button>
// // //               </div>
// // //             </div>
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
// // //               <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
// // //             </div>
// // //           </div>

// // //           {/* EEG Chart */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
// // //             <div className="relative h-64">
// // //               <canvas ref={chartRef} />
// // //             </div>
// // //           </div>

// // //           {/* Session Feedback */}
// // //           {feedback && (
// // //             <div
// // //               className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
// // //                 parseFloat(feedback.median_cognitive_load) > 1.0
// // //                   ? 'border-4 border-red-500'
// // //                   : 'border-4 border-green-500'
// // //               }`}
// // //             >
// // //               <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
// // //               <p className="text-xl font-medium">{feedback.feedback}</p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
// // //               </p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
// // //               </p>
// // //             </div>
// // //           )}

// // //           {/* Distraction Buttons */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
// // //             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
// // //               <button
// // //                 onClick={toggleCrowdTalking}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CROWD TALKING
// // //               </button>
// // //               <button
// // //                 onClick={toggleHeavyMetal}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 HEAVY METAL
// // //               </button>
// // //               <button
// // //                 onClick={toggleClassic}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CLASSIC MUSIC
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('FLASH')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 FLASH
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('SHAKE')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 SHAKE
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('ROTATE')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 ROTATE
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* History Section */}
// // //         <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
// // //             <div className="flex space-x-4 mb-4">
// // //               <input
// // //                 type="text"
// // //                 placeholder="Filter by Username"
// // //                 value={filterUsername}
// // //                 onChange={(e) => setFilterUsername(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               />
// // //               <select
// // //                 value={filterCognitive}
// // //                 onChange={(e) => setFilterCognitive(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               >
// // //                 <option value="all">All Cognitive Loads</option>
// // //                 <option value="low">Low</option>
// // //                 <option value="medium">Medium</option>
// // //                 <option value="high">High</option>
// // //               </select>
// // //             </div>
// // //             <table className="w-full text-left">
// // //               <thead>
// // //                 <tr>
// // //                   <th className="p-2 border-b">Username</th>
// // //                   <th className="p-2 border-b">Date</th>
// // //                   <th className="p-2 border-b">Session Time</th>
// // //                   <th className="p-2 border-b">Median Cognitive Load</th>
// // //                   <th className="p-2 border-b">Feedback</th>
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {filteredHistory.map((session, index) => (
// // //                   <tr key={index}>
// // //                     <td className="p-2 border-b">{session.username}</td>
// // //                     <td className="p-2 border-b">{session.date}</td>
// // //                     <td className="p-2 border-b">{session.startTime} - {session.stopTime}</td>
// // //                     <td className="p-2 border-b">{session.medianCognitiveLoad.toFixed(2)}</td>
// // //                     <td className="p-2 border-b">{session.feedback}</td>
// // //                   </tr>
// // //                 ))}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // 'use client';

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import Chart from 'chart.js/auto';
// // // import jsPDF from 'jspdf';

// // // export default function EEGDashboard() {
// // //   // Existing state variables
// // //   const [isEEGRunning, setIsEEGRunning] = useState(false);
// // //   const [cognitiveLoad, setCognitiveLoad] = useState(0);
// // //   const [feedback, setFeedback] = useState(null);
// // //   const chartRef = useRef(null);
// // //   const [chartInstance, setChartInstance] = useState(null);
// // //   const pollingIntervalRef = useRef(null);

// // //   // New state variables for tabs, history, and filtering
// // //   const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
// // //   const [testHistory, setTestHistory] = useState([]);
// // //   const [currentTestUsername, setCurrentTestUsername] = useState('');
// // //   const [filterUsername, setFilterUsername] = useState('');
// // //   const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low

// // //   // New toggle states for distractions
// // //   const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
// // //   const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
// // //   const [isClassicOn, setIsClassicOn] = useState(false);

// // //   // Broadcast function for distractions
// // //   const sendDistraction = (type) => {
// // //     const channel = new BroadcastChannel('distraction_channel');
// // //     channel.postMessage({ type });
// // //     console.log(`Distraction sent: ${type}`);
// // //     channel.close();
// // //   };

// // //   // Toggle functions for heavy metal, crowd talking, and classic music
// // //   const toggleHeavyMetal = () => {
// // //     if (isHeavyMetalPlaying) {
// // //       sendDistraction('HEAVY METAL_STOP');
// // //       setIsHeavyMetalPlaying(false);
// // //     } else {
// // //       sendDistraction('HEAVY METAL_START');
// // //       setIsHeavyMetalPlaying(true);
// // //     }
// // //   };

// // //   const toggleCrowdTalking = () => {
// // //     if (isCrowdTalkingOn) {
// // //       sendDistraction('CROWD_TALKING_STOP');
// // //       setIsCrowdTalkingOn(false);
// // //     } else {
// // //       sendDistraction('CROWD_TALKING_START');
// // //       setIsCrowdTalkingOn(true);
// // //     }
// // //   };

// // //   const toggleClassic = () => {
// // //     if (isClassicOn) {
// // //       sendDistraction('CLASSIC_STOP');
// // //       setIsClassicOn(false);
// // //     } else {
// // //       sendDistraction('CLASSIC_START');
// // //       setIsClassicOn(true);
// // //     }
// // //   };

// // //   // Define colors for 8 channels (customize as needed)
// // //   const channelColors = [
// // //     'rgba(75,192,192,1)',
// // //     'rgba(192,75,192,1)',
// // //     'rgba(192,192,75,1)',
// // //     'rgba(75,75,192,1)',
// // //     'rgba(192,75,75,1)',
// // //     'rgb(15, 245, 15)',
// // //     'rgba(255,0,0,1)',
// // //     'rgba(0,0,255,1)',
// // //   ];

// // //   // Define the channel names corresponding to the 8 channels from CGX
// // //   const channelNames = ["Fp1", "Fp2", "F3", "F4", "P3", "P4", "O1", "O2"];

// // //   // Initialize chart with 8 datasets labeled with the channel names
// // //   useEffect(() => {
// // //     const ctx = chartRef.current.getContext('2d');
// // //     const datasets = channelNames.map((name, i) => ({
// // //       label: name, // Use channel name from the array
// // //       data: [],
// // //       borderColor: channelColors[i],
// // //       borderWidth: 2,
// // //       fill: false,
// // //     }));

// // //     const instance = new Chart(ctx, {
// // //       type: 'line',
// // //       data: {
// // //         labels: [],
// // //         datasets: datasets,
// // //       },
// // //       options: {
// // //         responsive: true,
// // //         maintainAspectRatio: false,
// // //   scales: {
// // //     y: {
// // //       // Remove or change these settings to let auto-scaling decide or set a custom range:
// // //       // beginAtZero: true,  // Remove this if you want Chart.js to auto-adjust
// // //       min: -200,          // Set a custom minimum value if needed
// // //       max: 200,           // Set a custom maximum value if needed
// // //       title: { display: true, text: 'Amplitude' },
// // //     },
// // //     x: {
// // //       title: { display: true, text: 'Time' },
// // //     },
// // //   },
// // // },
// // //     });
// // //     setChartInstance(instance);

// // //     return () => {
// // //       instance.destroy();
// // //     };
// // //   }, []);

// // //   // Optional: Clear chart data before starting a new test if testing multiple users.
// // //   const clearChartData = () => {
// // //     if (chartInstance) {
// // //       chartInstance.data.labels = [];
// // //       chartInstance.data.datasets.forEach(ds => {
// // //         ds.data = [];
// // //       });
// // //       chartInstance.update();
// // //     }
// // //   };

// // //   // Start EEG: call backend and begin polling realtime data
// // //   const startEEG = async () => {
// // //     if (isEEGRunning) return;
// // //     clearChartData();
// // //     setFeedback(null);
// // //     try {
// // //       await fetch('http://localhost:8000/start-eeg');
// // //       setIsEEGRunning(true);

// // //       pollingIntervalRef.current = setInterval(async () => {
// // //         try {
// // //           const res = await fetch('http://localhost:8000/realtime');
// // //           const data = await res.json();
// // //           if (data.eeg && data.eeg.length > 0) {
// // //             const lastSample = data.eeg[data.eeg.length - 1];
// // //             setCognitiveLoad(data.cognitive_load);
// // //             const now = new Date().toLocaleTimeString();
// // //             chartInstance.data.labels.push(now);
// // //             for (let i = 0; i < 8; i++) {
// // //               const value = lastSample[i] !== undefined ? lastSample[i] : 0;
// // //               chartInstance.data.datasets[i].data.push(value);
// // //             }
// // //             if (chartInstance.data.labels.length > 50) {
// // //               chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
// // //               chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
// // //             }
// // //             chartInstance.update();
// // //           }
// // //         } catch (err) {
// // //           console.error(err);
// // //         }
// // //       }, 2000);
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // Stop EEG: call backend, stop polling, and get session feedback.
// // //   const stopEEG = async () => {
// // //     try {
// // //       const res = await fetch('http://localhost:8000/stop-eeg');
// // //       const data = await res.json();
// // //       setIsEEGRunning(false);
// // //       if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
// // //       setFeedback(data.feedback);
// // //       if (currentTestUsername.trim() !== '') {
// // //         const session = {
// // //           username: currentTestUsername,
// // //           date: new Date().toLocaleDateString(),
// // //           feedback: data.feedback.feedback,
// // //           startTime: data.feedback.start_time,
// // //           stopTime: data.feedback.stop_time,
// // //           medianCognitiveLoad: data.feedback.median_cognitive_load,
// // //         };
// // //         setTestHistory(prev => [...prev, session]);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   // ============================================================================
// // //   // PDF Generation (Only the PDF report text is changed for clarity and ease of understanding)
// // //   // ============================================================================
// // //   const downloadPDF = () => {
// // //     const doc = new jsPDF('p', 'mm', 'a4');
// // //     const pageWidth = doc.internal.pageSize.getWidth();
// // //     const pageHeight = doc.internal.pageSize.getHeight();

// // //     // Header Section
// // //     const username = currentTestUsername.trim() || 'Unknown User';
// // //     const assessedDate = new Date().toLocaleDateString();

// // //     doc.setFontSize(18);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text(`${username} | Cognisense Report`, pageWidth / 2, 15, { align: 'center' });

// // //     doc.setFontSize(11);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(`Assessed on ${assessedDate}`, pageWidth / 2, 23, { align: 'center' });

// // //     // Divider line
// // //     doc.setLineWidth(0.5);
// // //     doc.setDrawColor(100);
// // //     doc.line(10, 28, pageWidth - 10, 28);

// // //     // EEG Chart Section
// // //     doc.setFontSize(14);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text("EEG Real-Time Chart", 10, 40);

// // //     const chartCanvas = chartRef.current;
// // //     const chartImage = chartCanvas.toDataURL('image/png', 1.0);
// // //     const imgX = 10, imgY = 45, imgWidth = pageWidth - 20, imgHeight = 80;
// // //     doc.setLineWidth(0.4);
// // //     doc.rect(imgX, imgY, imgWidth, imgHeight);
// // //     doc.addImage(chartImage, 'PNG', imgX, imgY, imgWidth, imgHeight);

// // //     // Divider line
// // //     doc.setLineWidth(0.3);
// // //     doc.setDrawColor(150);
// // //     doc.line(10, 135, pageWidth - 10, 135);

// // //     // Custom PDF Session Report Section
// // //     let yPosition = 145;
// // //     doc.setFontSize(14);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text("Session Details", 10, yPosition);
// // //     yPosition += 8;
// // //     doc.setFontSize(12);
// // //     doc.setFont('helvetica', 'normal');

// // //     if (feedback) {
// // //       // Custom friendly report text for users who don't understand graphs:
// // //       const customReport = 
// // // `Your brain had a busy moment!
// // // During this session (from ${feedback.start_time} to ${feedback.stop_time}), your brain was working hard.
// // // A median cognitive load value of ${feedback.median_cognitive_load.toFixed(2)} indicates that you were under high mental effort.
// // // Currently, your cognitive load is ${cognitiveLoad.toFixed(3)}.
// // // In simple terms, this report shows that your brain was “in overdrive” for a brief burst.
// // // If you feel this is too intense, consider taking regular breaks, getting some rest, or trying a relaxation technique.`;
// // //       const lines = doc.splitTextToSize(customReport, pageWidth - 20);
// // //       doc.text(lines, 10, yPosition);
// // //       yPosition += lines.length * 7;
// // //     } else {
// // //       doc.text("No session feedback available.", 10, yPosition);
// // //       yPosition += 10;
// // //     }
    
// // //     // Current Cognitive Load
// // //     doc.text(`Current Cognitive Load: ${cognitiveLoad.toFixed(3)}`, 10, yPosition);
// // //     yPosition += 10;

// // //     // Footer with Page Numbers
// // //     const pageCount = doc.internal.getNumberOfPages();
// // //     for (let i = 1; i <= pageCount; i++) {
// // //       doc.setPage(i);
// // //       doc.setFontSize(10);
// // //       doc.setTextColor(128);
// // //       doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
// // //     }

// // //     doc.save("CognitiveLoadReport.pdf");
// // //   };

// // //   // ============================================================================
// // //   // Filtering the test history based on username and cognitive load category
// // //   // ============================================================================
// // //   const filteredHistory = testHistory.filter(session => {
// // //     const matchesUsername = filterUsername
// // //       ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
// // //       : true;
// // //     let loadCategory = 'medium';
// // //     if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
// // //     else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
// // //     const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
// // //     return matchesUsername && matchesCognitive;
// // //   });

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
// // //       <div className="max-w-5xl mx-auto">
// // //         {/* Header */}
// // //         <header className="mb-4 text-center">
// // //           <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
// // //           <p className="mt-2 text-lg text-gray-300">
// // //             Real-time EEG data visualization and session feedback
// // //           </p>
// // //         </header>

// // //         {/* Tab Navigation */}
// // //         <div className="flex justify-center space-x-4 mb-8">
// // //           <button
// // //             onClick={() => setActiveTab('dashboard')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             Dashboard
// // //           </button>
// // //           <button
// // //             onClick={() => setActiveTab('history')}
// // //             className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
// // //           >
// // //             User History
// // //           </button>
// // //         </div>

// // //         {/* Dashboard Section */}
// // //         <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
// // //           {/* User input for current test */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
// // //             <input
// // //               type="text"
// // //               placeholder="Enter Username"
// // //               value={currentTestUsername}
// // //               onChange={(e) => setCurrentTestUsername(e.target.value)}
// // //               className="p-2 rounded text-white mr-4"
// // //             />
// // //           </div>

// // //           {/* Controls */}
// // //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
// // //               <div className="flex space-x-4">
// // //                 <button
// // //                   onClick={startEEG}
// // //                   disabled={isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Start EEG
// // //                 </button>
// // //                 <button
// // //                   onClick={stopEEG}
// // //                   disabled={!isEEGRunning}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Stop EEG
// // //                 </button>
// // //                 <button
// // //                   onClick={downloadPDF}
// // //                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //                 >
// // //                   Download PDF Report
// // //                 </button>
// // //               </div>
// // //             </div>
// // //             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //               <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
// // //               <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
// // //             </div>
// // //           </div>

// // //           {/* EEG Chart */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
// // //             <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
// // //             <div className="relative h-64">
// // //               <canvas ref={chartRef} />
// // //             </div>
// // //           </div>

// // //           {/* Session Feedback */}
// // //           {feedback && (
// // //             <div
// // //               className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
// // //                 parseFloat(feedback.median_cognitive_load) > 1.0
// // //                   ? 'border-4 border-red-500'
// // //                   : 'border-4 border-green-500'
// // //               }`}
// // //             >
// // //               <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
// // //               <p className="text-xl font-medium">{feedback.feedback}</p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
// // //               </p>
// // //               <p className="mt-2">
// // //                 <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
// // //               </p>
// // //             </div>
// // //           )}

// // //           {/* Distraction Buttons */}
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
// // //             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
// // //               <button
// // //                 onClick={toggleCrowdTalking}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CROWD TALKING
// // //               </button>
// // //               <button
// // //                 onClick={toggleHeavyMetal}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 HEAVY METAL
// // //               </button>
// // //               <button
// // //                 onClick={toggleClassic}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 CLASSIC MUSIC
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('FLASH')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 FLASH
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('SHAKE')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 SHAKE
// // //               </button>
// // //               <button
// // //                 onClick={() => sendDistraction('ROTATE')}
// // //                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
// // //               >
// // //                 ROTATE
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* History Section */}
// // //         <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
// // //           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
// // //             <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
// // //             <div className="flex space-x-4 mb-4">
// // //               <input
// // //                 type="text"
// // //                 placeholder="Filter by Username"
// // //                 value={filterUsername}
// // //                 onChange={(e) => setFilterUsername(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               />
// // //               <select
// // //                 value={filterCognitive}
// // //                 onChange={(e) => setFilterCognitive(e.target.value)}
// // //                 className="p-2 rounded text-black"
// // //               >
// // //                 <option value="all">All Cognitive Loads</option>
// // //                 <option value="low">Low</option>
// // //                 <option value="medium">Medium</option>
// // //                 <option value="high">High</option>
// // //               </select>
// // //             </div>
// // //             <table className="w-full text-left">
// // //               <thead>
// // //                 <tr>
// // //                   <th className="p-2 border-b">Username</th>
// // //                   <th className="p-2 border-b">Date</th>
// // //                   <th className="p-2 border-b">Session Time</th>
// // //                   <th className="p-2 border-b">Median Cognitive Load</th>
// // //                   <th className="p-2 border-b">Feedback</th>
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {filteredHistory.map((session, index) => (
// // //                   <tr key={index}>
// // //                     <td className="p-2 border-b">{session.username}</td>
// // //                     <td className="p-2 border-b">{session.date}</td>
// // //                     <td className="p-2 border-b">{session.startTime} - {session.stopTime}</td>
// // //                     <td className="p-2 border-b">{session.medianCognitiveLoad.toFixed(2)}</td>
// // //                     <td className="p-2 border-b">{session.feedback}</td>
// // //                   </tr>
// // //                 ))}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// //-------------------------------------------------------------------------------------------------------------------------------------------------------


// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import Chart from 'chart.js/auto';
// import jsPDF from 'jspdf';

// export default function EEGDashboard() {
//   // Existing state variables
//   const [isEEGRunning, setIsEEGRunning] = useState(false);
//   const [cognitiveLoad, setCognitiveLoad] = useState(0);
//   const [feedback, setFeedback] = useState(null);
//   const chartRef = useRef(null);
//   const [chartInstance, setChartInstance] = useState(null);
  
//   // Change: Instead of polling, we store our websocket reference here.
//   const websocketRef = useRef(null);

//   const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
//   const [testHistory, setTestHistory] = useState([]);
//   const [currentTestUsername, setCurrentTestUsername] = useState('');
//   const [filterUsername, setFilterUsername] = useState('');
//   const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low

//   // New toggle states for distractions
//   const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
//   const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
//   const [isClassicOn, setIsClassicOn] = useState(false);

//   // Broadcast function for distractions
//   const sendDistraction = (type) => {
//     const channel = new BroadcastChannel('distraction_channel');
//     channel.postMessage({ type });
//     console.log(`Distraction sent: ${type}`);
//     channel.close();
//   };

//   // Toggle functions for heavy metal, crowd talking, and classic music
//   const toggleHeavyMetal = () => {
//     if (isHeavyMetalPlaying) {
//       sendDistraction('HEAVY METAL_STOP');
//       setIsHeavyMetalPlaying(false);
//     } else {
//       sendDistraction('HEAVY METAL_START');
//       setIsHeavyMetalPlaying(true);
//     }
//   };

//   const toggleCrowdTalking = () => {
//     if (isCrowdTalkingOn) {
//       sendDistraction('CROWD_TALKING_STOP');
//       setIsCrowdTalkingOn(false);
//     } else {
//       sendDistraction('CROWD_TALKING_START');
//       setIsCrowdTalkingOn(true);
//     }
//   };

//   const toggleClassic = () => {
//     if (isClassicOn) {
//       sendDistraction('CLASSIC_STOP');
//       setIsClassicOn(false);
//     } else {
//       sendDistraction('CLASSIC_START');
//       setIsClassicOn(true);
//     }
//   };

//   // Define colors for 8 channels (customize as needed)
//   // const channelColors = [
//   //   'rgba(75,192,192,1)',
//   //   'rgba(192,75,192,1)',
//   //   'rgba(192,192,75,1)',
//   //   'rgba(75,75,192,1)',
//   //   'rgba(192,75,75,1)',
//   //   'rgb(15, 245, 15)',
//   //   'rgba(255,0,0,1)',
//   //   'rgba(0,0,255,1)',
//   // ];

//   // // Initialize chart with 8 datasets
//   // useEffect(() => {
//   //   const ctx = chartRef.current.getContext('2d');
//   //   const datasets = Array.from({ length: 8 }, (_, i) => ({
//   //     label: `Channel ${i + 1}`,
//   //     data: [],
//   //     borderColor: channelColors[i],
//   //     borderWidth: 2,
//   //     fill: false,
//   //   }));

//   //   const instance = new Chart(ctx, {
//   //     type: 'line',
//   //     data: {
//   //       labels: [],
//   //       datasets: datasets,
//   //     },
//   //     options: {
//   //       responsive: true,
//   //       maintainAspectRatio: false,
//   //       scales: {
//   //         y: {
//   //           beginAtZero: true,
//   //           title: { display: true, text: 'Amplitude' },
//   //         },
//   //         x: {
//   //           title: { display: true, text: 'Time' },
//   //         },
//   //       },
//   //     },
//   //   });
//   //   setChartInstance(instance);

//   //   return () => {
//   //     instance.destroy();
//   //   };
//   // }, []);
//   useEffect(() => {
//     const ctx = chartRef.current.getContext('2d');
    
//     // Define channel names and corresponding colors here:
//     const channelNames = ["Fp1", "Fp2", "F3", "F4", "P3", "P4", "O1", "O2"];
//     const channelColors = [
//       'rgba(75,192,192,1)',
//       'rgba(192,75,192,1)',
//       'rgba(192,192,75,1)',
//       'rgba(75,75,192,1)',
//       'rgba(192,75,75,1)',
//       'rgb(15,245,15)',
//       'rgba(255,0,0,1)',
//       'rgba(0,0,255,1)',
//     ];
    
//     // Create datasets using channelNames and channelColors
//     const datasets = channelNames.map((name, i) => ({
//       label: name,
//       data: [],
//       borderColor: channelColors[i],
//       borderWidth: 2,
//       fill: false,
//     }));
  
//     // const instance = new Chart(ctx, {
//     //   type: 'line',
//     //   data: {
//     //     labels: [],
//     //     datasets: datasets,
//     //   },
//     //   options: {
//     //     responsive: true,
//     //     maintainAspectRatio: false,
//     //     scales: {
//     //       y: {
//     //         beginAtZero: true,
//     //         title: { display: true, text: 'Amplitude' },
//     //       },
//     //       x: {
//     //         title: { display: true, text: 'Time' },
//     //       },
//     //     },
//     //   },
//     // });
//     const instance = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: [],
//         datasets: datasets,
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: false,  // allows negative numbers
//             min: -200,           // sets the lower bound
//             max: 200,            // sets the upper bound
//             title: { 
//               display: true, 
//               text: 'Amplitude' 
//             },
//           },
//           x: {
//             title: { 
//               display: true, 
//               text: 'Time' 
//             },
//           },
//         },
//       },
//     });
    
    
//     setChartInstance(instance);
  
//     return () => {
//       instance.destroy();
//     };
//   }, []);
  
//   // Optional: Clear chart data before starting a new test if testing multiple users.
//   const clearChartData = () => {
//     if (chartInstance) {
//       chartInstance.data.labels = [];
//       chartInstance.data.datasets.forEach(ds => {
//         ds.data = [];
//       });
//       chartInstance.update();
//     }
//   };

//   // =========================
//   // EEG Reading Part (Modified)
//   // =========================

//   // Start EEG: call backend and begin reading realtime data via WebSocket.
//   const startEEG = async () => {
//     if (isEEGRunning) return;
//     clearChartData();
//     setFeedback(null);
//     try {
//       await fetch('http://localhost:8000/start-eeg');
//       setIsEEGRunning(true);

//       // Open a WebSocket connection for realtime EEG data.
//       const ws = new WebSocket("ws://localhost:8000/ws");
//       ws.onopen = () => {
//         console.log("WebSocket connected.");
//       };
//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.eeg && data.eeg.length > 0) {
//           const lastSample = data.eeg[data.eeg.length - 1];
//           setCognitiveLoad(data.cognitive_load);
//           const now = new Date().toLocaleTimeString();
//           chartInstance.data.labels.push(now);
//           for (let i = 0; i < 8; i++) {
//             const value = lastSample[i] !== undefined ? lastSample[i] : 0;
//             chartInstance.data.datasets[i].data.push(value);
//           }
//           if (chartInstance.data.labels.length > 50) {
//             chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
//             chartInstance.data.datasets.forEach(ds => ds.data.splice(0, ds.data.length - 50));
//           }
//           chartInstance.update();
//         }
//       };
//       ws.onerror = (error) => {
//         console.error("WebSocket error:", error);
//       };
//       ws.onclose = () => {
//         console.log("WebSocket disconnected.");
//       };
//       websocketRef.current = ws;  // Save the reference for later closure.
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Stop EEG: call backend, stop reading data, and get session feedback.
//   const stopEEG = async () => {
//     try {
//       const res = await fetch('http://localhost:8000/stop-eeg');
//       const data = await res.json();
//       setIsEEGRunning(false);
//       // Close the WebSocket connection if it exists.
//       if (websocketRef.current) {
//         websocketRef.current.close();
//         websocketRef.current = null;
//       }
//       setFeedback(data.feedback);
//       if (currentTestUsername.trim() !== '') {
//         const session = {
//           username: currentTestUsername,
//           date: new Date().toLocaleDateString(),
//           feedback: data.feedback.feedback,
//           startTime: data.feedback.start_time,
//           stopTime: data.feedback.stop_time,
//           medianCognitiveLoad: data.feedback.median_cognitive_load,
//         };
//         setTestHistory(prev => [...prev, session]);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // =========================
//   // End of EEG Reading Part
//   // =========================

//   // ========================================================================
//   // PDF Generation and Other Functions - DO NOT CHANGE ANYTHING BELOW
//   // ========================================================================

//   const downloadPDF = () => {
//     const doc = new jsPDF('p', 'mm', 'a4');
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     const username = currentTestUsername.trim() || 'Unknown User';
//     const assessedDate = new Date().toLocaleDateString();

//     doc.setFontSize(18);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`${username} | Cognisense Report`, pageWidth / 2, 15, { align: 'center' });

//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Asessed on ${assessedDate}`, pageWidth / 2, 23, { align: 'center' });

//     doc.setLineWidth(0.5);
//     doc.setDrawColor(100);
//     doc.line(10, 28, pageWidth - 10, 28);

//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text("EEG Real-Time Chart", 10, 40);

//     const chartCanvas = chartRef.current;
//     const chartImage = chartCanvas.toDataURL('image/png', 1.0);
//     const imgX = 10, imgY = 45, imgWidth = pageWidth - 20, imgHeight = 80;
//     doc.setLineWidth(0.4);
//     doc.rect(imgX, imgY, imgWidth, imgHeight);
//     doc.addImage(chartImage, 'PNG', imgX, imgY, imgWidth, imgHeight);

//     doc.setLineWidth(0.3);
//     doc.setDrawColor(150);
//     doc.line(10, 135, pageWidth - 10, 135);

//     let yPosition = 145;
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text("Session Details", 10, yPosition);
//     yPosition += 8;

//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'normal');
//     if (feedback) {
//       doc.text(`Feedback: ${feedback.feedback}`, 10, yPosition);
//       yPosition += 7;
//       doc.text(`Session Time: ${feedback.start_time} - ${feedback.stop_time}`, 10, yPosition);
//       yPosition += 7;
//       doc.text(`Median Cognitive Load: ${feedback.median_cognitive_load.toFixed(2)}`, 10, yPosition);
//       yPosition += 10;
//     } else {
//       doc.text("No session feedback available.", 10, yPosition);
//       yPosition += 10;
//     }
   
//     doc.text(`Current Cognitive Load: ${cognitiveLoad.toFixed(3)}`, 10, yPosition);
//     yPosition += 10;

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(10);
//       doc.setTextColor(128);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
//     }

//     doc.save("CognitiveLoadReport.pdf");
//   };

//   const filteredHistory = testHistory.filter(session => {
//     const matchesUsername = filterUsername
//       ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
//       : true;
//     let loadCategory = 'medium';
//     if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
//     else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
//     const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
//     return matchesUsername && matchesCognitive;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
//       <div className="max-w-5xl mx-auto">
//         <header className="mb-4 text-center">
//           <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
//           <p className="mt-2 text-lg text-gray-300">
//             Real-time EEG data visualization and session feedback
//           </p>
//         </header>
//         <div className="flex justify-center space-x-4 mb-8">
//           <button
//             onClick={() => setActiveTab('dashboard')}
//             className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
//           >
//             Dashboard
//           </button>
//           <button
//             onClick={() => setActiveTab('history')}
//             className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
//           >
//             User History
//           </button>
//         </div>
//         <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
//           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
//             <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
//             <input
//               type="text"
//               placeholder="Enter Username"
//               value={currentTestUsername}
//               onChange={(e) => setCurrentTestUsername(e.target.value)}
//               className="p-2 rounded text-white mr-4"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
//               <h2 className="text-2xl font-semibold mb-4">EEG Controls</h2>
//               <div className="flex space-x-4">
//                 <button
//                   onClick={startEEG}
//                   disabled={isEEGRunning}
//                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//                 >
//                   Start EEG
//                 </button>
//                 <button
//                   onClick={stopEEG}
//                   disabled={!isEEGRunning}
//                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//                 >
//                   Stop EEG
//                 </button>
//                 <button
//                   onClick={downloadPDF}
//                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//                 >
//                   Download PDF Report
//                 </button>
//               </div>
//             </div>
//             <div className="bg-white/10 p-6 rounded-lg shadow-lg">
//               <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
//               <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
//             </div>
//           </div>
//           <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
//             <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart</h2>
//             <div className="relative h-64">
//               <canvas ref={chartRef} />
//             </div>
//           </div>
//           {feedback && (
//             <div
//               className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
//                 parseFloat(feedback.median_cognitive_load) > 1.0
//                   ? 'border-4 border-red-500'
//                   : 'border-4 border-green-500'
//               }`}
//             >
//               <h2 className="text-2xl font-semibold mb-4">Session Feedback</h2>
//               <p className="text-xl font-medium">{feedback.feedback}</p>
//               <p className="mt-2">
//                 <span className="font-semibold">Session Time:</span> {feedback.start_time} - {feedback.stop_time}
//               </p>
//               <p className="mt-2">
//                 <span className="font-semibold">Median Cognitive Load:</span> {feedback.median_cognitive_load.toFixed(2)}
//               </p>
//             </div>
//           )}
//           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
//             <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//               <button
//                 onClick={toggleCrowdTalking}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 CROWD TALKING
//               </button>
//               <button
//                 onClick={toggleHeavyMetal}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 HEAVY METAL
//               </button>
//               <button
//                 onClick={toggleClassic}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 CLASSIC MUSIC
//               </button>
//               <button
//                 onClick={() => sendDistraction('FLASH')}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 FLASH
//               </button>
//               <button
//                 onClick={() => sendDistraction('SHAKE')}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 SHAKE
//               </button>
//               <button
//                 onClick={() => sendDistraction('ROTATE')}
//                 className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
//               >
//                 ROTATE
//               </button>
//             </div>
//           </div>
//         </div>
//         <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
//           <div className="bg-white/10 p-6 rounded-lg shadow-lg">
//             <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
//             <div className="flex space-x-4 mb-4">
//               <input
//                 type="text"
//                 placeholder="Filter by Username"
//                 value={filterUsername}
//                 onChange={(e) => setFilterUsername(e.target.value)}
//                 className="p-2 rounded text-black"
//               />
//               <select
//                 value={filterCognitive}
//                 onChange={(e) => setFilterCognitive(e.target.value)}
//                 className="p-2 rounded text-black"
//               >
//                 <option value="all">All Cognitive Loads</option>
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
//             <table className="w-full text-left">
//               <thead>
//                 <tr>
//                   <th className="p-2 border-b">Username</th>
//                   <th className="p-2 border-b">Date</th>
//                   <th className="p-2 border-b">Session Time</th>
//                   <th className="p-2 border-b">Median Cognitive Load</th>
//                   <th className="p-2 border-b">Feedback</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredHistory.map((session, index) => (
//                   <tr key={index}>
//                     <td className="p-2 border-b">{session.username}</td>
//                     <td className="p-2 border-b">{session.date}</td>
//                     <td className="p-2 border-b">{session.startTime} - {session.stopTime}</td>
//                     <td className="p-2 border-b">{session.medianCognitiveLoad.toFixed(2)}</td>
//                     <td className="p-2 border-b">{session.feedback}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// //--------------------------------------------------------------------------------------------------------------------------------------------------------
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
function getBorderClass(ratio) {
  if (ratio < 2.0) {
    return 'border-4 border-green-500';
  } else if (ratio > 5.0) {
    return 'border-4 border-red-500';
  } else {
    return 'border-4 border-white';
  }
}


export default function EEGDashboard() {
  // Existing state variables
  const [isEEGRunning, setIsEEGRunning] = useState(false);
  const [cognitiveLoad, setCognitiveLoad] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  // Instead of polling, we store our WebSocket reference here.
  const websocketRef = useRef(null);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
  const [testHistory, setTestHistory] = useState([]);
  const [currentTestUsername, setCurrentTestUsername] = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [filterCognitive, setFilterCognitive] = useState('all'); // options: all, high, medium, low

  // New toggle states for distractions
  const [isHeavyMetalPlaying, setIsHeavyMetalPlaying] = useState(false);
  const [isCrowdTalkingOn, setIsCrowdTalkingOn] = useState(false);
  const [isClassicOn, setIsClassicOn] = useState(false);

  // Broadcast function for distractions
  const sendDistraction = (type) => {
    const channel = new BroadcastChannel('distraction_channel');
    channel.postMessage({ type });
    console.log(`Distraction sent: ${type}`);
    channel.close();
  };

  // Toggle functions for heavy metal, crowd talking, and classic music
  const toggleHeavyMetal = () => {
    if (isHeavyMetalPlaying) {
      sendDistraction('HEAVY METAL_STOP');
      setIsHeavyMetalPlaying(false);
    } else {
      sendDistraction('HEAVY METAL_START');
      setIsHeavyMetalPlaying(true);
    }
  };

  const toggleCrowdTalking = () => {
    if (isCrowdTalkingOn) {
      sendDistraction('CROWD_TALKING_STOP');
      setIsCrowdTalkingOn(false);
    } else {
      sendDistraction('CROWD_TALKING_START');
      setIsCrowdTalkingOn(true);
    }
  };

  const toggleClassic = () => {
    if (isClassicOn) {
      sendDistraction('CLASSIC_STOP');
      setIsClassicOn(false);
    } else {
      sendDistraction('CLASSIC_START');
      setIsClassicOn(true);
    }
  };

  // Helper: choose line color based on ratio value.
  const getColorForRatio = (ratio) => {
    // Example thresholds: adjust as needed.
    if (ratio < 2.0) {
      return 'green'; // Low load
    } else if (ratio > 3.5) {
      return 'red';   // High load
    } else {
      return 'white'; // Normal load
    }
  };

  // Initialize chart with a single dataset for "Average Beta/Alpha Ratio"
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    const dataset = {
      label: 'Average Beta/Alpha Ratio',
      data: [],
      borderColor: 'white', // default color for normal load
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointBackgroundColor: 'white',
    };

    const instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [dataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            // adjust the min/max as needed for your expected ratio range
            title: { 
              display: true, 
              text: 'Beta/Alpha Ratio' 
            },
          },
          x: {
            title: { 
              display: true, 
              text: 'Time' 
            },
          },
        },
      },
    });
    
    setChartInstance(instance);
  
    return () => {
      instance.destroy();
    };
  }, []);
  
  // Optional: Clear chart data before starting a new test.
  const clearChartData = () => {
    if (chartInstance) {
      chartInstance.data.labels = [];
      chartInstance.data.datasets.forEach(ds => {
        ds.data = [];
      });
      chartInstance.update();
    }
  };

  // =========================
  // EEG Reading Part (Modified for Average Beta/Alpha Ratio)
  // =========================

  // Start EEG: call backend and begin reading realtime data via WebSocket.
  const startEEG = async () => {
    if (isEEGRunning) return;
    clearChartData();
    setFeedback(null);
    try {
      await fetch('http://localhost:8000/start-eeg');
      setIsEEGRunning(true);

      // Open a WebSocket connection for realtime EEG data.
      const ws = new WebSocket("ws://localhost:8000/ws");
      ws.onopen = () => {
        console.log("WebSocket connected.");
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Expecting the backend to send:
        // data.ratio -> an array of ratio points (not used for plotting, but available if needed)
        // data.current_ratio -> latest average ratio (Beta/Alpha) across channels.
        if (data.ratio && (data.current_ratio !== undefined)) {
          const avgRatio = data.current_ratio;
          
          // Update displayed cognitive load (Beta/Alpha Ratio)
          setCognitiveLoad(avgRatio);
          const now = new Date().toLocaleTimeString();
          chartInstance.data.labels.push(now);
          // Add the current ratio to the chart dataset.
          chartInstance.data.datasets[0].data.push(avgRatio);
          
          // Limit to the last 50 data points.
          if (chartInstance.data.labels.length > 50) {
            chartInstance.data.labels.splice(0, chartInstance.data.labels.length - 50);
            chartInstance.data.datasets[0].data.splice(0, chartInstance.data.datasets[0].data.length - 50);
          }
          
          // Update the line color based on current ratio.
          const color = getColorForRatio(avgRatio);
          chartInstance.data.datasets[0].borderColor = color;
          chartInstance.data.datasets[0].pointBackgroundColor = color;
          
          chartInstance.update();
        }
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      ws.onclose = () => {
        console.log("WebSocket disconnected.");
      };
      websocketRef.current = ws;  // Save the WebSocket reference.
    } catch (err) {
      console.error(err);
    }
  };

  // Stop EEG: call backend, stop reading data, and get session feedback.
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
      if (currentTestUsername.trim() !== '') {
        const session = {
          username: currentTestUsername,
          date: new Date().toLocaleDateString(),
          feedback: data.feedback.feedback,
          startTime: data.feedback.start_time,
          stopTime: data.feedback.stop_time,
          medianCognitiveLoad: data.feedback.median_cognitive_load,
        };
        setTestHistory(prev => [...prev, session]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // End of EEG Reading Part
  // =========================

  // ========================================================================
  // PDF Generation and Other Functions - DO NOT CHANGE ANYTHING BELOW
  // ========================================================================

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const username = currentTestUsername.trim() || 'Unknown User';
    const assessedDate = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${username} | Cognisense Report`, pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessed on ${assessedDate}`, pageWidth / 2, 23, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(100);
    doc.line(10, 28, pageWidth - 10, 28);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("EEG Real-Time Chart", 10, 40);

    const chartCanvas = chartRef.current;
    const chartImage = chartCanvas.toDataURL('image/png', 1.0);
    const imgX = 10, imgY = 45, imgWidth = pageWidth - 20, imgHeight = 80;
    doc.setLineWidth(0.4);
    doc.rect(imgX, imgY, imgWidth, imgHeight);
    doc.addImage(chartImage, 'PNG', imgX, imgY, imgWidth, imgHeight);

    doc.setLineWidth(0.3);
    doc.setDrawColor(150);
    doc.line(10, 135, pageWidth - 10, 135);

    let yPosition = 145;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Session Details", 10, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (feedback) {
      doc.text(`Feedback: ${feedback.feedback}`, 10, yPosition);
      yPosition += 7;
      doc.text(`Session Time: ${feedback.start_time} - ${feedback.stop_time}`, 10, yPosition);
      yPosition += 7;
      doc.text(`Median Cognitive Load: ${feedback.median_cognitive_load.toFixed(2)}`, 10, yPosition);
      yPosition += 10;
    } else {
      doc.text("No session feedback available.", 10, yPosition);
      yPosition += 10;
    }
   
    doc.text(`Current Cognitive Load: ${cognitiveLoad.toFixed(3)}`, 10, yPosition);
    yPosition += 10;

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save("CognitiveLoadReport.pdf");
  };

  const filteredHistory = testHistory.filter(session => {
    const matchesUsername = filterUsername
      ? session.username.toLowerCase().includes(filterUsername.toLowerCase())
      : true;
    let loadCategory = 'medium';
    if (session.medianCognitiveLoad > 1.5) loadCategory = 'high';
    else if (session.medianCognitiveLoad < 0.8) loadCategory = 'low';
    const matchesCognitive = filterCognitive === 'all' ? true : loadCategory === filterCognitive;
    return matchesUsername && matchesCognitive;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold">Cognisense EEG Dashboard</h1>
          <p className="mt-2 text-lg text-gray-300">
            Real-time EEG data visualization (Combined) and session feedback
          </p>
        </header>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-blue-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600' : 'bg-blue-400'}`}
          >
            User History
          </button>
        </div>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test User Details</h2>
            <input
              type="text"
              placeholder="Enter Username"
              value={currentTestUsername}
              onChange={(e) => setCurrentTestUsername(e.target.value)}
              className="p-2 rounded text-white mr-4"
            />
          </div>
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
                <button
                  onClick={downloadPDF}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
                >
                  Download PDF Report
                </button>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Cognitive Load</h2>
              <p className="text-3xl">{cognitiveLoad.toFixed(3)}</p>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">EEG Real-Time Chart (Combined)</h2>
            <div className="relative h-64">
              <canvas ref={chartRef} />
            </div>
          </div>
          {feedback && (
            <div
            className={`bg-white/20 p-6 rounded-lg shadow-lg mb-8 ${
              parseFloat(feedback.median_cognitive_load) < 2.0
                ? 'border-4 border-green-500'
                : parseFloat(feedback.median_cognitive_load) > 3.5
                  ? 'border-4 border-red-500'
                  : 'border-4 border-white'
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
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Distractions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                onClick={toggleCrowdTalking}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                CROWD TALKING
              </button>
              <button
                onClick={toggleHeavyMetal}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                HEAVY METAL
              </button>
              <button
                onClick={toggleClassic}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                CLASSIC MUSIC
              </button>
              <button
                onClick={() => sendDistraction('FLASH')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                FLASH
              </button>
              <button
                onClick={() => sendDistraction('SHAKE')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                SHAKE
              </button>
              <button
                onClick={() => sendDistraction('ROTATE')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
              >
                ROTATE
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
          <div className="bg-white/10 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">User Test History</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Filter by Username"
                value={filterUsername}
                onChange={(e) => setFilterUsername(e.target.value)}
                className="p-2 rounded text-black"
              />
              <select
                value={filterCognitive}
                onChange={(e) => setFilterCognitive(e.target.value)}
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
                {filteredHistory.map((session, index) => (
                  <tr key={index}>
                    <td className="p-2 border-b">{session.username}</td>
                    <td className="p-2 border-b">{session.date}</td>
                    <td className="p-2 border-b">{session.startTime} - {session.stopTime}</td>
                    <td className="p-2 border-b">{session.medianCognitiveLoad.toFixed(2)}</td>
                    <td className="p-2 border-b">{session.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
