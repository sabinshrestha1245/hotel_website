<?php
$servername = "localhost"; // or 127.0.0.1
$username = "root"; // your MySQL username, typically "root"
$password = ""; // your MySQL password, typically empty on XAMPP
$dbname = "luxury_hotel"; // the name of the database

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
