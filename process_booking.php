<?php
header('Content-Type: application/json');

try {
    // Read input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate input
    if (
        isset($data['room_id'], $data['name'], $data['email'], $data['phone'], $data['checkin'], $data['checkout'])
    ) {
        $roomId = intval($data['room_id']);
        $name = htmlspecialchars($data['name']);
        $email = htmlspecialchars($data['email']);
        $phone = htmlspecialchars($data['phone']);
        $checkin = htmlspecialchars($data['checkin']);
        $checkout = htmlspecialchars($data['checkout']);

        // Database connection
        $conn = new mysqli('localhost', 'root', '', 'luxury_hotel');
        if ($conn->connect_error) {
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
            exit;
        }

        // Check room availability
        $availabilityQuery = "SELECT available_rooms, name FROM rooms WHERE id = ? AND is_available = 1";
        $stmt = $conn->prepare($availabilityQuery);
        $stmt->bind_param("i", $roomId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $availableRooms = $row['available_rooms'];
            $roomName = $row['name'];

            if ($availableRooms > 0) {
                // Insert booking
                $insertQuery = "INSERT INTO bookings (room_id, customer_name, customer_email, phone_number, check_in, check_out)
                                VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($insertQuery);
                $stmt->bind_param("isssss", $roomId, $name, $email, $phone, $checkin, $checkout);

                if ($stmt->execute()) {
                    // Update available rooms
                    $updateRooms = "UPDATE rooms SET available_rooms = available_rooms - 1 WHERE id = ?";
                    $stmt = $conn->prepare($updateRooms);
                    $stmt->bind_param("i", $roomId);
                    $stmt->execute();

                    echo json_encode(['success' => true, 'room_name' => $roomName]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to insert booking.']);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'No rooms available.']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Room not found or unavailable.']);
        }

        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid input.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'An error occurred: ' . $e->getMessage()]);
}
?>
