<?php
session_start();
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];
    $question_number = $_POST['question_number'];
    $question_text = $_POST['question_text'];
    $answer_text = $_POST['answer'];

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO answers (user_id, question_number, question_text, answer_text) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $user_id, $question_number, $question_text, $answer_text);

    if (!$stmt->execute()) {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}
?>
