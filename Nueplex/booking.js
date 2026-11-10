
// ==========================================
// NUEPLEX - BOOKING SYSTEM
// ==========================================

const MOVIES_KEY = "nueplexMovies";
const SHOW_KEY = "nueplexShowtimes";
const BOOK_KEY = "nueplexDemoBookings";
const PRICE_KEY = "nueplexTicketPrice";

let selectedTime = "";
let selectedSeats = [];

const $ = id => document.getElementById(id);

const movieSelect = $("bookingMovie");
const branchSelect = $("bookingBranch");
const dateInput = $("bookingDate");
const roomSelect = $("bookingRoom");
const grid = $("seatGrid");

const confirmButton = $("confirmBooking");

// Homepage booking details
const params = new URLSearchParams(window.location.search);

const requestedMovie = params.get("movie") || "";
const requestedBranch = params.get("branch") || "";
const requestedDate = params.get("date") || "";
const requestedRoom = params.get("room") || "";
const requestedTime = params.get("time") || "";


// ==========================================
// LOCAL STORAGE
// ==========================================

function read(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
        console.error("Storage error:", error);
        return fallback;
    }
}

function movies() {
    const saved = read(MOVIES_KEY, []);
    return Array.isArray(saved) ? saved : [];
}

function showtimes() {
    const saved = read(SHOW_KEY, []);
    return Array.isArray(saved) ? saved : [];
}

function price() {
    const savedPrice = Number(localStorage.getItem(PRICE_KEY));

    return savedPrice > 0 ? savedPrice : 900;
}


// ==========================================
// DATE AND TIME HELPERS
// ==========================================

function localToday() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
}

function normalizeRoom(room) {
    return String(room || "")
        .replace(/^Room\s*/i, "")
        .trim();
}

function timeLabel(time) {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

// Check whether a showtime has already passed.
function isShowtimeInFuture(date, time) {
    const today = localToday();

    if (date > today) return true;
    if (date < today) return false;

    const [hours, minutes] = time.split(":").map(Number);

    const showDate = new Date();

    showDate.setHours(hours, minutes, 0, 0);

    return showDate.getTime() > Date.now();
}


// ==========================================
// MOVIE DROPDOWN
// ==========================================

function populateMovies() {
    const savedMovies = movies();

    movieSelect.innerHTML = "";

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Select Movie";

    movieSelect.appendChild(placeholder);

    savedMovies.forEach(movie => {
        const option = document.createElement("option");

        option.value = movie.title;
        option.textContent = movie.title;

        movieSelect.appendChild(option);
    });

    if (
        requestedMovie &&
        savedMovies.some(movie => movie.title === requestedMovie)
    ) {
        movieSelect.value = requestedMovie;
    }
}


// ==========================================
// SEAT STORAGE
// ==========================================

function seatsKey() {
    return [
        "nueplexDemoSeats",
        movieSelect.value,
        branchSelect.value,
        dateInput.value,
        normalizeRoom(roomSelect.value)
    ].join("_");
}


// ==========================================
// BOOKING SUMMARY
// ==========================================

function updateSummary() {
    $("summaryMovie").textContent =
        movieSelect.value || "—";

    $("summaryBranch").textContent =
        branchSelect.value || "—";

    $("summaryDate").textContent =
        dateInput.value || "—";

    $("summaryTime").textContent =
        selectedTime ? timeLabel(selectedTime) : "—";

    $("summaryRoom").textContent =
        roomSelect.value
            ? "Room " + normalizeRoom(roomSelect.value)
            : "—";

    $("summarySeats").textContent =
        selectedSeats.join(", ") || "—";

    $("summaryTotal").textContent =
        "Rs. " +
        (selectedSeats.length * price()).toLocaleString("en-PK");
}


// ==========================================
// SEAT SELECTION
// ==========================================

function createSeats() {
    const reserved = read(seatsKey(), []);

    grid.innerHTML = "";

    "ABCDEFGH".split("").forEach(row => {

        for (let number = 1; number <= 8; number++) {

            const seatName = row + number;
            const button = document.createElement("button");

            button.type = "button";
            button.className = "seat";
            button.textContent = seatName;

            if (reserved.includes(seatName)) {

                button.classList.add("reserved");
                button.disabled = true;

            } else if (selectedSeats.includes(seatName)) {

                button.classList.add("selected");

            }

            button.onclick = () => {

                if (selectedSeats.includes(seatName)) {

                    selectedSeats = selectedSeats.filter(
                        seat => seat !== seatName
                    );

                } else if (selectedSeats.length < 8) {

                    selectedSeats.push(seatName);

                } else {

                    $("bookingMessage").textContent =
                        "You can select a maximum of 8 seats.";

                    return;
                }

                $("bookingMessage").textContent = "";

                createSeats();
                updateSummary();
            };

            grid.appendChild(button);
        }
    });
}

function resetSeats() {
    selectedSeats = [];

    createSeats();
    updateSummary();
}


// ==========================================
// SHOWTIME DISPLAY
// ==========================================

function displayTimes() {

    const container = $("showtimeOptions");

    container.innerHTML = "";
    selectedTime = "";

    const selectedBranch = branchSelect.value;
    const selectedMovie = movieSelect.value;
    const selectedDate = dateInput.value;
    const selectedRoom = normalizeRoom(roomSelect.value);

    if (
        !selectedBranch ||
        !selectedMovie ||
        !selectedDate ||
        !selectedRoom
    ) {
        container.textContent =
            "Please select your movie, branch, date and room.";

        updateSummary();
        return;
    }

    const matchingShows = showtimes()
        .filter(show =>
            show.branch === selectedBranch &&
            show.movie === selectedMovie &&
            show.date === selectedDate &&
            normalizeRoom(show.room) === selectedRoom &&
            typeof show.time === "string" &&
            /^\d{2}:\d{2}$/.test(show.time)
        )
        .filter(show =>
            isShowtimeInFuture(show.date, show.time)
        )
        .sort((a, b) => a.time.localeCompare(b.time));

    if (matchingShows.length === 0) {

        container.textContent =
            "No upcoming showtimes available for your selected details.";

        updateSummary();
        return;
    }

    matchingShows.forEach(show => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "showtime-option";
        button.textContent = timeLabel(show.time);

        button.onclick = () => {

            container.querySelectorAll("button").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            selectedTime = show.time;

            updateSummary();
        };

        container.appendChild(button);

        // Automatically select the showtime sent from homepage.
        if (
            requestedTime &&
            show.time === requestedTime &&
            !selectedTime
        ) {
            button.click();
        }
    });

    updateSummary();
}


// ==========================================
// REFRESH BOOKING PAGE
// ==========================================

function refresh() {
    createSeats();
    updateSummary();
}


// ==========================================
// INITIAL PAGE SETUP
// ==========================================

// Prevent users from selecting previous dates.
dateInput.min = localToday();

// Apply homepage selections.
if (requestedBranch) {
    branchSelect.value = requestedBranch;
}

if (requestedDate && requestedDate >= localToday()) {
    dateInput.value = requestedDate;
} else {
    dateInput.value = localToday();
}

if (requestedRoom) {

    const matchingOption = [...roomSelect.options].find(option =>
        normalizeRoom(option.value) === normalizeRoom(requestedRoom)
    );

    if (matchingOption) {
        roomSelect.value = matchingOption.value;
    }
}

// Populate movies.
populateMovies();


// ==========================================
// INPUT CHANGE EVENTS
// ==========================================

movieSelect.addEventListener("change", () => {

    resetSeats();
    displayTimes();

});

branchSelect.addEventListener("change", () => {

    resetSeats();
    displayTimes();

});

dateInput.addEventListener("change", () => {

    if (dateInput.value < localToday()) {

        dateInput.value = localToday();

        $("bookingMessage").textContent =
            "You cannot select a date in the past.";

    } else {

        $("bookingMessage").textContent = "";
    }

    resetSeats();
    displayTimes();

});

roomSelect.addEventListener("change", () => {

    resetSeats();
    displayTimes();

});


// Initial display.
displayTimes();
refresh();


// ==========================================
// CONFIRM BOOKING
// ==========================================

confirmButton.onclick = () => {

    $("bookingMessage").textContent = "";

    // Check required details.
    if (
        !movieSelect.value ||
        !branchSelect.value ||
        !dateInput.value ||
        !roomSelect.value ||
        !selectedTime ||
        !selectedSeats.length
    ) {

        $("bookingMessage").textContent =
            "Please select a movie, branch, date, showtime and at least one seat.";

        return;
    }

    // Check that the selected date is not in the past.
    if (dateInput.value < localToday()) {

        $("bookingMessage").textContent =
            "You cannot book a showtime in the past.";

        return;
    }

    // Check that the selected showtime has not passed.
    if (!isShowtimeInFuture(dateInput.value, selectedTime)) {

        $("bookingMessage").textContent =
            "This showtime has already passed. Please select another.";

        displayTimes();
        return;
    }

    // Verify the showtime still exists in the admin schedule.
    const validShowtime = showtimes().some(show =>
        show.movie === movieSelect.value &&
        show.branch === branchSelect.value &&
        show.date === dateInput.value &&
        normalizeRoom(show.room) === normalizeRoom(roomSelect.value) &&
        show.time === selectedTime
    );

    if (!validShowtime) {

        $("bookingMessage").textContent =
            "This showtime is no longer available.";

        displayTimes();
        return;
    }

    // Recheck reserved seats immediately before booking.
    const reserved = read(seatsKey(), []);

    const unavailableSeats = selectedSeats.filter(seat =>
        reserved.includes(seat)
    );

    if (unavailableSeats.length > 0) {

        $("bookingMessage").textContent =
            "These seats have just been booked: " +
            unavailableSeats.join(", ") +
            ". Please select different seats.";

        selectedSeats = selectedSeats.filter(seat =>
            !unavailableSeats.includes(seat)
        );

        createSeats();
        updateSummary();

        return;
    }

    // Prevent accidental repeated confirmation.
    confirmButton.disabled = true;

    const bookings = read(BOOK_KEY, []);

    const reference =
        "NUE-" + Date.now().toString().slice(-8);

    const total = selectedSeats.length * price();

    const booking = {
        reference,
        movie: movieSelect.value,
        branch: branchSelect.value,
        date: dateInput.value,
        time: timeLabel(selectedTime),
        room: normalizeRoom(roomSelect.value),
        seats: [...selectedSeats],
        total
    };

    // Save booking.
    bookings.push(booking);

    localStorage.setItem(
        BOOK_KEY,
        JSON.stringify(bookings)
    );

    // Reserve seats.
    localStorage.setItem(
        seatsKey(),
        JSON.stringify([...reserved, ...selectedSeats])
    );

    // Display ticket information.
    $("ticketReference").textContent = reference;
    $("ticketMovie").textContent = booking.movie;
    $("ticketBranch").textContent = booking.branch;
    $("ticketDate").textContent = booking.date;
    $("ticketTime").textContent = booking.time;

    $("ticketRoom").textContent =
        "Room " + booking.room;

    $("ticketSeats").textContent =
        "Seats: " + booking.seats.join(", ");

    $("ticketTotal").textContent =
        "Rs. " + total.toLocaleString("en-PK");

    // Show confirmation.
    $("ticketConfirmation").hidden = false;

    $("ticketConfirmation").scrollIntoView({
        behavior: "smooth"
    });
};


// ==========================================
// NEW BOOKING
// ==========================================

$("newBooking").onclick = () => {

    window.location.href = "booking.html";

};
