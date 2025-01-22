<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    // Redirect to the registration page or show an error
    header('Location: index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cognitive Challenge Game</title>
    <!-- Import Montserrat font from Google Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600&display=swap" rel="stylesheet">
    <style>
        /* ===============================
           CSS Styles for Cognitive Challenge Game
        ================================ */

        /* Global Styles */
        body {
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #0d1b2a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-image: url('https://source.unsplash.com/1920x1080/?technology,brain');
            background-size: cover;
            background-position: center;
            color: #fff;
            overflow: hidden;
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(13, 27, 42, 0.8);
            z-index: -1;
        }

        #game-container {
            background-color: rgba(13, 27, 42, 0.9);
            border-radius: 15px;
            padding: 40px 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            max-width: 700px;
            width: 90%;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
            position: relative;
            z-index: 1;
        }

        h1, h2 {
            font-weight: 600;
            margin-bottom: 10px;
            color: #f0a500;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        p {
            font-size: 18px;
            line-height: 1.6;
            color: #d3d3d3;
        }

        /* Button Styles */
        button {
            padding: 15px 35px;
            font-size: 18px;
            color: #0d1b2a;
            background-color: #f0a500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease-in-out;
            margin-top: 30px;
            font-weight: 600;
        }

        button:hover {
            background-color: #cf8500;
        }

        /* Input Fields */
        .input-field {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            border: 1px solid #f0a500;
            font-size: 16px;
            margin-top: 8px;
            background-color: #1b263b;
            color: #fff;
            transition: all 0.3s ease-in-out;
        }

        .input-field:focus {
            border-color: #e0e1dd;
            outline: none;
        }

        /* Hidden Class */
        .hidden {
            display: none;
        }

        /* Task Specific Styles */
        .task-container {
            margin-top: 30px;
            text-align: center;
        }

        /* Reaction Button */
        #reaction-button-1 {
            background-color: #4caf50;
            font-size: 1.2em;
            border-radius: 50px;
            padding: 15px 30px;
            margin-top: 20px;
            transition: background-color 0.3s, transform 0.2s;
        }

        #reaction-button-1:disabled {
            background-color: #555;
            cursor: not-allowed;
        }

        #reaction-button-1:hover:not(:disabled) {
            background-color: #43a047;
            transform: translateY(-3px);
        }

        /* Reaction Circle */
        #reaction-circle {
            width: 150px;
            height: 150px;
            background-color: red;
            margin: 20px auto;
            border-radius: 50%;
            transition: background-color 0.3s;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.7);
        }

        /* Categories Styles */
        .categories {
            font-size: 24px;
            margin-bottom: 20px;
            color: #f0a500;
            display: flex;
            justify-content: space-around;
            margin-top: 30px;
        }

        .category-left, .category-right {
            width: 45%;
            text-align: center;
        }

        .category-key {
            font-size: 18px;
            color: #d3d3d3;
            margin-top: 10px;
        }

        /* Feedback Styles */
        #feedback {
            font-size: 20px;
            margin-top: 15px;
        }

        /* Timer Styles */
        #timer {
            font-size: 20px;
            margin-top: 15px;
            color: #f0a500;
        }

        /* Fade-in Animation */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            h1 {
                font-size: 2em;
            }
            button {
                font-size: 0.9em;
                padding: 10px 20px;
            }
            .categories {
                flex-direction: column;
            }
            .category-left, .category-right {
                width: 100%;
            }
        }

        /* Image Styles */
        img {
            margin-top: 20px;
            max-width: 100%;
            border-radius: 10px;
            border: 2px solid #f0a500;
        }

        /* Score Display */
        #score-display {
            font-size: 1.5em;
            position: absolute;
            top: 20px;
            right: 30px;
            color: #ffeb3b;
        }

        /* Feedback Display */
        #feedback-display {
            white-space: pre-wrap;
            text-align: left;
            margin-top: 20px;
            font-size: 1em;
            line-height: 1.5em;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <!-- Overlay for background effect -->
    <div class="overlay"></div>

    <div id="game-container">
        <!-- Score Display -->
        <p id="score-display">Score: 0</p>

        <!-- Intro Section -->
        <div id="intro-section" class="task-container">
    <h2 class="task-header">Tasks to be Completed</h2>
    <div class="task-list">
        <div class="task-item">
            <h3>Word Memorization Game</h3>
            <p>You will be shown a list of words.</p>
        </div>
        <div class="task-item">
            <h3>Reaction Time Test</h3>
            <p>Measure how quickly you can respond to visual or auditory cues.</p>
        </div>
        <div class="task-item">
            <h3>Math Problems</h3>
            <p>Solve a few math problems.</p>
        </div>
        <div class="task-item">
            <h3>Categorization Game</h3>
            <p>Quickly and accurately sort items into the correct categories.</p>
        </div>
    </div>
    <button id="start-button" class="start-btn">Start Game</button>
</div>




        <!-- Word Memorization -->
        <div id="word-memorization" class="hidden">
            <h2>Word Memorization</h2>
            <p>Memorize these words:</p>
            <p id="word-list"></p>
            <button id="word-continue-button" class="hidden">Continue</button>
        </div>

        <!-- Reaction Time Task 1 -->
        <div id="reaction-time-task-1" class="hidden">
            <h2>Reaction Time Task</h2>
            <p>Wait for the button to become clickable, then click it as fast as you can!</p>
            <button id="reaction-button-1" disabled>Wait...</button>
            <p id="reaction-time-display-1">Reaction Time: -- ms</p>
        </div>

        <!-- Math Problems -->
        <div id="math-problem-task" class="hidden">
            <h2>Math Problems</h2>
            <p id="math-problem"></p>
            <input type="number" id="math-answer" class="input-field" placeholder="Answer">
            <button id="math-submit-button">Submit</button>
        </div>

        <!-- Reaction Time Task 2 -->
        <div id="reaction-time-task-2" class="hidden">
            <h2>Reaction Time Task</h2>
            <p>Press the <strong>Spacebar</strong> when the circle turns green!</p>
            <div id="reaction-circle"></div>
            <p id="reaction-time-display-2">Reaction Time: -- ms</p>
        </div>

        <!-- Categorization Game Introduction -->
        <div id="categorization-game" class="hidden">
            <h2>Categorization Game</h2>
            <p>Your objective is to sort words or images into the correct categories as quickly and accurately as possible.</p>
            <ul>
                <li>Press the <strong>"E"</strong> key for items belonging to the left category.</li>
                <li>Press the <strong>"I"</strong> key for items belonging to the right category.</li>
                <li>Try to minimize errors to improve your overall score.</li>
            </ul>
            <button id="startCategorizationBtn">Start Categorization Game</button>
        </div>

        <!-- Game Screen for Categorization -->
        <div class="game-container hidden">
            <h2>Level <span id="level-number"></span></h2>
            <p id="level-instructions"></p>
            <!-- Display the current categories -->
            <div class="categories">
                <div class="category-left">
                    <strong id="left-category"></strong>
                    <p class="category-key">Press "E"</p>
                </div>
                <div class="category-right">
                    <strong id="right-category"></strong>
                    <p class="category-key">Press "I"</p>
                </div>
            </div>
            <!-- Image or word to be sorted -->
            <div id="itemToSort"></div>
            <p id="feedback"></p>
            <!-- Timer display -->
            <p id="timer"></p>
        </div>

        <!-- Memory Recall at the End -->
        <div id="memory-recall-end" class="hidden">
            <h2>Memory Recall</h2>
            <p>Please enter the words you memorized at the beginning (separated by spaces):</p>
            <input type="text" id="word-answer-end" class="input-field" placeholder="Enter words">
            <button id="memory-submit-button-end">Submit</button>
        </div>

        <!-- Final Score Display -->
        <div id="final-score" class="hidden">
            <h2>Game Over!</h2>
            <p id="final-score-display"></p>
            <p id="feedback-display"></p>
            <button id="restart-button">Restart Game</button>
        </div>
    </div>

    <script>
        // ===============================
        // JavaScript Code for Cognitive Challenge Game
        // ===============================

        // Global Variables
        let score = 0;
        let feedback = [];
        let memorizedWords = [];
        let taskScores = {};
        let selectedCategories = [];
        let gameItems = [];
        let currentItemIndex = 0;
        let gameActive = false;
        let timer; // Timer for the categorization game
        let timeLimit = 60; // Time limit in seconds
        let timeLeft;
        let level = 1; // Level in the categorization game

        // DOM Elements
        const startBtn = document.getElementById('start-button');
        const restartBtn = document.getElementById('restart-button');
        const startCategorizationBtn = document.getElementById('startCategorizationBtn');
        const wordMemorizationSection = document.getElementById('word-memorization');
        const reactionTimeTask1 = document.getElementById('reaction-time-task-1');
        const reactionTimeTask2 = document.getElementById('reaction-time-task-2');
        const mathProblemTask = document.getElementById('math-problem-task');
        const categorizationGameIntro = document.getElementById('categorization-game');
        const gameContainer = document.querySelector('.game-container');
        const memoryRecallEnd = document.getElementById('memory-recall-end');
        const finalScoreSection = document.getElementById('final-score');
        const scoreDisplay = document.getElementById('score-display');

        // Start Game
        startBtn.addEventListener("click", function() {
            document.getElementById("intro-section").classList.add("hidden");
            resetGame();
            startWordMemorization();
        });

        // Restart Game
        restartBtn.addEventListener("click", function() {
            finalScoreSection.classList.add("hidden");
            document.getElementById("intro-section").classList.remove("hidden");
        });

        function resetGame() {
            score = 0;
            feedback = [];
            memorizedWords = [];
            taskScores = {};
            scoreDisplay.innerText = `Score: ${score}`;
            document.getElementById("reaction-time-display-1").innerText = 'Reaction Time: -- ms';
            document.getElementById("reaction-time-display-2").innerText = 'Reaction Time: -- ms';
            level = 1;
        }

        // Word Memorization
        function startWordMemorization() {
            wordMemorizationSection.classList.remove("hidden");
            let wordCount = 5; // Fixed word count for simplicity
            let words = ["apple", "banana", "car", "dog", "elephant", "flower", "guitar", "house", "island", "jacket", "kangaroo", "lemon", "mountain", "notebook", "ocean", "piano", "queen", "rainbow", "sunflower", "tiger"];
            memorizedWords = [];
            for (let i = 0; i < wordCount; i++) {
                let word = words.splice(Math.floor(Math.random() * words.length), 1)[0];
                memorizedWords.push(word);
            }
            document.getElementById("word-list").innerText = memorizedWords.join(', ');

            setTimeout(() => {
                document.getElementById("word-list").innerText = '';
                document.getElementById("word-continue-button").classList.remove("hidden");
            }, wordCount * 1000);

            document.getElementById("word-continue-button").onclick = function() {
                wordMemorizationSection.classList.add("hidden");
                startReactionTimeTask1();
            };
        }

        // Task 1: Reaction Time Task 1
        function startReactionTimeTask1() {
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

        // Task 2: Math Problems
        function startMathProblemTask() {
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
                document.getElementById("math-submit-button").disabled = false;
            }

            function createMathProblem() {
                let num1 = Math.floor(Math.random() * 20) + 1;
                let num2 = Math.floor(Math.random() * 15) + 1;
                let operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
                return {
                    question: `${num1} ${operator} ${num2} = ?`,
                    answer: eval(`${num1} ${operator} ${num2}`)
                };
            }

            function checkMathAnswer() {
                let answer = document.getElementById("math-answer").value.trim();
                let correctAnswer = eval(document.getElementById("math-problem").innerText.split(':')[1].replace('= ?', ''));
                if (parseInt(answer) === Math.round(correctAnswer)) {
                    updateScore(10, "Correct math answer!");
                    totalMathScore += 10;
                } else {
                    updateScore(-5, "Incorrect math answer.");
                    totalMathScore += -5;
                }
                generateMathProblem();
            }
        }

        // Task 3: Reaction Time Task 2
        function startReactionTimeTask2() {
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

        // Categorization Game Introduction
        function startCategorizationIntro() {
            categorizationGameIntro.classList.remove("hidden");
            startCategorizationBtn.onclick = function() {
                categorizationGameIntro.classList.add("hidden");
                startCategorizationGame();
            };
        }

        // Categorization Game
function startCategorizationGame() {
    gameContainer.classList.remove('hidden');
    document.getElementById('level-number').textContent = level;
    setupLevel(level);
    gameActive = true;
    timeLeft = timeLimit;
    document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;

    // Start the timer
    startTimer();

    // Display the first item
    displayItem();

    // Add keydown event listener
    document.addEventListener('keydown', handleKeyPress);
}

// Function to set up the level
function setupLevel(level) {
    let allCategories = [
        'Fruit', 'Vehicle', 'Animal', 'Tool', 'Instrument', 'Profession'
    ];

    let allItems = [
        // Level 1 Items (Fruits and Vehicles - relatively straightforward)
        { type: 'word', text: 'Apple', category: 'Fruit' },
        { type: 'word', text: 'Banana', category: 'Fruit' },
        { type: 'word', text: 'Orange', category: 'Fruit' },
        { type: 'word', text: 'Grapes', category: 'Fruit' },

        { type: 'word', text: 'Car', category: 'Vehicle' },
        { type: 'word', text: 'Bike', category: 'Vehicle' },
        { type: 'word', text: 'Bus', category: 'Vehicle' },
        { type: 'word', text: 'Truck', category: 'Vehicle' },

        // Vehicle images including the newly added Vehicle2.jpg
        { type: 'image', src: 'http://localhost/Images/fruits.jpg', category: 'Fruit' },
        { type: 'image', src: 'http://localhost/Images/Vehicle.jpeg', category: 'Vehicle' },
        { type: 'image', src: 'http://localhost/Images/Vehicle2.jpeg', category: 'Vehicle' },

        // Additional fruit image (not strictly needed but kept from previous code)
        { type: 'image', src: 'http://localhost/Images/fruits2.jpeg', category: 'Fruit' },

        // Level 2 Items (Animals and Instruments)
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

        // Images for Animal and Instrument
        { type: 'image', src: 'http://localhost/Images/Animal.jpeg', category: 'Animal' },
        { type: 'image', src: 'http://localhost/Images/Animal2.jpeg', category: 'Animal' },
        { type: 'image', src: 'http://localhost/Images/Animal3.jpeg', category: 'Animal' },

        { type: 'image', src: 'http://localhost/Images/Instrument.jpeg', category: 'Instrument' },
        { type: 'image', src: 'http://localhost/Images/Instrument2.jpeg', category: 'Instrument' },
        { type: 'image', src: 'http://localhost/Images/Instrument3.jpeg', category: 'Instrument' },

        // Level 3 Items: 
        // E = Instrument & Profession
        // I = Animal & Fruit
        { type: 'word', text: 'Doctor', category: 'Profession' },
        { type: 'word', text: 'Engineer', category: 'Profession' },
        { type: 'word', text: 'Teacher', category: 'Profession' },
        { type: 'word', text: 'Nurse', category: 'Profession' },
        { type: 'word', text: 'Lawyer', category: 'Profession' },
        { type: 'word', text: 'Chef', category: 'Profession' },

        { type: 'image', src: 'http://localhost/Images/Profession.jpg', category: 'Profession' },
        { type: 'image', src: 'http://localhost/Images/Profession2.jpeg', category: 'Profession' },

        // Tools (not needed for level 3 categories, but remain in the pool)
        { type: 'word', text: 'Hammer', category: 'Tool' },
        { type: 'word', text: 'Wrench', category: 'Tool' },
        { type: 'word', text: 'Screwdriver', category: 'Tool' },
        { type: 'word', text: 'Pliers', category: 'Tool' },
        { type: 'image', src: 'http://localhost/Images/Tool.jpg', category: 'Tool' }
        
    ];

    // Level instructions
    let levelInstructions = {
        1: 'Level 1: Categorize items into Fruit (E) and Vehicle (I).',
        2: 'Level 2: Categorize items into Animal (E) and Instrument (I).',
        3: 'Level 3: Categorize items into Instrument & Profession (E) and Animal & Fruit (I).'
    };

    document.getElementById('level-instructions').textContent = levelInstructions[level];

    // We'll store the categories for each side as arrays.
    // For single-category sides (levels 1 and 2), we'll still use arrays for consistency.
    if (level === 1) {
        // Level 1: Fruit (E) vs Vehicle (I)
        selectedCategories = [['Fruit'], ['Vehicle']];
        gameItems = allItems.filter(item => selectedCategories[0].includes(item.category) || selectedCategories[1].includes(item.category));
    } else if (level === 2) {
        // Level 2: Animal (E) vs Instrument (I)
        selectedCategories = [['Animal'], ['Instrument']];
        gameItems = allItems.filter(item => selectedCategories[0].includes(item.category) || selectedCategories[1].includes(item.category));
    } else if (level === 3) {
        // Level 3: E = Instrument & Profession, I = Animal & Fruit
        selectedCategories = [
            ['Instrument', 'Profession'],
            ['Animal', 'Fruit']
        ];
        let categoriesLevel3 = ['Instrument', 'Profession', 'Animal', 'Fruit'];
        gameItems = allItems.filter(item => categoriesLevel3.includes(item.category));
    }

    // Update categories display
    // Join each side's categories with " & "
    document.getElementById('left-category').textContent = selectedCategories[0].join(' & ');
    document.getElementById('right-category').textContent = selectedCategories[1].join(' & ');

    // Shuffle game items
    shuffleArray(gameItems);

    currentItemIndex = 0;
}

// Function to display the current item
function displayItem() {
    if (currentItemIndex < gameItems.length) {
        let currentItem = gameItems[currentItemIndex];
        let itemToSort = document.getElementById('itemToSort');
        // Clear previous content
        itemToSort.innerHTML = '';

        if (currentItem.type === 'word') {
            // Create word element
            let word = document.createElement('p');
            word.textContent = currentItem.text;
            word.style.fontSize = '48px';
            word.style.fontWeight = 'bold';
            word.style.color = '#f0a500';
            itemToSort.appendChild(word);
        } else if (currentItem.type === 'image') {
            // Create image element
            let img = document.createElement('img');
            img.src = currentItem.src; // Local image path
            img.alt = 'Item to Sort';
            img.style.maxWidth = '400px';
            img.style.borderRadius = '10px';
            img.style.border = '2px solid #f0a500';
            itemToSort.appendChild(img);
        }
    } else {
        // End the level
        endCategorizationLevel();
    }
}

// Function to handle key presses
function handleKeyPress(event) {
    if (!gameActive) return;
    let key = event.key.toLowerCase();
    if (key === 'e' || key === 'i') {
        checkAnswer(key);
    }
}

// Function to check the player's answer
function checkAnswer(key) {
    let currentItem = gameItems[currentItemIndex];
    let correctCategory = currentItem.category;

    // selectedCategory is now one of the arrays in selectedCategories
    let selectedCategoryArray = (key === 'e') ? selectedCategories[0] : selectedCategories[1];

    if (selectedCategoryArray.includes(correctCategory)) {
        // Correct answer
        document.getElementById('feedback').textContent = 'Correct!';
        document.getElementById('feedback').style.color = '#00ff00';
        updateScore(2, `Correctly categorized ${currentItem.text || 'image'} as ${correctCategory}.`);
    } else {
        // Incorrect answer
        document.getElementById('feedback').textContent = 'Wrong!';
        document.getElementById('feedback').style.color = '#ff0000';
        updateScore(-1, `Incorrectly categorized ${currentItem.text || 'image'}. It belongs to ${correctCategory}.`);
    }

    // Move to the next item
    currentItemIndex++;

    // Display feedback and move to the next item after a short delay
    setTimeout(() => {
        document.getElementById('feedback').textContent = '';
        displayItem();
    }, 500);
}

// Function to start the game timer
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

// Function to end the categorization level
function endCategorizationLevel() {
    gameActive = false;
    document.removeEventListener('keydown', handleKeyPress);
    clearInterval(timer);

    if (level < 3) {
        // Proceed to next level
        level++;
        alert(`Level ${level - 1} Complete! Get ready for Level ${level}.`);
        startCategorizationGame();
    } else {
        // End the game
        gameContainer.classList.add('hidden');
        taskScores['Categorization Game'] = score;
        startMemoryRecallAtEnd();
    }
}



        // Memory Recall at the End
        function startMemoryRecallAtEnd() {
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

        function compareWords(words1, words2) {
            let correctCount = 0;
            for (let word of words1) {
                if (words2.includes(word)) correctCount++;
            }
            return correctCount >= words1.length / 2;
        }

        // Score Update Function
        function updateScore(points, message) {
            score += points;
            feedback.push(message);
            scoreDisplay.innerText = `Score: ${score}`;
        }

        // Final Score Display
function displayFinalScore() {
    finalScoreSection.classList.remove("hidden");

    // Create a score breakdown list
    let breakdownList = '';
    for (let task in taskScores) {
        breakdownList += `<li><strong>${task}:</strong> ${taskScores[task]} points</li>`;
    }

    // Create a feedback ordered list
    let feedbackList = '';
    feedback.forEach((item, index) => {
        feedbackList += `<li>${item}</li>`;
    });

    // Constructing the full HTML content
    // Using headings and lists for better organization
    const finalScoreHTML = `
        <h2>Your final score is ${score}.</h2>
        
        <h3>Score Breakdown:</h3>
        <ul>
            ${breakdownList}
        </ul>
        
        <h3>Feedback:</h3>
        <ol>
            ${feedbackList}
        </ol>
    `;

    // Update the elements
    document.getElementById("final-score-display").innerHTML = `<h2>Your final score is ${score}.</h2>`;
    document.getElementById("feedback-display").innerHTML = finalScoreHTML;

    // Save the final score to the server
    saveScoreToServer(score);
}

// Function to save the score to the server
function saveScoreToServer(finalScore) {
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: finalScore })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Score saved successfully.');
        } else {
            console.error('Error saving score:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

        // Utility function to shuffle an array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    </script>
</body>
</html>
