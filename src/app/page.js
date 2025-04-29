'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from './firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// If using Firebase Auth or Firestore in the client, import them here
// import { db } from '@/lib/firebase'; // example path

 // Cognitive questions array
 const questions = [
  { question: "Did you have breakfast today?", type: "radio", options: ["Yes", "No"] },
  { question: "Did you sleep well last night?", type: "radio", options: ["Yes", "No"] },
  { question: "How many hours of sleep did you have?", type: "radio", options: ["Less than 5 hours", "5-7 hours", "More than 7 hours"]},
  { question: "Did you eat dinner last night?", type: "radio", options: ["Yes", "No"]},
  { question: "How did you feel when you woke up this morning?", type: "radio", options: ["Sleepy", "Awake", "Energetic", "Exhausted"]},
  { question: "Did you listen to music today?", type: "radio", options: ["Yes", "No"]},
  { question: "Did you exercise today?", type: "radio", options: ["Yes", "No"]},
  { question: "What's the weather like where you are?", type: "radio", options: ["Sunny", "Cloudy", "Rainy", "Snowy"] }
];

export default function Page() {
  const router = useRouter();

  // ---------------------------
  // 1) State for user + pages
  // ---------------------------
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activePage, setActivePage] = useState('page1');

  // Registration / Login form states
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regDOB, setRegDOB] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);


  // ---------------------------
  // 2) “Lifecycle”
  // ---------------------------
  useEffect(() => {
    // Example: On mount, show page1 by default
    setActivePage('page1');
  }, []);

  // ---------------------------
  // 3) Navigation
  // ---------------------------
  const showPage = (pageId) => {
    setActivePage(pageId);
  };

  const logout = () => {
    setLoggedInUser(null);
    showPage('page1');
  };

  // ---------------------------
  // 4) Registration & Login carine (updated to save to firebase users)
  // ---------------------------
  async function handleRegistration() {
    if (!regName || !regUser || !regDOB || !regEmail || !regPass || !regConfirm) {
      alert('Please fill out all fields.');
      return;
    }
    if (regPass !== regConfirm) {
      alert('Passwords do not match!');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPass);
      const user = userCredential.user;
  
      // Save additional user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: regName,
        username: regUser,
        dob: regDOB,
        email: regEmail,
        createdAt: new Date(),
      });
  
      localStorage.setItem('currentUser', user.uid);
      setLoggedInUser(regUser);
      showPage('page5');
      alert('🎉 Registration successful!');
    } catch (err) {
      console.error(err);
      alert('❌ Registration failed.');
    }
  }  
  async function handleLogin() {
    if (!loginUser || !loginPass) {
      alert('Please fill out all fields.');
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginUser, loginPass);
      const user = userCredential.user;
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const username = userDoc.exists() ? userDoc.data().username : 'anonymous';
  
      setLoggedInUser(username);
      localStorage.setItem('currentUser', user.uid);
      alert('✅ Login successful!');
      showPage('page5');
    } catch (err) {
      console.error(err);
      alert('❌ Invalid credentials.');
    }
  }  

    // ---------------------------
  // Handle Answer Change for Cognitive Questions
  // ---------------------------
  const handleAnswerChange = (e) => {
    const { name, value } = e.target;
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  };

  // Navigate to the next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  // ---------------------------
  // 5) Render UI
  // ---------------------------
  return (
    <main className="bg-gradient min-h-screen text-white font-sans">
      {/* --- HEADER NAV --- */}
      <header
        className="fixed w-full top-0 z-50 p-4 backdrop-blur-sm bg-[rgba(2,62,138,0.1)] border-b border-white/10 transition-all"
      >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
  <span id="welcome-text" className="font-bold">
    <a href="#" className="hover:underline">
      {loggedInUser ? `Welcome, ${loggedInUser}` : 'Welcome, Guest'}
    </a>
  </span>
  <nav>
    <button
      onClick={() => router.push('/game/')}
      className="ml-4 hover:underline"
    >
      Game
    </button>
    <button
      onClick={() => router.push('/nasatlx/')}
      className="ml-4 hover:underline"
    >
      NASA TLX
    </button>
    <button
      onClick={() => router.push('/report/')}
      className="ml-4 hover:underline"
    >
      Report
    </button>
    <button onClick={logout} className="ml-4 hover:underline">
      Logout
    </button>
  </nav>
</div>
      </header>

      {/* --- CONTAINER --- */}
      <div className="max-w-3xl mx-auto mt-[100px] p-6 bg-white/10 rounded-2xl shadow-xl transition">
        {/* PAGE 1 */}
        {activePage === 'page1' && (
          <section>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-sky-300 bg-clip-text text-transparent">
              Welcome to Cognisense
            </h2>
            <p className="mb-2">
              You are about to embark on a journey to test your cognitive load as
              an interplanetary explorer! These tasks will challenge your memory,
              reaction times, and mental flexibility. Sensors will measure your
              brain activity in real time.
            </p>
            <p className="mb-6">
              Are you ready to see how well you can perform under pressure?
              Click &quot;Next&quot; to begin!
            </p>
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
              onClick={() => showPage('page2')}
            >
              Next
            </button>
          </section>
        )}

        {/* PAGE 2: EEG Setup */}
        {activePage === 'page2' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">EEG Setup Instructions</h2>
            <p>To measure cognitive load, place the EEG pads on your head as follows:</p>
            <ul className="list-disc list-inside ml-4 my-4 space-y-1">
              <li><strong>Frontal Lobe (Fp1, Fp2)</strong></li>
              <li><strong>Ear Lobes (A1, A2)</strong></li>
              <li><strong>Parietal Lobe (P3, Pz, P4)</strong></li>
              <li><strong>Occipital Lobe (O1, O2)</strong></li>
            </ul>
            <img
              src="/electrode.png"
              alt="EEG placement diagram"
              className="w-full max-w-md mx-auto my-4 border border-white/10 rounded"
            />
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
              onClick={() => showPage('page3')}
            >
              Next
            </button>
          </section>
        )}

        {/* PAGE 3: Full Registration */}
        {activePage === 'page3' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">Full Registration</h2>
            <div className="mb-4">
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Enter your full name"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Username</label>
              <input
                type="text"
                value={regUser}
                onChange={(e) => setRegUser(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Choose a username"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Year of Birth</label>
              <input
                type="number"
                value={regDOB}
                onChange={(e) => setRegDOB(e.target.value)}
                min={1900}
                max={2099}
                className="w-full p-2 rounded bg-white/5"
                placeholder="e.g., 2000"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="yourname@example.com"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Enter a password"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Re-enter password"
              />
            </div>
            <button
              onClick={handleRegistration}
              className="px-4 py-2 mr-4 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
            >
              Register
            </button>
            <button
              className="underline text-blue-200"
              onClick={() => showPage('page4')}
            >
              Already have an account? Sign In
            </button>
          </section>
        )}

        {/* PAGE 4: Login */}
        {activePage === 'page4' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">Login</h2>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full p-2 rounded bg-white/5"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
            >
              Login
            </button>
          </section>
        )}

        {/* PAGE 5: How Testing Works */}
        {activePage === 'page5' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">How the Testing Works</h2>
            <p className="mb-2">
              Once you click &quot;Next&quot;, the EEG sensors will begin capturing
              your brain activity using EEG technology.
            </p>
            <p className="mb-2">
              The sensors will monitor your cognitive load as you perform tasks,
              providing real-time insights into your mental state.
            </p>
            <p className="mb-6">
              Please ensure that you are in a comfortable position and ready to begin.
            </p>
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
              onClick={() => showPage('page6')}
            >
              Next
            </button>
          </section>
        )}

        {/* PAGE 6: (Cognitive Questions) ... You can replicate your question logic here. */}
        {activePage === 'page6' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">Cognitive Load Assessment</h2>
            <p className="mb-4">Please answer the following questions:</p>

            {/* Loop through questions */}
            {questions.map((question, index) => (
              <div key={index} className="mb-6">
                <p className="font-semibold">{`Q${index + 1}: ${question.question}`}</p>
                <div className="flex flex-col space-y-2">
                  {question.options.map((option, i) => (
                    <label key={i} className="flex items-center">
                      <input
                        type="radio"
                        name={`question${index}`}
                        value={option}
                        checked={responses[`question${index}`] === option}
                        onChange={handleAnswerChange}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
              onClick={() => showPage('page7')}
            >
              Next
            </button>
          </section>
        )}

        {/* PAGE 7: Start Game Button */}
        {activePage === 'page7' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">Moving to Level 2</h2>
            <p className="mb-6">
              Click below to begin the second part (the main Cognisense Game).
            </p>
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
              onClick={() => {
                // Go to the actual game route
                router.push('/game');
              }}
            >
              Start Cognisense Game
            </button>
          </section>
        )}

        {/* "Dashboard" Example */}
        {activePage === 'dashboard' && (
          <section>
            <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
            <p>Show your Chart.js or real-time data here.</p>
          </section>
        )}
      </div>
    </main>
  );
}
