<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $full_name = $_POST['name'];
    $year_of_birth = $_POST['dob'];
    $email = $_POST['email'];

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO registrations (full_name, year_of_birth, email) VALUES (?, ?, ?)");
    $stmt->bind_param("sis", $full_name, $year_of_birth, $email);

    if ($stmt->execute()) {
        // Store user_id in session
        $_SESSION['user_id'] = $stmt->insert_id;
        $stmt->close();
        echo 'success';
    } else {
        echo "Error: " . $stmt->error;
    }
}
?>
