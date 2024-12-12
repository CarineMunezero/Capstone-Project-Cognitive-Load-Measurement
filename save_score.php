<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in.']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Get the JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['score'])) {
    echo json_encode(['status' => 'error', 'message' => 'Score not provided.']);
    exit();
}

$score = intval($data['score']);

include 'db_connection.php';

// Prepare and execute the SQL statement
$sql = "INSERT INTO game_scores (user_id, score, created_at) VALUES (?, ?, NOW())";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("ii", $user_id, $score);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Score saved.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save score.']);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}

$conn->close();
?>
