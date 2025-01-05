<?php
// Establish connection to the database
$servername = "localhost";
$username = "root";  // Change this to your database username
$password = "";  // Change this to your database password
$dbname = "luxury_hotel";  // Your database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch room data
$sql = "SELECT id, name, bed, size, facilities, price, img FROM rooms WHERE is_available = 1";
$result = $conn->query($sql);

// Check if rooms are available
$rooms = [];
if ($result->num_rows > 0) {
    // Fetch room data
    while($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
}

// Close the connection
$conn->close();

// Output the data as JSON
echo json_encode($rooms);
?>
