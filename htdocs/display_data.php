<?php
include 'db_connection.php';
session_start();

// Fetch all users from the registrations table
$sql = "SELECT id, full_name FROM registrations";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Registrations and Data</title>
    <style>
        /* Global Styles */
        body {
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #0d1b2a;
            color: #fff;
        }

        h2, h3, h4 {
            text-align: center;
            color: #f0a500;
            margin-bottom: 20px;
        }

        /* User List Styles */
        ul#user-list {
            list-style-type: none;
            padding: 0;
            max-width: 400px;
            margin: 20px auto;
        }

        ul#user-list li {
            margin: 10px 0;
        }

        button.name-btn {
            width: 100%;
            padding: 15px;
            background-color: #1b263b;
            color: #f0a500;
            border: 2px solid #f0a500;
            border-radius: 5px;
            cursor: pointer;
            font-size: 18px;
            text-align: center;
            transition: background-color 0.3s, color 0.3s;
        }

        button.name-btn:hover {
            background-color: #f0a500;
            color: #0d1b2a;
        }

        /* User Details Styles */
        #user-details {
            max-width: 800px;
            margin: 30px auto;
            padding: 20px;
            background-color: #1b263b;
            border: 1px solid #f0a500;
            border-radius: 10px;
            display: none; /* Hidden by default */
        }

        p.detail {
            font-size: 18px;
            margin-bottom: 10px;
            color: #e0e1dd;
        }

        /* Answers and Game Scores */
        ul.answers-list, ul.scores-list {
            list-style-type: none;
            padding: 0;
            margin-top: 20px;
        }

        ul.answers-list li, ul.scores-list li {
            margin-bottom: 15px;
            background-color: #0d1b2a;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #f0a500;
        }

        /* Back Button */
        .back-btn {
            display: block;
            margin: 20px auto;
            padding: 12px 25px;
            background-color: #f0a500;
            color: #0d1b2a;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .back-btn:hover {
            background-color: #cf8500;
        }

        /* Loader */
        .loader {
            border: 8px solid #1b263b;
            border-top: 8px solid #f0a500;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 50px auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            ul#user-list li {
                margin: 5px 0;
            }

            button.name-btn {
                font-size: 16px;
                padding: 12px;
            }

            #user-details {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <h2>User Registrations and Data</h2>

    <!-- User List -->
    <ul id="user-list">
        <?php
        // Display user names as clickable buttons
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                echo "<li><button class='name-btn' onclick='fetchDetails(" . $row['id'] . ")'>" . htmlspecialchars($row['full_name']) . "</button></li>";
            }
        } else {
            echo "<p>No registrations found.</p>";
        }
        ?>
    </ul>

    <!-- User Details Section -->
    <div id="user-details"></div>

    <script>
        function fetchDetails(userId) {
            const userDetailsDiv = document.getElementById('user-details');
            const userList = document.getElementById('user-list');
            userDetailsDiv.style.display = 'block'; // Show the details div
            userList.style.display = 'none'; // Hide the user list
            userDetailsDiv.innerHTML = '<div class="loader"></div>'; // Display loading spinner

            // Use Fetch API to dynamically load user details
            fetch('display_data.php?user_id=' + userId)
                .then(response => response.text())
                .then(data => {
                    userDetailsDiv.innerHTML = data; // Insert the fetched data into the div
                })
                .catch(error => {
                    userDetailsDiv.innerHTML = '<p>Error loading details.</p>';
                    console.error('Error:', error);
                });
        }

        function goBack() {
            document.getElementById('user-details').style.display = 'none';
            document.getElementById('user-list').style.display = 'block';
        }
    </script>

    <?php
    // Handle dynamic user details display when user_id is passed in the query string
    if (isset($_GET['user_id'])) {
        include 'db_connection.php'; // Ensure database connection is available
        $user_id = intval($_GET['user_id']);

        // Fetch registration details
        $sql_registration = "SELECT * FROM registrations WHERE id = ?";
        $stmt = $conn->prepare($sql_registration);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $registration = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($registration) {
            echo "<h3>" . htmlspecialchars($registration['full_name']) . "'s Details</h3>";
            echo "<p class='detail'><strong>Year of Birth:</strong> " . htmlspecialchars($registration['year_of_birth']) . "</p>";
            echo "<p class='detail'><strong>Email:</strong> " . htmlspecialchars($registration['email']) . "</p>";
            echo "<p class='detail'><strong>Registered At:</strong> " . htmlspecialchars($registration['created_at']) . "</p>";

            // Fetch answers related to the user
            $sql_answers = "SELECT question_number, question_text, answer_text FROM answers WHERE user_id = ?";
            $stmt = $conn->prepare($sql_answers);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $answers = $stmt->get_result();
            $stmt->close();

            if ($answers->num_rows > 0) {
                echo "<h4>Assessment Answers</h4>";
                echo "<ul class='answers-list'>";
                while ($answer = $answers->fetch_assoc()) {
                    echo "<li><strong>Q" . $answer['question_number'] . ":</strong> " . htmlspecialchars($answer['question_text']) . "<br>";
                    echo "<strong>Answer:</strong> " . htmlspecialchars($answer['answer_text']) . "</li>";
                }
                echo "</ul>";
            } else {
                echo "<p>No answers found for this user.</p>";
            }

            // Fetch game scores related to the user
            $sql_scores = "SELECT score, created_at FROM game_scores WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql_scores);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $scores = $stmt->get_result();
            $stmt->close();

            if ($scores->num_rows > 0) {
                echo "<h4>Game Scores</h4>";
                echo "<ul class='scores-list'>";
                while ($score = $scores->fetch_assoc()) {
                    echo "<li><strong>Score:</strong> " . htmlspecialchars($score['score']) . "<br>";
                    echo "<strong>Date:</strong> " . htmlspecialchars($score['created_at']) . "</li>";
                }
                echo "</ul>";
            } else {
                echo "<p>No game scores found for this user.</p>";
            }

            echo "<button class='back-btn' onclick='goBack()'>Back to User List</button>";
        } else {
            echo "<p>User not found.</p>";
            echo "<button class='back-btn' onclick='goBack()'>Back to User List</button>";
        }

        // Close the database connection
        $conn->close();

        // Exit to ensure no additional HTML is rendered when fetching details dynamically
        exit();
    }
    ?>
</body>
</html>
