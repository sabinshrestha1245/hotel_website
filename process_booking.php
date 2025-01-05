<?php
// process_booking.php

// Set content type to JSON
header("Content-Type: application/json");

// Get the raw POST data
$rawData = file_get_contents('php://input');

// Decode the incoming JSON data
$data = json_decode($rawData, true);

// Check if data was decoded successfully
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
if (isset($data['room_id'], $data['name'], $data['email'], $data['phone'], $data['checkin'], $data['checkout'], $data['persons'])) {
    $room_id = $data['room_id'];
    $name = $data['name'];
    $email = $data['email'];
    $phone = $data['phone'];
    $checkin = $data['checkin'];
    $checkout = $data['checkout'];
    $persons = $data['persons'];

    // Create a connection to the database
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "luxury_hotel";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check if the connection was successful
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }

    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, customer_name, customer_email, phone_number, check_in, check_out, persons) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $room_id, $name, $email, $phone, $checkin, $checkout, $persons);

    // Execute the query
    if ($stmt->execute()) {
        // Return success message
        echo json_encode(['success' => true, 'message' => 'Booking successfully saved']);
    } else {
        // Return error message if query failed
        echo json_encode(['success' => false, 'error' => 'Failed to save booking']);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    // Missing required data
    echo json_encode(['success' => false, 'error' => 'Missing required data']);
}
?>
