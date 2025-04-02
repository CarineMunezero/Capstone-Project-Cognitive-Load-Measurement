'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';

export default function GamePage() {
  // ------------------------------------------------------------------
  // 1) Global States
  // ------------------------------------------------------------------
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [taskScores, setTaskScores] = useState({});

  const [showIntro, setShowIntro] = useState(true);
  const [showWordMem, setShowWordMem] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showReaction2, setShowReaction2] = useState(false);
  const [showCategorizationIntro, setShowCategorizationIntro] = useState(false);
  const [showCategorization, setShowCategorization] = useState(false);
  const [showMemoryRecallEnd, setShowMemoryRecallEnd] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);

  // Distractions (pop-up modals already in your code)
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

  // ------------------------------------------------------------------
  // 2) Utility
  // ------------------------------------------------------------------
  function updateScore(points, msg) {
    setScore((prev) => prev + points);
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
    setTaskScores((prev) => ({ ...prev, [taskName]: value }));
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
    if (typed) {
      updateScore(2, `Responded: "${typed}" to distraction`);
    } else {
      updateScore(-2, 'Closed distraction w/o responding');
    }
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
      audio.loop = true;  // so it repeats automatically
      audio.play().then(() => {
        audio.pause();
        audio.muted = false;  // unmute for future plays
      }).catch(err => console.warn('Audio unlock failed:', err));
    }
    setShowIntro(false);
    resetGameData();
    setShowWordMem(true);
    startWordMemorization();
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
      'apple','banana','car','dog','elephant','flower',
      'guitar','house','island','jacket','kangaroo','lemon',
      'mountain','notebook','ocean','piano','queen','rainbow',
      'sunflower','tiger','doctor','bus','keyboard','book','rocket'
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
      updateScore(10, `Correct math: ${mathProblem}`);
      setMathScore((prev) => prev + 10);
    } else {
      updateScore(-5, `Wrong math: ${mathProblem}, typed ${mathAnswer}`);
      setMathScore((prev) => prev - 5);
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
        updateScore(10, `Excellent Reaction2: ${rTime}ms`);
        addTaskScore('Reaction Time Task 2', 10);
      } else {
        updateScore(0, `Slow Reaction2: ${rTime}ms`);
        addTaskScore('Reaction Time Task 2', 0);
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
  function randomizeUrl(url) {
    return url + `?rand=${Math.random()}`;
  }

  const fruitImages = [
    randomizeUrl('https://images.unsplash.com/photo-1576402187877-48ec36e5d1e5'),
    randomizeUrl('https://images.unsplash.com/photo-1602749903241-5a5f22348e8b'),
    randomizeUrl('https://images.unsplash.com/photo-1543352634-4a1456df67b3'),
    randomizeUrl('https://images.unsplash.com/photo-1531884070646-7fb7be5b762e'),
    randomizeUrl('https://images.unsplash.com/photo-1616594382904-4284e0fb4fa6'),
    randomizeUrl('https://images.unsplash.com/photo-1612437308597-f1a166b01eab')
  ];

  const vehicleImages = [
    randomizeUrl('https://images.unsplash.com/photo-1543269664-76bc3997d9ea'),
    randomizeUrl('https://images.unsplash.com/photo-1476119468713-3931a21deae1'),
    randomizeUrl('https://images.unsplash.com/photo-1512820790803-83ca734da794'),
    randomizeUrl('https://images.unsplash.com/photo-1537041373298-55c90931a0f4'),
    randomizeUrl('https://images.unsplash.com/photo-1558981405-c6f3aed0c686'),
    randomizeUrl('https://images.unsplash.com/photo-1496055199863-9f4fd1711ee8')
  ];

  const animalImages = [
    randomizeUrl('https://images.unsplash.com/photo-1600688577678-1c9bc83856b7'),
    randomizeUrl('https://images.unsplash.com/photo-1542345812-8e2bb99b1213'),
    randomizeUrl('https://images.unsplash.com/photo-1486940218708-1a1f241ced1c'),
    randomizeUrl('https://images.unsplash.com/photo-1568731134213-06dbaf6e42f4'),
    randomizeUrl('https://images.unsplash.com/photo-1547758984-5ec1a1ecd130'),
    randomizeUrl('https://images.unsplash.com/photo-1595433707802-a55f8d396937')
  ];

  const instrumentImages = [
    randomizeUrl('https://images.unsplash.com/photo-1598188300973-5acb63fce2b2'),
    randomizeUrl('https://images.unsplash.com/photo-1588342811119-08f61cd994a2'),
    randomizeUrl('https://images.unsplash.com/photo-1623364190520-8f6f753ad9bf'),
    randomizeUrl('https://images.unsplash.com/photo-1475691187955-d6f114daa3d5'),
    randomizeUrl('https://images.unsplash.com/photo-1511379938547-c1f69419868d'),
    randomizeUrl('https://images.unsplash.com/photo-1578589316737-884ad8e3f2eb')
  ];

  const professionImages = [
    randomizeUrl('https://images.unsplash.com/photo-1584516156378-984f35b17d1f'),
    randomizeUrl('https://images.unsplash.com/photo-1591899648332-119d17f2a9b8'),
    randomizeUrl('https://images.unsplash.com/photo-1527613426441-4da17471b66d'),
    randomizeUrl('https://images.unsplash.com/photo-1519452575417-564c1401ecc0'),
    randomizeUrl('https://images.unsplash.com/photo-1573497019544-2b24c1d56b79'),
    randomizeUrl('https://images.unsplash.com/photo-1580281658627-b3b2b2a1d18e')
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
      selected = [['Instrument','Profession'], ['Animal','Fruit']];
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

    if (chosenArr.includes(correctCat)) {
      setCatFeedback('Correct!');
      updateScore(2, `Categorized ${correctCat} correctly`);
    } else {
      setCatFeedback('Wrong!');
      updateScore(-1, `Incorrect: belongs to ${correctCat}`);
    }

    setTimeout(() => {
      setCatFeedback('');
      setCatIndex((prev) => {
        const next = prev + 1;
        if (next >= catItems.length) {
          endCatLevel();
        }
        return next;
      });
    }, 600);
  }

  function endCatLevel() {
    setCatGameActive(false);
    window.removeEventListener('keydown', handleCatKeyPress);
    if (catTimerRef.current) clearInterval(catTimerRef.current);

    if (catLevel < 3) {
      alert(`Level ${catLevel} complete! Going to Level ${catLevel + 1}.`);
      setCatLevel((prev) => prev + 1);
      startCategorizationGame();
    } else {
      setShowCategorization(false);
      setShowMemoryRecallEnd(true);
    }
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
      updateScore(10, `Memory recall success! Recalled ${correctCount}/${memorizedWords.length}`);
      addTaskScore('Memory Recall', 10);
    } else {
      updateScore(-5, `Memory recall fail. Only ${correctCount}/${memorizedWords.length}`);
      addTaskScore('Memory Recall', -5);
    }
    setShowMemoryRecallEnd(false);
    setShowFinalScore(true);
  }

  // ------------------------------------------------------------------
  // 11) Final Score
  // ------------------------------------------------------------------
  function finalizeGame() {
    alert('Score saved. [Implement Firestore if needed]');
  }

  // ------------------------------------------------------------------
  // Distraction Event Listener for Game Page (Polling Backend)
  // ------------------------------------------------------------------
  // useEffect(() => {
  //   const audio = document.getElementById('heavyMetalAudio');
  //   if (audio) {
  //     audio.play().catch(err => console.warn('Heavy metal audio failed to play:', err));
  //   }
  // }, []);
  
  

  // ------------------------------------------------------------------
  // Distraction Event Listener for Game Page (Custom Effects)
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleDistraction = (e) => {
      const type = e.detail;
      console.log("Distraction received in GamePage:", type);
      if (e.detail === 'HEAVY METAL') {
        const audio = document.getElementById('heavyMetalAudio');
        if (audio) {
          audio.play().catch(err => console.warn('Heavy metal audio failed to play:', err));
        }
      } else if (type === 'CLASSIC') {
        const audio = document.getElementById('classicAudio');
        if (audio) {
          audio.play().catch(err => console.warn('Classic audio failed to play:', err));
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
      } else if (type === 'INVERT_COLORS') {
        document.body.classList.add('invert-colors');
        setTimeout(() => {
          document.body.classList.remove('invert-colors');
        }, 3000);
      }
    };

    window.addEventListener('distraction', handleDistraction);
    return () => {
      window.removeEventListener('distraction', handleDistraction);
    };
  }, []);

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <>
      <style jsx global>{`
        .flash-effect {
          animation: flash 0.5s ease-in-out;
        }
        @keyframes flash {
          0% { background: white; }
          100% { background: transparent; }
        }
        .shake-effect {
          animation: shake 0.7s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .invert-colors {
          filter: invert(1);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white p-4">
              {/* Audio elements for distractions */}
      <audio 
      id="heavyMetalAudio" 
      src="/distractions/heavy-metal.mp3" 
      preload="auto" 
      loop 
    />  

        {/* Distractions: Overlay Modals */}
        {distractions.map((d) => (
          <DistractionModal
            key={d.id}
            id={d.id}
            message={d.message}
            onClose={handleCloseDistraction}
          />
        ))}

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
                Start Cognisense Game
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
                  <p className="text-gray-400 text-xl">
                    (Words hidden — auto-skipping to Math soon...)
                  </p>
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
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded text-lg font-semibold transition"
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
                <div className="bg-white/10 p-4 rounded inline-block text-left">
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
                <button
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded text-lg font-semibold transition"
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
