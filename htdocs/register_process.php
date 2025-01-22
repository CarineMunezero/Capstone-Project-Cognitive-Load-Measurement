<?php
// register_process.php
session_start();
include 'db_connection.php'; // ensure this file connects to MySQL

$name = $_POST['name'];
$username = $_POST['username'];
$dob = $_POST['dob'];
$email = $_POST['email'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirm-password'];

if ($password !== $confirmPassword) {
    echo "Passwords do not match.";
    exit;
}

// Hash the password before storing
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insert into your users table
$stmt = $conn->prepare("INSERT INTO registrations (name, username, dob, email, password) VALUES (?,?,?,?,?)");
$stmt->bind_param("ssiss", $name, $username, $dob, $email, $hashed);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
