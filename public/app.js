/*****************************************
 * 6) GAME CODE (PAGE 8)
 *****************************************/
// Global variables
let score = 0;
let feedback = [];
let memorizedWords = [];
let taskScores = {};
let selectedCategories = [];
let gameItems = [];
let currentItemIndex = 0;
let gameActive = false;
let timer;
let timeLimit = 60;
let timeLeft;
let level = 1;

// DOM references and initial event listeners
window.addEventListener("DOMContentLoaded", () => {
  // Start Game button on the final page
  const startBtn = document.getElementById('start-button');
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("intro-section").classList.add("hidden");
      resetGame();
      startWordMemorization();
    });
  }
  // Restart Game button
  const restartBtn = document.getElementById('restart-button');
  if (restartBtn) {
    restartBtn.addEventListener("click", function() {
      document.getElementById("final-score").classList.add("hidden");
      document.getElementById("intro-section").classList.remove("hidden");
    });
  }
});

// Resets game data and UI elements
function resetGame() {
  score = 0;
  feedback = [];
  memorizedWords = [];
  taskScores = {};
  level = 1;
  document.getElementById("score-display").innerText = "Score: 0";

  if (document.getElementById("reaction-time-display-1"))
    document.getElementById("reaction-time-display-1").innerText = 'Reaction Time: -- ms';
  if (document.getElementById("reaction-time-display-2"))
    document.getElementById("reaction-time-display-2").innerText = 'Reaction Time: -- ms';
}

// WORD MEMORIZATION TASK
function startWordMemorization() {
  const wordMemorizationSection = document.getElementById('word-memorization');
  wordMemorizationSection.classList.remove("hidden");
  let wordCount = 5;
  let words = [
    "apple", "banana", "car", "dog", "elephant", "flower", "guitar", "house", "island", "jacket",
    "kangaroo", "lemon", "mountain", "notebook", "ocean", "piano", "queen", "rainbow", "sunflower", "tiger"
  ];
  memorizedWords = [];
  for (let i = 0; i < wordCount; i++) {
    let word = words.splice(Math.floor(Math.random() * words.length), 1)[0];
    memorizedWords.push(word);
  }
  document.getElementById("word-list").innerText = memorizedWords.join(', ');

  // Clear the words after a delay and show the continue button
  setTimeout(() => {
    document.getElementById("word-list").innerText = '';
    document.getElementById("word-continue-button").classList.remove("hidden");
  }, wordCount * 1000);

  document.getElementById("word-continue-button").onclick = function() {
    wordMemorizationSection.classList.add("hidden");
    startReactionTimeTask1();
  };
}

// REACTION TIME TASK 1
function startReactionTimeTask1() {
  const reactionTimeTask1 = document.getElementById('reaction-time-task-1');
  reactionTimeTask1.classList.remove("hidden");
  const reactionButton = document.getElementById("reaction-button-1");
  let startTime;
  let maxWaitTime = 2000;

  setTimeout(() => {
    reactionButton.disabled = false;
    reactionButton.innerText = "Click me!";
    startTime = new Date().getTime();
  }, Math.floor(Math.random() * maxWaitTime) + 500);

  reactionButton.onclick = () => {
    const endTime = new Date().getTime();
    const reactionTime = endTime - startTime;
    document.getElementById("reaction-time-display-1").innerText = `Reaction Time: ${reactionTime} ms`;
    let threshold = 500;
    if (reactionTime < threshold) {
      updateScore(10, `Excellent reaction time! (${reactionTime} ms)`);
      taskScores['Reaction Time Task 1'] = 10;
    } else {
      updateScore(0, `Reaction time could be faster. (${reactionTime} ms)`);
      taskScores['Reaction Time Task 1'] = 0;
    }
    reactionButton.disabled = true;
    reactionTimeTask1.classList.add("hidden");
    startMathProblemTask();
  };
}

// MATH PROBLEMS TASK
function startMathProblemTask() {
  const mathProblemTask = document.getElementById('math-problem-task');
  mathProblemTask.classList.remove("hidden");
  let problemCount = 0;
  let maxProblems = 3;
  let totalMathScore = 0;

  generateMathProblem();
  document.getElementById("math-submit-button").onclick = function() {
    checkMathAnswer();
  };

  function generateMathProblem() {
    if (problemCount >= maxProblems) {
      mathProblemTask.classList.add("hidden");
      taskScores['Math Problems'] = totalMathScore;
      startReactionTimeTask2();
      return;
    }
    problemCount++;
    let problem = createMathProblem();
    document.getElementById("math-problem").innerText = `Problem ${problemCount}: ${problem.question}`;
    document.getElementById("math-answer").value = "";
    document.getElementById("math-answer").focus();
  }

  function createMathProblem() {
    let num1 = Math.floor(Math.random() * 20) + 1;
    let num2 = Math.floor(Math.random() * 15) + 1;
    let ops = ['+', '-', '*'];
    let operator = ops[Math.floor(Math.random() * 3)];
    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer: eval(`${num1} ${operator} ${num2}`)
    };
  }

  function checkMathAnswer() {
    let answer = document.getElementById("math-answer").value.trim();
    let questionText = document.getElementById("math-problem").innerText.split(':')[1];
    let correctAnswer = eval(questionText.replace('= ?', ''));
    if (parseInt(answer) === Math.round(correctAnswer)) {
      updateScore(10, "Correct math answer!");
      totalMathScore += 10;
    } else {
      updateScore(-5, "Incorrect math answer.");
      totalMathScore -= 5;
    }
    generateMathProblem();
  }
}

// REACTION TIME TASK 2
function startReactionTimeTask2() {
  const reactionTimeTask2 = document.getElementById('reaction-time-task-2');
  reactionTimeTask2.classList.remove("hidden");
  const circle = document.getElementById("reaction-circle");
  circle.style.backgroundColor = 'red';
  circle.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
  let startTime;
  let maxWaitTime = 2000;

  setTimeout(() => {
    circle.style.backgroundColor = 'green';
    circle.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.7)';
    startTime = new Date().getTime();
  }, Math.floor(Math.random() * maxWaitTime) + 500);

  function keyListener(event) {
    if (event.code === 'Space' && circle.style.backgroundColor === 'green') {
      const endTime = new Date().getTime();
      const reactionTime = endTime - startTime;
      document.getElementById("reaction-time-display-2").innerText = `Reaction Time: ${reactionTime} ms`;
      let threshold = 500;
      if (reactionTime < threshold) {
        updateScore(10, `Excellent reaction time! (${reactionTime} ms)`);
        taskScores['Reaction Time Task 2'] = 10;
      } else {
        updateScore(0, `Reaction time could be faster. (${reactionTime} ms)`);
        taskScores['Reaction Time Task 2'] = 0;
      }
      document.removeEventListener('keydown', keyListener);
      reactionTimeTask2.classList.add("hidden");
      startCategorizationIntro();
    }
  }
  document.addEventListener('keydown', keyListener);
}

// CATEGORIZATION GAME INTRODUCTION
function startCategorizationIntro() {
  const categorizationGameIntro = document.getElementById('categorization-game');
  categorizationGameIntro.classList.remove("hidden");

  document.getElementById("startCategorizationBtn").onclick = function() {
    categorizationGameIntro.classList.add("hidden");
    startCategorizationGame();
  };
}

// CATEGORIZATION GAME LOGIC
function startCategorizationGame() {
  const gameContainer = document.getElementById('categorization-container');
  if (!gameContainer) return;
  gameContainer.classList.remove('hidden');
  document.getElementById('level-number').textContent = level;
  setupLevel(level);
  gameActive = true;
  timeLeft = timeLimit;
  document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
  startTimer();
  displayItem();
  document.addEventListener('keydown', handleKeyPress);
}

// Setup level-specific items and instructions
function setupLevel(level) {
  let allItems = [
    { type: 'word', text: 'Apple', category: 'Fruit' },
    { type: 'word', text: 'Banana', category: 'Fruit' },
    { type: 'word', text: 'Orange', category: 'Fruit' },
    { type: 'word', text: 'Grapes', category: 'Fruit' },
    { type: 'word', text: 'Car', category: 'Vehicle' },
    { type: 'word', text: 'Bike', category: 'Vehicle' },
    { type: 'word', text: 'Bus', category: 'Vehicle' },
    { type: 'word', text: 'Truck', category: 'Vehicle' },
    { type: 'image', src: 'fruits.jpeg', category: 'Fruit' },
    { type: 'image', src: 'vehicle.jpeg', category: 'Vehicle' },
    { type: 'image', src: 'vehicle2.jpeg', category: 'Vehicle' },
    { type: 'image', src: 'fruits2.jpeg', category: 'Fruit' },
    { type: 'word', text: 'Dog', category: 'Animal' },
    { type: 'word', text: 'Cat', category: 'Animal' },
    { type: 'word', text: 'Lion', category: 'Animal' },
    { type: 'word', text: 'Elephant', category: 'Animal' },
    { type: 'word', text: 'Monkey', category: 'Animal' },
    { type: 'word', text: 'Zebra', category: 'Animal' },
    { type: 'word', text: 'Guitar', category: 'Instrument' },
    { type: 'word', text: 'Piano', category: 'Instrument' },
    { type: 'word', text: 'Violin', category: 'Instrument' },
    { type: 'word', text: 'Flute', category: 'Instrument' },
    { type: 'word', text: 'Saxophone', category: 'Instrument' },
    { type: 'word', text: 'Harp', category: 'Instrument' },
    { type: 'image', src: 'animal.webp', category: 'Animal' },
    { type: 'image', src: 'animal2.webp', category: 'Animal' },
    { type: 'image', src: 'animal3.jpeg', category: 'Animal' },
    { type: 'image', src: 'instrument.jpg', category: 'Instrument' },
    { type: 'image', src: 'instrument2.jpg', category: 'Instrument' },
    { type: 'image', src: 'instrument3.jpg', category: 'Instrument' },
    { type: 'word', text: 'Doctor', category: 'Profession' },
    { type: 'word', text: 'Engineer', category: 'Profession' },
    { type: 'word', text: 'Teacher', category: 'Profession' },
    { type: 'word', text: 'Nurse', category: 'Profession' },
    { type: 'word', text: 'Lawyer', category: 'Profession' },
    { type: 'word', text: 'Chef', category: 'Profession' },
    { type: 'image', src: 'profession.jpg', category: 'Profession' },
    { type: 'image', src: 'profession2.jpeg', category: 'Profession' },
    { type: 'word', text: 'Hammer', category: 'Tool' },
    { type: 'word', text: 'Wrench', category: 'Tool' },
    { type: 'word', text: 'Screwdriver', category: 'Tool' },
    { type: 'word', text: 'Pliers', category: 'Tool' },
    { type: 'image', src: 'tool.jpg', category: 'Tool' }
  ];

  let levelInstructions = {
    1: 'Level 1: Categorize items into Fruit (E) and Vehicle (I).',
    2: 'Level 2: Categorize items into Animal (E) and Instrument (I).',
    3: 'Level 3: E = Instrument & Profession, I = Animal & Fruit.'
  };
  document.getElementById('level-instructions').textContent = levelInstructions[level];

  if (level === 1) {
    selectedCategories = [['Fruit'], ['Vehicle']];
    gameItems = allItems.filter(item =>
      selectedCategories[0].includes(item.category) ||
      selectedCategories[1].includes(item.category)
    );
  } else if (level === 2) {
    selectedCategories = [['Animal'], ['Instrument']];
    gameItems = allItems.filter(item =>
      selectedCategories[0].includes(item.category) ||
      selectedCategories[1].includes(item.category)
    );
  } else if (level === 3) {
    selectedCategories = [['Instrument', 'Profession'], ['Animal', 'Fruit']];
    let categoriesLevel3 = ['Instrument', 'Profession', 'Animal', 'Fruit'];
    gameItems = allItems.filter(item => categoriesLevel3.includes(item.category));
  }
  document.getElementById('left-category').textContent = selectedCategories[0].join(' & ');
  document.getElementById('right-category').textContent = selectedCategories[1].join(' & ');

  shuffleArray(gameItems);
  currentItemIndex = 0;
}

// Displays the current item (word or image) for categorization
function displayItem() {
  const itemToSort = document.getElementById('itemToSort');
  if (currentItemIndex < gameItems.length) {
    const currentItem = gameItems[currentItemIndex];
    itemToSort.innerHTML = '';
    if (currentItem.type === 'word') {
      let word = document.createElement('p');
      word.textContent = currentItem.text;
      word.style.fontSize = '48px';
      word.style.fontWeight = 'bold';
      word.style.color = '#f0a500';
      itemToSort.appendChild(word);
    } else if (currentItem.type === 'image') {
      let img = document.createElement('img');
      img.src = currentItem.src;
      img.alt = 'Item to Sort';
      img.style.maxWidth = '400px';
      img.style.borderRadius = '10px';
      img.style.border = '2px solid #f0a500';
      itemToSort.appendChild(img);
    }
  } else {
    endCategorizationLevel();
  }
}

// Handle keypresses for categorization (E/I keys)
function handleKeyPress(event) {
  if (!gameActive) return;
  let key = event.key.toLowerCase();
  if (key === 'e' || key === 'i') {
    checkAnswer(key);
  }
}

// Checks the user's answer and updates the score
function checkAnswer(key) {
  let currentItem = gameItems[currentItemIndex];
  let correctCategory = currentItem.category;
  let selectedCategoryArray = (key === 'e') ? selectedCategories[0] : selectedCategories[1];
  const feedbackEl = document.getElementById('feedback');

  if (selectedCategoryArray.includes(correctCategory)) {
    feedbackEl.textContent = 'Correct!';
    feedbackEl.style.color = '#00ff00';
    updateScore(2, `Correctly categorized ${currentItem.text || 'image'} as ${correctCategory}.`);
  } else {
    feedbackEl.textContent = 'Wrong!';
    feedbackEl.style.color = '#ff0000';
    updateScore(-1, `Incorrectly categorized ${currentItem.text || 'image'} (belongs to ${correctCategory}).`);
  }

  currentItemIndex++;
  setTimeout(() => {
    feedbackEl.textContent = '';
    displayItem();
  }, 500);
}

// Starts the timer for the categorization level
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endCategorizationLevel();
    }
  }, 1000);
}

// Ends the categorization level; if more levels remain, restart the game
function endCategorizationLevel() {
  gameActive = false;
  document.removeEventListener('keydown', handleKeyPress);
  clearInterval(timer);

  if (level < 3) {
    level++;
    alert(`Level ${level - 1} Complete! Get ready for Level ${level}.`);
    startCategorizationGame();
  } else {
    // End the game fully
    document.querySelector('.game-container').classList.add('hidden');
    taskScores['Categorization Game'] = score;
    startMemoryRecallAtEnd();
  }
}

// MEMORY RECALL TASK AT THE END
function startMemoryRecallAtEnd() {
  const memoryRecallEnd = document.getElementById('memory-recall-end');
  memoryRecallEnd.classList.remove("hidden");
  document.getElementById("word-answer-end").value = '';
  document.getElementById("word-answer-end").focus();

  document.getElementById("memory-submit-button-end").onclick = function() {
    let wordsAnswer = document.getElementById("word-answer-end").value.trim().split(' ');
    let wordsCorrect = compareWords(memorizedWords, wordsAnswer);
    if (wordsCorrect) {
      updateScore(10, "Correct word recall!");
      taskScores['Memory Recall'] = 10;
    } else {
      updateScore(-5, "Incorrect word recall.");
      taskScores['Memory Recall'] = -5;
    }
    memoryRecallEnd.classList.add("hidden");
    displayFinalScore();
  };
}

// Compares the memorized words with the user's answer
function compareWords(words1, words2) {
  let correctCount = 0;
  for (let word of words1) {
    if (words2.includes(word)) correctCount++;
  }
  // Consider it "correct" if the user gets at least half of the words
  return (correctCount >= words1.length / 2);
}

// Updates the overall score and logs feedback
function updateScore(points, message) {
  score += points;
  feedback.push(message);
  document.getElementById("score-display").innerText = `Score: ${score}`;
}

// Displays the final score and breakdown, then saves the data to Firestore
function displayFinalScore() {
  const finalScoreSection = document.getElementById('final-score');
  finalScoreSection.classList.remove("hidden");

  let breakdownList = '';
  for (let task in taskScores) {
    breakdownList += `<li><strong>${task}:</strong> ${taskScores[task]} points</li>`;
  }

  let feedbackList = '';
  feedback.forEach((item) => {
    feedbackList += `<li>${item}</li>`;
  });

  const finalScoreHTML = `
    <h2>Your final score is ${score}.</h2>
    <h3>Score Breakdown:</h3>
    <ul>${breakdownList}</ul>
    <h3>Feedback:</h3>
    <ol>${feedbackList}</ol>
  `;
  document.getElementById("final-score-display").innerHTML = `<h2>Your final score is ${score}.</h2>`;
  document.getElementById("feedback-display").innerHTML = finalScoreHTML;

  // Save final score to Firestore
  saveScoreToFirestore(score);
}

// Saves the final score to Firestore
async function saveScoreToFirestore(finalScore) {
  try {
    await addDoc(collection(db, "scores"), {
      user: window.loggedInUser || "anonymous",
      score: finalScore,
      timestamp: new Date()
    });
    console.log("Score saved successfully to Firestore.");
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// Utility: Shuffles an array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
