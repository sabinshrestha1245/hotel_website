document.addEventListener("DOMContentLoaded", () => {
  const roomsGrid = document.getElementById("rooms-grid");

  // Fetch rooms and display them
  fetch("fetch_rooms.php")
    .then(response => response.json())
    .then(rooms => {
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
            <button class="book-btn" data-room-id="${room.id}" data-room-name="${room.name}" data-room-price="${room.price}" data-room-img="${room.img}">Book Now</button>
          </div>
        `;
        roomsGrid.appendChild(roomCard);
      });
    })
    .catch(error => {
      console.error("Error fetching rooms:", error);
      alert("Unable to fetch rooms at the moment. Please try again later.");
    });

  // Handle button clicks for booking and checking availability
  document.addEventListener("click", (e) => {
    const roomId = e.target.getAttribute("data-room-id");

    if (e.target && e.target.classList.contains("book-btn")) {
      const roomName = e.target.getAttribute("data-room-name");
      const roomPrice = e.target.getAttribute("data-room-price");
      const roomImg = e.target.getAttribute("data-room-img");

      // Store room details in localStorage
      localStorage.setItem('room_id', roomId);
      localStorage.setItem('room_name', roomName);
      localStorage.setItem('room_price', roomPrice);
      localStorage.setItem('room_img', roomImg);

      // Redirect to booking.html
      window.location.href = 'booking.html';
    }

    if (e.target && e.target.classList.contains("check-btn")) {
      // Fetch availability for the room
      fetch(`check_availability.php?room_id=${roomId}`)
        .then(response => response.json())
        .then(data => {
          const message = data.available
            ? `Room "${data.room_name}" is available!`
            : `Sorry, room "${data.room_name}" is not available.`;
          alert(message);
        })
        .catch(error => console.error("Error checking availability:", error));
    }
  });

  // Handle booking form submission
  const bookingForm = document.getElementById('bookingForm');
  const confirmationPopup = document.getElementById('confirmation-popup');
  const confirmBookingBtn = document.getElementById('confirm-booking');
  const cancelBookingBtn = document.getElementById('cancel-booking');

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

    // Determine max persons based on room type
    const room = rooms.find(r => r.id === roomId);
    const maxPersons = room ? (room.name.includes("Standard twin") || room.name.includes("Executive twin") ? 2 :
      room.name.includes("Superior suite") || room.name.includes("Deluxe suite") || room.name.includes("Executive suite") ? 3 :
      room.name.includes("Presidential suite") ? 5 : 2) : 2;

    if (persons > maxPersons) {
      alert(`This room can accommodate up to ${maxPersons} persons.`);
      return;
    }

    // If all checks pass, show confirmation popup
    confirmationPopup.style.display = 'flex';
  });

  // Cancel booking (close popup)
  cancelBookingBtn.addEventListener('click', () => {
    confirmationPopup.style.display = 'none';
  });

  // Confirm booking and process the booking
  confirmBookingBtn.addEventListener('click', () => {
    const bookingData = {
      room_id: document.getElementById('room-id').value,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      checkin: document.getElementById('checkin').value,
      checkout: document.getElementById('checkout').value,
      persons: document.getElementById('persons').value,
    };

    fetch('process_booking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(data => {
        confirmationPopup.style.display = 'none';

        if (data.success) {
          // Redirect to booking_confirmation.html with booking data
          const url = new URL('booking_confirmation.html', window.location.href);
          Object.keys(data).forEach(key => {
            if (key !== 'success') {
              url.searchParams.append(key, data[key]);
            }
          });
          window.location.href = url.toString();
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
});
