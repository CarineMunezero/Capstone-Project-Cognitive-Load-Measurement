<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

$page = isset($_GET['page']) ? $_GET['page'] : 'page1';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cognisense Setup Guide</title>
    <style>
       

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

        .container {
            background-color: rgba(13, 27, 42, 0.9);
            border-radius: 15px;
            padding: 40px 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            max-width: 700px;
            width: 100%;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
            position: relative;
            z-index: 1;
        }

        h2 {
            font-size: 32px;
            font-weight: 600;
            color: #f0a500;
            margin-bottom: 25px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        p {
            font-size: 18px;
            line-height: 1.6;
            color: #d3d3d3;
        }

        .form-group {
            margin-bottom: 25px;
            text-align: left;
        }

        .form-group label {
            font-size: 18px;
            font-weight: 600;
            color: #f0a500;
        }

        input[type="text"],
        input[type="email"],
        input[type="number"] {
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

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="number"]:focus {
            border-color: #e0e1dd;
            outline: none;
        }

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

        .question-container {
            margin-top: 30px;
            text-align: center;
        }

        .question-container input[type="text"] {
            margin-top: 15px;
            padding: 12px;
            width: 100%;
            border: 1px solid #f0a500;
            background-color: #1b263b;
            color: #fff;
        }

        ul {
            text-align: left;
            font-size: 18px;
            color: #d3d3d3;
            margin-top: 15px;
            line-height: 1.6;
        }

        ul li {
            margin-bottom: 12px;
        }

        .next-btn {
            font-size: 20px;
            padding: 15px 35px;
            color: #0d1b2a;
            background-color: #f0a500;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 25px;
            font-weight: 600;
            transition: background-color 0.3s ease-in-out;
        }

        .next-btn:hover {
            background-color: #cf8500;
        }

        img {
            margin-top: 20px;
            max-width: 100%;
            border-radius: 10px;
            border: 2px solid #f0a500;
        }

        /* Animations */
        @keyframes fadeIn {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
            }

            h2 {
                font-size: 28px;
            }

            p, ul li {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>

<div class="overlay"></div>

<div class="container">
    <!-- Page 1: Introduction -->
    <div id="page1" style="display: <?php echo $page == 'page1' ? 'block' : 'none'; ?>;">
        <h2>Introduction to Biosensors</h2>
        <p>We will be testing your cognitive load using BioRadio with BioCapture, a system designed to measure and monitor brain activity in real-time. BioRadio is equipped with advanced EEG sensors that track electrical activity in your brain, helping us assess how your brain responds to various tasks.</p>
        <button class="next-btn" onclick="window.location.href='index.php?page=page2'">Next</button>
    </div>

    <!-- Page 2: EEG Setup Instructions -->
    <div id="page2" style="display: <?php echo $page == 'page2' ? 'block' : 'none'; ?>;">
        <h2>EEG Setup Instructions</h2>
        <p>To measure cognitive load, place the EEG pads on your head as follows:</p>
        <ul>
            <li><strong>FP1:</strong> Top left of frontal lobe</li>
            <li><strong>FP2:</strong> Top right of frontal lobe</li>
            <li><strong>O1:</strong> Bottom left of the occipital</li>
            <li><strong>O2:</strong> Bottom right of the occipital</li>
            <li><strong>FPZ:</strong> Middle forehead</li>
            <li><strong>A1:</strong> Mastoid (behind left year) </li>
        </ul>
        <!-- Add your image here -->
        <img src="http://localhost/Images/image.png" alt="EEG placement diagram" style="width:100%; max-width:600px;">
        <button class="next-btn" onclick="window.location.href='index.php?page=page3'">Next</button>
    </div>

    <!-- Page 3: Registration Form -->
    <div id="page3" style="display: <?php echo $page == 'page3' ? 'block' : 'none'; ?>;">
        <h2>Quick Registration</h2>
        <form id="registration-form">
            <div class="form-group">
                <label for="name">Enter Full Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="dob">Year of Birth</label>
                <input type="number" id="dob" name="dob" min="1900" max="2099" required>
            </div>
            <div class="form-group">
                <label for="email">Enter Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <button class="next-btn" type="button" onclick="submitRegistration()">Next</button>
        </form>
    </div>

    <!-- Page 4: How the Testing Works -->
    <div id="page4" style="display: none;">
        <h2>How the Testing Works</h2>
        <p>You are now ready to begin the cognitive load testing. Once you click "Start", the BioRadio sensors will begin capturing your brain activity using EEG technology.</p>
        <p>The sensors will monitor your cognitive load as you perform tasks, providing real-time insights into your mental state.</p>
        <p>Please ensure that you are in a comfortable position and ready to begin.</p>
        <button class="next-btn" onclick="nextPage('page4', 'page5')">Start</button>
    </div>

    <!-- Page 5: Cognitive Load Questions -->
    <div id="page5" style="display: none;">
        <h2>Cognitive Load Assessment</h2>
        <form id="questions-form">
            <div id="question-container" class="question-container">
                <p id="question"></p>
                <input type="hidden" id="question-number" name="question_number" value="1">
                <input type="hidden" id="question-text" name="question_text" value="">
                <div id="answer-container"></div>
            </div>
            <button class="next-btn" type="button" onclick="nextQuestion()">Continue</button>
        </form>
    </div>

    <!-- Page 6: Start Game -->
    <div id="page6" style="display: <?php echo $page == 'page6' ? 'block' : 'none'; ?>;">
        <h2>Moving to Level 2</h2>
        <p>Click below to begin the second part.</p>
        <button class="next-btn" onclick="window.location.href='Game.php'">Start Cognisense Game</button>
    </div>
</div>

<script>
    const questions = [
        {
            question: "Did you have breakfast today?",
            type: "radio",
            options: ["Yes", "No"]
        },
        {
            question: "Did you sleep well last night?",
            type: "radio",
            options: ["Yes", "No"]
        },
        {
            question: "How many hours of sleep did you have?",
            type: "radio",
            options: ["Less than 5 hours", "5-7 hours", "More than 7 hours"]
        },
        {
            question: "Did you eat dinner last night?",
            type: "radio",
            options: ["Yes", "No"]
        },
        {
            question: "How did you feel when you woke up this morning?",
            type: "radio",
            options: ["Sleepy", "Awake", "Energetic", "Exhausted"]
        },
        {
            question: "Did you listen to music today?",
            type: "radio",
            options: ["Yes", "No"]
        },
        {
            question: "Did you exercise today?",
            type: "radio",
            options: ["Yes", "No"]
        },
        {
            question: "What's the weather like where you are?",
            type: "radio",
            options: ["Sunny", "Cloudy", "Rainy", "Snowy"]
        }
    ];

    let currentQuestion = 0;

    function submitRegistration() {
        const form = document.getElementById('registration-form');
        const formData = new FormData(form);

        // Send the data to the server using fetch API
        fetch('register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            // Check for errors in the response
            if (data.trim() === 'success') {
                // Move to the next page (How the Testing Works)
                nextPage('page3', 'page4');
            } else {
                alert('Registration failed: ' + data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function nextPage(current, next) {
        document.getElementById(current).style.display = "none";
        document.getElementById(next).style.display = "block";
        if (next === 'page5') {
            displayQuestion();
        }
    }

    function displayQuestion() {
        const questionObj = questions[currentQuestion];
        document.getElementById("question").innerText = questionObj.question;
        document.getElementById("question-number").value = currentQuestion + 1;
        document.getElementById("question-text").value = questionObj.question;

        const answerContainer = document.getElementById("answer-container");
        answerContainer.innerHTML = "";

        if (questionObj.type === "radio") {
            questionObj.options.forEach((option, index) => {
                const label = document.createElement("label");
                label.style.display = "block";
                label.style.marginBottom = "10px";
                const input = document.createElement("input");
                input.type = "radio";
                input.name = "answer";
                input.value = option;
                if (index === 0) input.checked = true; // Check the first option by default
                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + option));
                answerContainer.appendChild(label);
            });
        }
    }

    function nextQuestion() {
        const form = document.getElementById('questions-form');
        const formData = new FormData(form);

        // Send the data to the server using fetch API
        fetch('save_answers.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // Handle response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });

        currentQuestion++;

        if (currentQuestion < questions.length) {
            displayQuestion();
        } else {
            alert("Thank you for completing the assessment!");
            window.location.href = 'index.php?page=page6';
        }
    }

    // No need to call displayQuestion() here; it will be called when navigating to page5
</script>

</body>
</html>
