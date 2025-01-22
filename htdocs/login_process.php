<?php
// login_process.php
session_start();
include 'db_connection.php';

$username = $_POST['username'];
$password = $_POST['password'];

// Check for a matching username
$stmt = $conn->prepare("SELECT password_hash FROM registrations WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Bind the "stored" password from DB
    $stmt->bind_result($hashed_pass);
    $stmt->fetch();

    // Verify the password
    if (password_verify($password, $hashed_pass)) {
        // If correct, echo 'success' so the fetch code can redirect
        echo 'success';
    } else {
        echo 'Wrong password';
    }
} else {
    echo 'Username not found';
}

$stmt->close();
$conn->close();
?>
