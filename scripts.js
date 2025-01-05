document.addEventListener("DOMContentLoaded", () => {
  const roomsGrid = document.getElementById("rooms-grid");

  // Fetch rooms
  fetch("fetch_rooms.php")
    .then(response => response.json())
    .then(rooms => {
      if (rooms.length === 0) {
        console.log("No rooms available.");
        return;
      }

      rooms.forEach(room => {
        const roomCard = document.createElement("div");
        roomCard.className = "room-card";
        roomCard.innerHTML = `
          <img src="${room.img}" alt="${room.name}">
          <h3>${room.name}</h3>
          <p>${room.bed} | ${room.size}</p>
          <p class="facilities">${room.facilities}</p>
          <p class="price">$${room.price} per night</p>
          <div class="buttons">
            <button class="check-btn" data-room-id="${room.id}">Check Availability</button>
            <button class="book-btn" data-room-id="${room.id}">Book Now</button>
          </div>
        `;
        roomsGrid.appendChild(roomCard);
      });
    })
    .catch(error => console.error("Error fetching rooms:", error));

  // Event listener for both "Book Now" and "Check Availability" buttons
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("book-btn")) {
      const roomId = e.target.getAttribute("data-room-id");
      console.log("Book Now button clicked, roomId:", roomId);

      // Show booking form and pre-fill room ID
      const bookingForm = document.getElementById('bookingForm');
      const roomDetails = document.getElementById('room-details');

      if (bookingForm) {
        bookingForm.style.display = 'block';
        document.getElementById('room-id').value = roomId;

        // Fetch room details for display on the booking form
        fetch(`fetch_room_details.php?room_id=${roomId}`)
          .then(response => response.json())
          .then(data => {
            console.log("Fetched room details:", data);
            if (data && data.name) {
              roomDetails.innerHTML = `
                <h3>Room: ${data.name}</h3>
                <p>Price: $${data.price} per night</p>
                <p>${data.description}</p>
              `;
            } else {
              alert("Room details could not be loaded.");
            }
          })
          .catch(error => console.error("Error fetching room details:", error));
      }
    }

    if (e.target && e.target.classList.contains("check-btn")) {
      const roomId = e.target.getAttribute("data-room-id");

      fetch(`check_availability.php?room_id=${roomId}`)
        .then(response => response.json())
        .then(data => {
          if (data.available) {
            alert(`Room "${data.room_name}" is available!`);
          } else {
            alert(`Sorry, room "${data.room_name}" is not available.`);
          }
        })
        .catch(error => console.error("Error checking availability:", error));
    }
  });

  const bookingForm = document.getElementById('bookingForm');
  const confirmationPopup = document.getElementById('confirmation-popup');
  const confirmBookingBtn = document.getElementById('confirm-booking');
  const cancelBookingBtn = document.getElementById('cancel-booking');
  const bookingConfirmationSection = document.getElementById('booking-confirmation');

  // Validate and show confirmation popup upon form submission
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Validate the booking form
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const persons = document.getElementById('persons').value;

    const roomId = document.getElementById('room-id').value;

    // Extract first and last names
    const [firstName, lastName] = name.split(" ");

    // Validation checks
    if (!firstName || !lastName) {
      alert("Please enter both first and last names.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^04\d{8}$/.test(phone)) {
      alert("Phone number should start with '04' and have 10 digits.");
      return;
    }

    if (!checkin) {
      alert("Please select a check-in date.");
      return;
    }

    if (new Date(checkin) >= new Date(checkout)) {
      alert("Check-out date must be later than check-in date.");
      return;
    }

    // If all checks pass, show confirmation popup
    confirmationPopup.style.display = 'flex';
  });

  cancelBookingBtn.addEventListener('click', () => {
    confirmationPopup.style.display = 'none';
  });

  confirmBookingBtn.addEventListener('click', () => {
    const roomId = document.getElementById('room-id').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const persons = document.getElementById('persons').value;

    const bookingData = {
      room_id: roomId,
      name,
      email,
      phone,
      checkin,
      checkout,
      persons,
    };

    fetch('process_booking.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(data => {
        confirmationPopup.style.display = 'none';

        if (data.success) {
          bookingConfirmationSection.style.display = 'block';

          document.getElementById('confirm-room-name').innerText = data.room_name || 'N/A';
          document.getElementById('confirm-name').innerText = name;
          document.getElementById('confirm-email').innerText = email;
          document.getElementById('confirm-phone').innerText = phone;
          document.getElementById('confirm-checkin').innerText = checkin;
          document.getElementById('confirm-checkout').innerText = checkout;
          document.getElementById('confirm-persons').innerText = persons;

          // Display the success popup with booking details
          displayBookingDetailsPopup(name, email, phone, checkin, checkout, persons, data.room_name);
        } else {
          alert(data.error || 'Sorry! There is no available room. Please re-enter booking information.');
          bookingForm.reset();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing your booking.');
      });
  });

  // Function to display the booking details in a popup
  function displayBookingDetailsPopup(name, email, phone, checkin, checkout, persons, roomName) {
    const bookingDetailsPopup = document.createElement('div');
    bookingDetailsPopup.classList.add('booking-details-popup');
    
    bookingDetailsPopup.innerHTML = `
      <div class="popup-content">
        <h2>Booking Successful!</h2>
        <p><strong>Room:</strong> ${roomName}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Check-in:</strong> ${checkin}</p>
        <p><strong>Check-out:</strong> ${checkout}</p>
        <p><strong>Persons:</strong> ${persons}</p>
        <button id="close-popup-btn">OK</button>
      </div>
    `;

    document.body.appendChild(bookingDetailsPopup);

    // Close the popup when the user clicks the OK button
    document.getElementById('close-popup-btn').addEventListener('click', () => {
      bookingDetailsPopup.style.display = 'none';
    });

    bookingDetailsPopup.style.display = 'block';
  }
});
