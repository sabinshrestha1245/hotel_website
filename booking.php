<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "luxury_hotel";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Assuming form data is posted to this page, process the form
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $phone = $_POST['phone'];
  $checkin = $_POST['checkin'];
  $room = $_POST['room'];
  $persons = $_POST['persons'];

  // Check if there is availability
  $sql = "SELECT * FROM bookings WHERE room_type='$room' AND checkin_date='$checkin'";
  $result = $conn->query($sql);

  if ($result->num_rows < 2) { // Assuming 2 rooms per type
    // Insert booking into database
    $sql = "INSERT INTO bookings (name, email, phone, checkin_date, room_type, persons)
            VALUES ('$name', '$email', '$phone', '$checkin', '$room', '$persons')";
    if ($conn->query($sql) === TRUE) {
      echo "The booking has been successful!";
    } else {
      echo "Error: " . $sql . "<br>" . $conn->error;
    }
  } else {
    echo "Sorry! There is no available room.";
  }
}

$conn->close();
?>
