<?php
// Connect to the database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "luxury_hotel";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$roomId = $_POST['room_id'];
$name = $_POST['name'];
$email = $_POST['email'];
$checkIn = $_POST['check_in'];
$checkOut = $_POST['check_out'];

// Insert booking data into the bookings table
$sql = "INSERT INTO bookings (room_id, name, email, check_in, check_out) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issss", $roomId, $name, $email, $checkIn, $checkOut);
$stmt->execute();
$stmt->close();

// Mark the room as unavailable
$updateSql = "UPDATE rooms SET is_available = 0 WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("i", $roomId);
$updateStmt->execute();
$updateStmt->close();

echo json_encode(['success' => true]);

$conn->close();
?>
