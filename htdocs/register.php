<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start a session
session_start();

// Include database connection
include 'db_connection.php'; // Ensure this file properly sets up $conn for your database connection

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form inputs and sanitize them
    $full_name = trim($_POST['name']);
    $username = trim($_POST['username']);
    $year_of_birth = trim($_POST['dob']);
    $email = trim($_POST['email']);
    $password = $_POST['password']; // Raw input for password (hashing comes later)
    $confirm_password = $_POST['confirm-password'];

    // Check if passwords match
    if ($password !== $confirm_password) {
        die("Passwords do not match. Please go back and try again.");
    }

    // Check if username or email already exists
    $checkQuery = "SELECT * FROM registrations WHERE username = ? OR email = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("ss", $username, $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        die("Username or email already exists. Please use a different one.");
    }

    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert the user into the database
    $insertQuery = "INSERT INTO registrations (full_name, username, year_of_birth, email, password_hash) VALUES (?, ?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->bind_param("ssiss", $full_name, $username, $year_of_birth, $email, $password_hash);

    if ($insertStmt->execute()) {
        // Store user_id in session and respond with success
        $_SESSION['user_id'] = $insertStmt->insert_id;
        echo "Registration successful!";
    } else {
        echo "Error: " . $insertStmt->error;
    }

    // Close the statements
    $checkStmt->close();
    $insertStmt->close();
}
?>
