<?php
header('Content-Type: application/json');

try {
    if (isset($_GET['room_id'])) {
        $roomId = intval($_GET['room_id']);

        $conn = new mysqli('localhost', 'root', '', 'luxury_hotel');
        if ($conn->connect_error) {
            echo json_encode(['success' => false, 'error' => 'Database connection failed.']);
            exit;
        }

        $availabilityQuery = "SELECT name AS room_name, available_rooms FROM rooms WHERE id = $roomId AND is_available = 1";
        $result = $conn->query($availabilityQuery);

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $roomName = $row['room_name'];
            $availableRooms = $row['available_rooms'];

            if ($availableRooms > 0) {
                echo json_encode(['success' => true, 'available' => true, 'room_name' => $roomName]);
            } else {
                echo json_encode(['success' => true, 'available' => false, 'room_name' => $roomName]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Room not found or unavailable.']);
        }

        $conn->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Room ID not provided.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'An unexpected error occurred.']);
}
?>
