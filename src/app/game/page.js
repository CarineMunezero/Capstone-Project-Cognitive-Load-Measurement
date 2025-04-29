'use client';
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import EmotionDetector from '../components/EmotionDetector';
import { useRouter } from 'next/navigation';
import { getEmotionSummary, clearEmotionLogs } from "../components/EmotionDetector";
import { db } from "../firebase/firebase";
import { addDoc } from "firebase/firestore";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function GamePage() {
  // ------------------------------------------------------------------
  // 1) Global States
  // ------------------------------------------------------------------
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [taskScores, setTaskScores] = useState({});
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [showWordMem, setShowWordMem] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showReaction2, setShowReaction2] = useState(false);
  const [showCategorizationIntro, setShowCategorizationIntro] = useState(false);
  const [showCategorization, setShowCategorization] = useState(false);
  const [showMemoryRecallEnd, setShowMemoryRecallEnd] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [isEmotionRunning, setIsEmotionRunning] = useState(false);

  // Distractions (pop-up modals)
  const [distractions, setDistractions] = useState([]);

  // Word Memorization
  const [memorizedWords, setMemorizedWords] = useState([]);
  const [memWordsHidden, setMemWordsHidden] = useState(false);

  // Math
  const [mathProblem, setMathProblem] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathIndex, setMathIndex] = useState(0);
  const [mathMax, setMathMax] = useState(5);
  const [mathScore, setMathScore] = useState(0);

  // Reaction Time 2
  const [reaction2Color, setReaction2Color] = useState('red');
  const reaction2ColorRef = useRef('red');
  const reactionStart2 = useRef(null);
  function setReaction2(color) {
    setReaction2Color(color);
    reaction2ColorRef.current = color;
  }

  // Categorization
  const [catLevel, setCatLevel] = useState(1);
  const [catTimeLeft, setCatTimeLeft] = useState(0);
  const catTimerRef = useRef(null);
  const [catGameActive, setCatGameActive] = useState(false);
  const [catItems, setCatItems] = useState([]);
  const [catIndex, setCatIndex] = useState(0);
  const [catSelectedCategories, setCatSelectedCategories] = useState([[], []]);
  const [catFeedback, setCatFeedback] = useState('');

  // Memory Recall
  const [recallInput, setRecallInput] = useState('');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const toggleScoreBreakdown = () => {
    setShowScoreBreakdown((prev) => !prev);
  };

  // ------------------------------------------------------------------
  // 2) Utility make sure scores never go negative
  // ------------------------------------------------------------------
  function updateScore(points, msg) {
    // Ensure score doesn't go negative
    setScore((prev) => Math.max(0, prev + points)); 
    setFeedback((prev) => [...prev, msg]);
  }

  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function addTaskScore(taskName, value) {
    // Ensure no negative task score
    setTaskScores((prev) => ({
      ...prev,
      [taskName]: Math.max(0, value),
    }));
  }

  // ------------------------------------------------------------------
  // 3) Distractions (Overlay Modals)
  // ------------------------------------------------------------------
  useEffect(() => {
    const distractInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newId = Date.now();
        setDistractions((prev) => [
          ...prev,
          { id: newId, message: getRandomDistraction() }
        ]);
      }
    }, 10000);
    return () => clearInterval(distractInterval);
  }, []);

  function getRandomDistraction() {
    const msgs = [
      'ALERT: Type "QUINTESSENCE" in the box below immediately!',
      'POP QUIZ: Compute 13 + 8 and enter the answer!',
      'NOTICE: Type "SYZYGY" exactly to dismiss this!',
      'WARNING: Enter "MNEMONIC" to continue!',
      'ATTENTION: Type "ENTROPY" precisely!',
      'IMMEDIATE ACTION: Solve 17 - 5 now!',
      'CRITICAL: Type "CIRCUMLOCUTION" to silence this!',
      'FINAL CHECK: Unscramble "XLGOP" and type the correct word!'
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function handleCloseDistraction(id, userInput) {
    const typed = (userInput || '').trim().toLowerCase();
    // No points are given for distractions anymore
    setDistractions((prev) => prev.filter((d) => d.id !== id));
  }

  // ------------------------------------------------------------------
  // 4) Intro => Start
  // ------------------------------------------------------------------
  function handleStartGame() {
    // --- UNLOCK AUDIO AUTOPLAY ---
    const audio = document.getElementById('heavyMetalAudio');
    if (audio) {
      audio.muted = true;
      audio.loop = true;
      audio.play().then(() => {
        audio.pause();
        audio.muted = false;
      }).catch(err => console.warn('Audio unlock failed:', err));
    }
    setIsEmotionRunning(true);
    setShowIntro(false);
    resetGameData();
    setShowWordMem(true);
    startWordMemorization();
    setIsEmotionRunning(true);
  }

  function resetGameData() {
    setScore(0);
    setFeedback([]);
    setTaskScores({});
    setMemorizedWords([]);
    setMemWordsHidden(false);
    setMathProblem('');
    setMathAnswer('');
    setMathIndex(0);
    setMathScore(0);
    setReaction2Color('red');
    reaction2ColorRef.current = 'red';
    setCatLevel(1);
    setCatTimeLeft(0);
    setCatGameActive(false);
    setCatItems([]);
    setCatIndex(0);
    setCatSelectedCategories([[], []]);
    setCatFeedback('');
    setRecallInput('');

    setShowWordMem(false);
    setShowMath(false);
    setShowReaction2(false);
    setShowCategorizationIntro(false);
    setShowCategorization(false);
    setShowMemoryRecallEnd(false);
    setShowFinalScore(false);
  }

  // ------------------------------------------------------------------
  // 5) Word Memorization
  // ------------------------------------------------------------------
  function startWordMemorization() {
    const wordPool = [
      'apple', 'banana', 'car', 'dog', 'elephant', 'flower',
      'guitar', 'house', 'island', 'jacket', 'kangaroo', 'lemon',
      'mountain', 'notebook', 'ocean', 'piano', 'queen', 'rainbow',
      'sunflower', 'tiger', 'doctor', 'bus', 'keyboard', 'book', 'rocket'
    ];
    shuffleArray(wordPool);
    const chosen = wordPool.slice(0, 7);
    setMemorizedWords(chosen);

    setTimeout(() => {
      setMemWordsHidden(true);
      setTimeout(() => {
        setShowWordMem(false);
        setShowMath(true);
        startMathProblems();
      }, 1000);
    }, 5000);
  }

  // ------------------------------------------------------------------
  // 6) Math Problems
  // ------------------------------------------------------------------
  function startMathProblems() {
    generateMathProblem();
    setMathIndex(1);
    setMathScore(0);
  }

  function generateMathProblem() {
    const ops = ['+', '-', '*', '+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const n1 = Math.floor(Math.random() * 30) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setMathProblem(`${n1} ${op} ${n2} = ?`);
  }

  function handleMathSubmit() {
    if (!mathProblem) return;
    const eq = eval(mathProblem.replace('= ?', ''));
    if (parseInt(mathAnswer) === eq) {
      updateScore(2, `Correct math: ${mathProblem}`);
      setMathScore((prev) => prev + 2); // Award 2 points
    } else {
      updateScore(-2, `Wrong math: ${mathProblem}, typed ${mathAnswer}`);
      setMathScore((prev) => prev - 2); // Deduct 2 points
    }
    setMathAnswer('');
    if (mathIndex < mathMax) {
      setMathIndex((prev) => prev + 1);
      generateMathProblem();
    } else {
      addTaskScore('Math Problems', mathScore);
      setShowMath(false);
      setShowReaction2(true);
      startReaction2Task();
    }
  }

  // ------------------------------------------------------------------
  // 7) Reaction Time 2
  // ------------------------------------------------------------------
  function startReaction2Task() {
    const wait = Math.floor(Math.random() * 2000) + 500;
    setTimeout(() => {
      setReaction2('green');
      reactionStart2.current = Date.now();
      window.addEventListener('keydown', handleSpacebarReaction2);
    }, wait);
  }

  function handleSpacebarReaction2(e) {
    if (e.code === 'Space' && reaction2ColorRef.current === 'green') {
      const rTime = Date.now() - reactionStart2.current;
      if (rTime < 500) {
        updateScore(2, `Excellent Reaction2: ${rTime}ms`);
        addTaskScore('Reaction Time Task 2', 2); // 2 points for fast reaction
      } else {
        updateScore(-2, `Slow Reaction2: ${rTime}ms`);
        addTaskScore('Reaction Time Task 2', -2); // -2 points for slow reaction
      }
      window.removeEventListener('keydown', handleSpacebarReaction2);
      setShowReaction2(false);
      setReaction2('red');
      setShowCategorizationIntro(true);
    }
  }

  // ------------------------------------------------------------------
  // 8) Categorization Intro
  // ------------------------------------------------------------------
  function handleStartCategorization() {
    setShowCategorizationIntro(false);
    setShowCategorization(true);
    startCategorizationGame();
  }

  // ------------------------------------------------------------------
  // 9) Categorization
  // ------------------------------------------------------------------
  function randomizeUrl(path) {
    return path + `?rand=${Math.random()}`;
  }

  // Randomize images for categorization
  const fruitImages = [
    randomizeUrl('/fruits.jpeg'),
    randomizeUrl('/fruits2.jpeg'),
    randomizeUrl('/fruits3.jpg'),
    randomizeUrl('/fruits4.jpg'),
    randomizeUrl('/fruits5.jpg')
  ];

  const vehicleImages = [
    randomizeUrl('/vehicle.jpeg'),
    randomizeUrl('/vehicle2.jpeg'),
    randomizeUrl('/vehicle3.jpg')
  ];

  const animalImages = [
    randomizeUrl('/animal.webp'),
    randomizeUrl('/animal3.jpeg'),
    randomizeUrl('/animals2.webp')
  ];

  const instrumentImages = [
    randomizeUrl('/instrument.jpg'),
    randomizeUrl('/instrument2.jpg'),
    randomizeUrl('/instrument3.jpg')
  ];

  const professionImages = [
    randomizeUrl('/profession.jpg'),
    randomizeUrl('/profession2.jpeg'),
    randomizeUrl('/tool.jpeg')
  ];

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function startCategorizationGame() {
    const levelTimeLimits = { 1: 40, 2: 40, 3: 40 };
    const tLimit = levelTimeLimits[catLevel] || 40;
    setCatTimeLeft(tLimit);

    const allItems = createCategorizationItems();
    let selected = [[], []];

    if (catLevel === 1) {
      selected = [['Fruit'], ['Vehicle']];
    } else if (catLevel === 2) {
      selected = [['Animal'], ['Instrument']];
    } else if (catLevel === 3) {
      selected = [['Instrument', 'Profession'], ['Animal', 'Fruit']];
    }
    setCatSelectedCategories(selected);

    const filtered = allItems.filter(
      (it) => selected[0].includes(it.category) || selected[1].includes(it.category)
    );
    const shuffled = shuffleArray(filtered);
    setCatItems(shuffled);
    setCatIndex(0);

    setCatGameActive(true);
    startCatTimer();
  }

  function createCategorizationItems() {
    const items = [
      { type: 'word', text: 'Apple', category: 'Fruit' },
      { type: 'word', text: 'Banana', category: 'Fruit' },
      { type: 'word', text: 'Watermelon', category: 'Fruit' },
      { type: 'word', text: 'Car', category: 'Vehicle' },
      { type: 'word', text: 'Bus', category: 'Vehicle' },
      { type: 'word', text: 'Plane', category: 'Vehicle' },
      { type: 'word', text: 'Dog', category: 'Animal' },
      { type: 'word', text: 'Cat', category: 'Animal' },
      { type: 'word', text: 'Lion', category: 'Animal' },
      { type: 'word', text: 'Guitar', category: 'Instrument' },
      { type: 'word', text: 'Violin', category: 'Instrument' },
      { type: 'word', text: 'Chef', category: 'Profession' },
      { type: 'word', text: 'Doctor', category: 'Profession' },
      { type: 'word', text: 'Teacher', category: 'Profession' },
    ];

    for (let i = 0; i < 3; i++) {
      items.push({ type: 'image', src: pickRandom(fruitImages), category: 'Fruit' });
      items.push({ type: 'image', src: pickRandom(vehicleImages), category: 'Vehicle' });
      items.push({ type: 'image', src: pickRandom(animalImages), category: 'Animal' });
      items.push({ type: 'image', src: pickRandom(instrumentImages), category: 'Instrument' });
      items.push({ type: 'image', src: pickRandom(professionImages), category: 'Profession' });
    }
    return items;
  }

  function startCatTimer() {
    if (catTimerRef.current) clearInterval(catTimerRef.current);
    catTimerRef.current = setInterval(() => {
      setCatTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(catTimerRef.current);
          endCatLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (showCategorization) {
      window.addEventListener('keydown', handleCatKeyPress);
    }
    return () => {
      window.removeEventListener('keydown', handleCatKeyPress);
      if (catTimerRef.current) clearInterval(catTimerRef.current);
    };
  }, [showCategorization, catIndex, catItems, catGameActive]);

  function handleCatKeyPress(e) {
    if (!catGameActive) return;
    const key = e.key.toLowerCase();
    if (key === 'e' || key === 'i') {
      checkCatAnswer(key);
    }
  }

  function checkCatAnswer(key) {
    if (!catItems[catIndex]) return;
    const correctCat = catItems[catIndex].category;
    const chosenArr = key === 'e' ? catSelectedCategories[0] : catSelectedCategories[1];
    let score = 0;
  
    // If the categorization is correct, add points
    if (chosenArr.includes(correctCat)) {
        setCatFeedback('Correct!');
        score = 2; // Points for correct answers
        updateScore(2, `Categorized ${correctCat} correctly`);
    } else {
        setCatFeedback('Wrong!');
        score = -2; // Penalty for incorrect answers
        updateScore(-2, `Incorrect: belongs to ${correctCat}`);
    }

    // Add points to taskScores for this level categorization
    setTaskScores(prevScores => ({
        ...prevScores,
        [`Categorization Level ${catLevel}`]: (prevScores[`Categorization Level ${catLevel}`] || 0) + score
    }));

    setTimeout(() => {
        setCatFeedback('');
        setCatIndex((prev) => {
            const next = prev + 1;
            if (next >= catItems.length) {
                endCatLevel(); // Finish the level when all items are checked
            }
            return next;
        });
    }, 600);
}

  
  function endCatLevel() {
    setCatGameActive(false);
    window.removeEventListener('keydown', handleCatKeyPress);
    if (catTimerRef.current) clearInterval(catTimerRef.current);
  
    // Store final score for the categorization level
    const finalScore = taskScores[`Categorization Level ${catLevel}`] || 0;
    addTaskScore(`Categorization Level ${catLevel}`, finalScore); // Store the level's score
  
    if (catLevel < 3) {
      alert(`Level ${catLevel} complete! Going to Level ${catLevel + 1}.`);
      setCatLevel((prev) => prev + 1);
      startCategorizationGame();
    } else {
      setShowCategorization(false);
      setShowMemoryRecallEnd(true);
    }
  }
  
  
  function handleCloseDistraction(id, userInput) {
    const typed = (userInput || '').trim().toLowerCase();
    // No points are added for distractions anymore
    setDistractions((prev) => prev.filter((d) => d.id !== id));
  }  

  // ------------------------------------------------------------------
  // 10) Memory Recall
  // ------------------------------------------------------------------
  function handleMemoryRecallSubmit() {
    const typed = recallInput.trim().split(' ');
    let correctCount = 0;
    memorizedWords.forEach((w) => {
      if (typed.includes(w)) correctCount++;
    });
    if (correctCount >= memorizedWords.length / 2) {
      updateScore(2, `Memory recall success! Recalled ${correctCount}/${memorizedWords.length}`);
      addTaskScore('Memory Recall', 2);
    } else {
      updateScore(-2, `Memory recall fail. Only ${correctCount}/${memorizedWords.length}`);
      addTaskScore('Memory Recall', -2);
    }
    setShowMemoryRecallEnd(false);
    setShowFinalScore(true);
  }

  // ------------------------------------------------------------------
  // 11) Final Score
  // ------------------------------------------------------------------
  async function finalizeGame() {
    try {
        const emotionSummary = getEmotionSummary();
        const gameScore = score; // Ensure score includes all task points
        const taskBreakdown = taskScores; // taskScores now includes categorization and other tasks

        const payload = {
            user: localStorage.getItem("currentUser") || "anonymous",
            savedAt: new Date(),
            gameScore, // Include game score (total score including categorization)
            taskBreakdown, // Include task breakdown with scores for each task
            emotion: emotionSummary || null, // Emotion data if available
        };

        // Save to Firestore
        await addDoc(collection(db, "sessionSummaries"), payload);

        console.log("Session data saved to Firebase");
        clearEmotionLogs();
        setIsEmotionRunning(false); // Stop emotion logging if needed
        alert("Game session saved!");
    } catch (err) {
        console.error("Error saving session:", err);
        alert("Failed to save session data.");
    }
}

  // ------------------------------------------------------------------
  // Distraction Event Listener for Game Page (Custom Effects)
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleDistraction = (e) => {
      const type = e.detail;
      console.log("Distraction received in GamePage:", type);
      if (type === 'HEAVY METAL_START') {
        const audio = document.getElementById('heavyMetalAudio');
        if (audio && audio.paused) {
          audio.play().catch(err => console.warn('Heavy metal audio failed to play:', err));
        }
      } else if (type === 'HEAVY METAL_STOP') {
        const audio = document.getElementById('heavyMetalAudio');
        if (audio && !audio.paused) {
          audio.pause();
        }
      } else if (type === 'CROWD_TALKING_START') {
        const audio = document.getElementById('crowdTalkingAudio');
        if (audio && audio.paused) {
          audio.play().catch(err => console.warn('Crowd talking audio failed to play:', err));
        }
      } else if (type === 'CROWD_TALKING_STOP') {
        const audio = document.getElementById('crowdTalkingAudio');
        if (audio && !audio.paused) {
          audio.pause();
        }
      } else if (type === 'CLASSIC_START') {
        const audio = document.getElementById('classicAudio');
        if (audio && audio.paused) {
          audio.play().catch(err => console.warn('Classic audio failed to play:', err));
        }
      } else if (type === 'CLASSIC_STOP') {
        const audio = document.getElementById('classicAudio');
        if (audio && !audio.paused) {
          audio.pause();
        }
      } else if (type === 'FLASH') {
        document.body.classList.add('flash-effect');
        setTimeout(() => {
          document.body.classList.remove('flash-effect');
        }, 500);
      } else if (type === 'SHAKE') {
        document.body.classList.add('shake-effect');
        setTimeout(() => {
          document.body.classList.remove('shake-effect');
        }, 1000);
      } else if (type === 'ROTATE') {
        document.body.classList.add('rotate-effect');
        setTimeout(() => {
          document.body.classList.remove('rotate-effect');
        }, 1000);
      }
    };

    window.addEventListener('distraction', handleDistraction);
    return () => {
      window.removeEventListener('distraction', handleDistraction);
    };
  }, []);

  // ------------------------------------------------------------------
  // NEW: BroadcastChannel Listener to receive distractions from other pages
  // ------------------------------------------------------------------
  useEffect(() => {
    const bc = new BroadcastChannel('distraction_channel');
    bc.onmessage = (event) => {
      const { type } = event.data;
      window.dispatchEvent(new CustomEvent('distraction', { detail: type }));
    };
    return () => {
      bc.close();
    };
  }, []);

  // NEW: Firebase Listener for distraction syncing across devices
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
          console.log("🎯 Received distraction via Firestore:", type);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // Chart Initialization (if canvas exists)
  // ------------------------------------------------------------------
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
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

  useEffect(() => {
    if (!chartRef.current) return;
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
      data: { labels: [], datasets },
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

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <>
      <style jsx global>{`
        .flash-effect {
          animation: flash 1s ease-in-out;
        }
        @keyframes flash {
          0% { filter: brightness(1); }
          50% { filter: brightness(8); }
          100% { filter: brightness(1); }
        }

        .shake-effect {
          animation: shake 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          10% { transform: translateX(-30px); }
          20% { transform: translateX(30px); }
          30% { transform: translateX(-30px); }
          40% { transform: translateX(30px); }
          50% { transform: translateX(-30px); }
          60% { transform: translateX(30px); }
          70% { transform: translateX(-30px); }
          80% { transform: translateX(30px); }
          90% { transform: translateX(-30px); }
          100% { transform: translateX(0); }
        }

        .invert-colors {
          filter: invert(1);
        }

        .rotate-effect {
          animation: rotate 1s ease-in-out;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white p-4">
        {/* Audio elements for distractions */}
        <audio id="heavyMetalAudio" src="/distractions/heavy-metal.mp3" preload="auto" loop />
        <audio id="crowdTalkingAudio" src="/distractions/crowd-talking.mp3" preload="auto" loop />
        <audio id="classicAudio" src="/distractions/classic.mp3" preload="auto" loop />

        {/* Distractions: Overlay Modals */}
        {distractions.map((d) => (
          <DistractionModal key={d.id} id={d.id} message={d.message} onClose={handleCloseDistraction} />
        ))}

        <div> {/* Outer container */}
          {isEmotionRunning && (
            <div style={{ position: "fixed" }}>
              {/* For emotion recognition */}
              <EmotionDetector />
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Header / Score */}
          <div className="flex justify-between items-center mb-6 p-4 bg-white/5 rounded shadow">
            <h1 className="text-3xl font-bold tracking-wide">Cognisense Game</h1>
            <div className="text-right">
              <p className="text-sm text-gray-300">Score</p>
              <p className="text-2xl font-bold text-blue-300">{score}</p>
            </div>
          </div>

          {/* Intro */}
          {showIntro && (
            <section className="bg-white/10 p-6 rounded mb-4 text-center space-y-4">
              <h2 className="text-2xl font-bold">Moving to Level 2</h2>
              <p>Click below to begin the second part of the assessment.</p>
              <button
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold transition"
                onClick={handleStartGame}
              >
                Begin Assessment
              </button>
            </section>
          )}

          {/* Game Container */}
          <div className="bg-white/5 p-6 rounded shadow relative">
            {/* Word Memorization */}
            {showWordMem && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Word Memorization</h2>
                <p className="text-gray-200">Memorize these words:</p>
                {!memWordsHidden ? (
                  <p className="text-yellow-300 text-xl">
                    {memorizedWords.join(', ')}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xl">(Words hidden — auto-skipping to Math soon...)</p>
                )}
              </div>
            )}

            {/* Math Problems */}
            {showMath && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Math Problems</h2>
                <p className="text-xl text-gray-200">{mathProblem}</p>
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    className="p-2 bg-gray-700 rounded text-white w-32 text-center"
                    placeholder="?"
                  />
                  <button
                    onClick={handleMathSubmit}
                    className="ml-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Reaction Time 2 */}
            {showReaction2 && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Reaction Time (2)</h2>
                <p className="text-gray-200">
                  Press <strong>Spacebar</strong> when the circle turns green!
                </p>
                <div
                  className="mx-auto w-[150px] h-[150px] mt-4 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: reaction2Color,
                    boxShadow:
                      reaction2Color === 'red'
                        ? '0 0 20px rgba(255, 0, 0, 0.7)'
                        : '0 0 20px rgba(0, 255, 0, 0.7)',
                  }}
                />
              </div>
            )}

            {/* Categorization Intro */}
            {showCategorizationIntro && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Categorization Game</h2>
                <p className="text-gray-200">
                  Sort words/images into correct categories quickly.
                </p>
                <ul className="list-disc list-inside inline-block text-left text-gray-300">
                  <li><strong>E</strong> = Left Category</li>
                  <li><strong>I</strong> = Right Category</li>
                </ul>
                <button
                  onClick={handleStartCategorization}
                  className="ml-4 mt -8 px-5 py-2 bg-green-600 hover:bg-green-700 rounded text-lg font-semibold transition"
                >
                  Start Categorization
                </button>
              </div>
            )}

            {/* Categorization */}
            {showCategorization && catIndex < catItems.length && (
              <div className="mt-4 flex flex-col items-center space-y-6">
                <header className="flex justify-between items-center bg-black/20 p-3 rounded w-full max-w-2xl">
                  <h2 className="font-bold text-lg">Level {catLevel}</h2>
                  <div className="text-red-400 text-3xl font-mono">{catTimeLeft}</div>
                </header>

                <main className="flex flex-col items-center justify-center space-y-4 w-full max-w-2xl">
                  <div className="bg-white/10 p-8 rounded-xl shadow-lg w-full max-w-lg transition-all ease-in-out duration-300">
                    {catItems[catIndex].type === 'word' ? (
                      <p className="text-4xl font-bold text-yellow-300">
                        {catItems[catIndex].text}
                      </p>
                    ) : (
                      <img
                        src={catItems[catIndex].src}
                        alt="Item"
                        className="mx-auto max-w-sm border-2 border-yellow-300 rounded shadow"
                      />
                    )}
                  </div>

                  <p className="text-xl">
                    {catFeedback && (
                      <span
                        className={
                          catFeedback === 'Wrong!'
                            ? 'text-red-500'
                            : 'text-green-500'
                        }
                      >
                        {catFeedback}
                      </span>
                    )}
                  </p>

                  <div className="flex space-x-8">
                    <div className="bg-white/10 p-4 rounded text-center">
                      <strong className="block text-white text-sm">
                        {catSelectedCategories[0].join(' & ')}
                      </strong>
                      <p className="text-gray-300">Press "E"</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded text-center">
                      <strong className="block text-white text-sm">
                        {catSelectedCategories[1].join(' & ')}
                      </strong>
                      <p className="text-gray-300">Press "I"</p>
                    </div>
                  </div>
                </main>

                <p className="text-sm text-gray-400">
                  Item {catIndex + 1} of {catItems.length}
                </p>
              </div>
            )}

            {/* Memory Recall */}
            {showMemoryRecallEnd && (
              <div className="mt-4 text-center space-y-4">
                <h2 className="text-2xl font-bold">Memory Recall</h2>
                <p className="text-gray-200">
                  Type the words you memorized (space-separated):
                </p>
                <input
                  type="text"
                  value={recallInput}
                  onChange={(e) => setRecallInput(e.target.value)}
                  className="w-full max-w-lg mx-auto p-2 bg-gray-700 rounded text-white"
                  placeholder="apple banana car..."
                />
                <button
                  onClick={handleMemoryRecallSubmit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold transition"
                >
                  Submit
                </button>
              </div>
            )}

           {/* Final Score */}
{showFinalScore && (
  <div className="mt-4 text-center space-y-4">
    <h2 className="text-2xl font-bold">Game Over!</h2>
    <p className="text-lg">Your final score is {score}.</p>

    {/* Button to toggle the Score Breakdown */}
    <button
      onClick={toggleScoreBreakdown}
      className="px-5 py-2 bg-blue-600 mr-4 hover:bg-gray-700 rounded text-lg font-semibold transition"
    >
      {showScoreBreakdown ? 'Hide Score Breakdown' : 'View Score Breakdown'}
    </button>

    {/* Conditionally render the Score Breakdown */}
    {showScoreBreakdown && (
      <div className="bg-white/10 p-4 rounded inline-block text-left mt-4">
        <h3 className="font-semibold">Score Breakdown</h3>
        <ul className="list-disc list-inside ml-4">
          {Object.entries(taskScores).map(([k, v]) => (
            <li key={k}>
              <strong>{k}: </strong> {v} points
            </li>
          ))}
        </ul>
        <h3 className="font-semibold mt-2">Feedback</h3>
        <ol className="list-decimal list-inside ml-4">
          {feedback.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ol>
      </div>
    )}
                    <button
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded ml-4 text-lg font-semibold transition"
                  onClick={finalizeGame}
                >
                  Save Score
                </button>
                <button
                  className="ml-4 px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded text-lg font-semibold transition"
                  onClick={() => window.location.reload()}
                >
                  Restart
                </button>
                {/* Carine This button will take you to nasatlx */}
                <button className="ml-4 px-5 py-2 bg-blue-600 hover:bg-gray-700 rounded text-lg font-semibold transition"
                        onClick={() => router.push('/nasatlx')} > Next: NASA TLX Survey →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/** Distraction pop-up modal */
function DistractionModal({ id, message, onClose }) {
  const [inputVal, setInputVal] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative bg-gray-800 p-4 rounded shadow-md max-w-sm w-full">
        <p className="mb-2 text-gray-200">{message}</p>
        <input
          type="text"
          className="w-full p-2 bg-gray-700 rounded mb-2 text-white"
          placeholder="Type something..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onClose(id, inputVal)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Submit
          </button>
          <button
            onClick={() => onClose(id, '')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
