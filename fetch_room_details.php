<?php
// Fetch room details based on room ID
if (isset($_GET['room_id'])) {
  $room_id = $_GET['room_id'];

  // Database connection
  $conn = new mysqli("localhost", "root", "", "luxury_hotel");

  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $sql = "SELECT * FROM rooms WHERE id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $room_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $room = $result->fetch_assoc();

  echo json_encode($room);

  $stmt->close();
  $conn->close();
}
?>
