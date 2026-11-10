
const MK = "nueplexMovies";
const SK = "nueplexShowtimes";
const BK = "nueplexDemoBookings";
const PK = "nueplexTicketPrice";

const defaultMovies = [
    {id:1,title:"Project Hail Mary",genre:"Sci-Fi",description:"A science teacher wakes up alone on a spaceship and must find a way to save humanity.",image:"images/projecthailmary.jpg",status:"catalogue"},
    {id:2,title:"The Super Mario Galaxy Movie",genre:"Animation",description:"Mario and his friends embark on a spectacular adventure across the galaxy.",image:"images/mario2.jpg",status:"catalogue"},
    {id:3,title:"Mortal Kombat II",genre:"Action",description:"The champions return for an epic battle against the dark forces threatening their world.",image:"images/mk.jpg",status:"catalogue"},
    {id:4,title:"Scream 7",genre:"Horror",description:"A new Ghostface killer emerges, bringing terror to a familiar town.",image:"images/scream.jpg",status:"catalogue"},
    {id:5,title:"Masters of the Universe",genre:"Adventure",description:"A young man discovers his extraordinary legacy and must protect his world.",image:"images/motu.jpg",status:"catalogue"},
    {id:6,title:"The Batman",genre:"Action",description:"Batman investigates corruption and a series of riddles threatening Gotham City.",image:"images/bat.jpg",status:"catalogue"},
    {id:7,title:"Coco",genre:"Animation",description:"A young musician journeys into the Land of the Dead to uncover his family's history.",image:"images/coco.jpg",status:"catalogue"},
    {id:8,title:"The Dark Knight",genre:"Action",description:"Batman faces the Joker, a criminal mastermind determined to plunge Gotham into chaos.",image:"images/dk.jpg",status:"catalogue"},
    {id:9,title:"Dune",genre:"Sci-Fi",description:"A gifted young man travels to a dangerous desert planet holding the key to humanity's future.",image:"images/dune.jpg",status:"catalogue"},
    {id:10,title:"Avengers: Endgame",genre:"Action",description:"The Avengers assemble for one final effort to reverse the devastation caused by Thanos.",image:"images/end.jpg",status:"catalogue"},
    {id:11,title:"Frozen",genre:"Animation",description:"Two sisters discover the strength of family when a kingdom is trapped in eternal winter.",image:"images/fro.jpg",status:"catalogue"},
    {id:12,title:"Inception",genre:"Sci-Fi",description:"A skilled thief enters people's dreams to steal secrets and attempt an impossible task.",image:"images/in.jpg",status:"catalogue"},
    {id:13,title:"Interstellar",genre:"Sci-Fi",description:"A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.",image:"images/inter.jpg",status:"catalogue"},
    {id:14,title:"Inside Out 2",genre:"Animation",description:"Riley's emotions face new challenges as she enters her teenage years.",image:"images/io.jpg",status:"catalogue"},
    {id:15,title:"John Wick",genre:"Action",description:"A retired hitman returns to the underworld after a personal loss.",image:"images/jw.jpg",status:"catalogue"},
    {id:16,title:"The Super Mario Bros. Movie",genre:"Animation",description:"Mario and Luigi are pulled into a colorful world full of unexpected adventures.",image:"images/mario.jpg",status:"catalogue"},
    {id:17,title:"Oppenheimer",genre:"Drama",description:"The story of J. Robert Oppenheimer and the development of the atomic bomb.",image:"images/op.jpg",status:"catalogue"},
    {id:18,title:"The Shawshank Redemption",genre:"Drama",description:"Two imprisoned men form a lasting friendship while holding on to hope.",image:"images/redemp.jpg",status:"catalogue"},
    {id:19,title:"Spider-Man: Across the Spider-Verse",genre:"Animation",description:"Miles Morales journeys across the multiverse and encounters a team of Spider-People.",image:"images/sm.jpg",status:"catalogue"},
    {id:20,title:"Top Gun: Maverick",genre:"Action",description:"After decades of service, Maverick returns to train a new generation of fighter pilots.",image:"images/tg.jpg",status:"catalogue"}
];

// New showtimes are added through the admin form.
const defaultShows = [];

const read = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
        return fallback;
    }
};

const write = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

const $ = id => document.getElementById(id);

const safe = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
    }[char]));

// Keep the saved catalogue and built-in movies in sync.
const savedMovies = read(MK, null);

if (!Array.isArray(savedMovies)) {
    write(MK, defaultMovies);
} else {
    const defaultByTitle = new Map(
        defaultMovies.map(movie => [
            movie.title.toLowerCase(),
            movie
        ])
    );

    const updatedMovies = savedMovies.map(movie => {
        const defaultMovie = defaultByTitle.get(
            String(movie.title || "").toLowerCase()
        );

        return defaultMovie
            ? {...movie, image:defaultMovie.image}
            : movie;
    });

    const savedTitles = new Set(
        updatedMovies.map(movie =>
            String(movie.title || "").toLowerCase()
        )
    );

    defaultMovies.forEach(movie => {
        if (!savedTitles.has(movie.title.toLowerCase())) {
            updatedMovies.push(movie);
        }
    });

    write(MK, updatedMovies);
}

// Remove old showtimes that do not have a movie and date.
const existingShows = read(SK, []);

const migratedShows = Array.isArray(existingShows)
    ? existingShows.filter(show =>
        show &&
        show.movie &&
        show.date &&
        show.branch &&
        show.room &&
        show.time
    )
    : [];

write(SK, migratedShows);

// Notifications
function toast(message) {
    $("adminToast").textContent = message;
    $("adminToast").classList.add("show");

    setTimeout(() => {
        $("adminToast").classList.remove("show");
    }, 2300);
}

// Navigation
function section(name) {
    document.querySelectorAll(".admin-section").forEach(section => {
        section.classList.toggle("active", section.id === name);
    });

    document.querySelectorAll(".admin-nav button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === name
        );
    });

    $("pageHeading").textContent =
        name[0].toUpperCase() + name.slice(1);

    $("adminSidebar").classList.remove("open");
    render();
}

document.querySelectorAll(".admin-nav button").forEach(button => {
    button.onclick = () => section(button.dataset.section);
});

$("adminMenuToggle").onclick = () => {
    $("adminSidebar").classList.toggle("open");
};

// Dashboard and tables
function render() {
    const movies = read(MK, defaultMovies);
    const shows = read(SK, defaultShows);
    const books = read(BK, []);

    $("statMovies").textContent = movies.length;
    $("statBookings").textContent = books.length;

    $("statSeats").textContent = books.reduce(
        (total, booking) =>
            total + (booking.seats?.length || 0),
        0
    );

    $("statRevenue").textContent =
        "Rs. " + books.reduce(
            (total, booking) =>
                total + (Number(booking.total) || 0),
            0
        ).toLocaleString("en-PK");

    const recent = [...books].reverse().slice(0, 5);

    $("recentBookings").innerHTML = recent.length
        ? recent.map(booking => `
            <tr>
                <td>${safe(booking.reference)}</td>
                <td>${safe(booking.movie)}</td>
                <td>${safe(booking.branch)}</td>
                <td>${safe(booking.date)}</td>
                <td>Rs. ${Number(booking.total) || 0}</td>
            </tr>
        `).join("")
        : '<tr><td colspan="5">No demo bookings yet.</td></tr>';

    $("moviesTable").innerHTML = movies.map(movie => `
        <tr>
            <td>${safe(movie.title)}</td>
            <td>${safe(movie.genre)}</td>
            <td>${movie.status === "now" ? "Now Showing" : "Catalogue"}</td>
            <td>
                <button data-edit="${movie.id}">Edit</button>
                <button data-delete="${movie.id}">Delete</button>
            </td>
        </tr>
    `).join("") || '<tr><td colspan="4">No movies.</td></tr>';

    $("showtimesTable").innerHTML = shows.map(show => `
        <tr>
            <td>${safe(show.branch)}</td>
            <td>${safe(show.movie)}</td>
            <td>${safe(show.date)}</td>
            <td>Room ${safe(show.room)}</td>
            <td>${safe(show.time)}</td>
            <td>
                <button data-delshow="${show.id}">Delete</button>
            </td>
        </tr>
    `).join("") || '<tr><td colspan="6">No showtimes added yet.</td></tr>';

    $("bookingsTable").innerHTML = books.map(booking => `
        <tr>
            <td>${safe(booking.reference)}</td>
            <td>${safe(booking.movie)}</td>
            <td>${safe(booking.branch)} / ${safe(booking.room)}</td>
            <td>${safe(booking.date)} / ${safe(booking.time)}</td>
            <td>${safe((booking.seats || []).join(", "))}</td>
            <td>Rs. ${Number(booking.total) || 0}</td>
            <td>
                <button data-cancel="${safe(booking.reference)}">Cancel</button>
            </td>
        </tr>
    `).join("") || '<tr><td colspan="7">No demo bookings yet.</td></tr>';

    $("ticketPriceInput").value =
        Number(localStorage.getItem(PK)) || 900;
}

// Movie modal
function openMovie(movie) {
    $("movieForm").reset();

    $("editMovieId").value = movie?.id || "";
    $("movieTitleInput").value = movie?.title || "";
    $("movieGenreInput").value = movie?.genre || "";
    $("movieImageInput").value = movie?.image || "";
    $("movieDescriptionInput").value = movie?.description || "";
    $("movieStatusInput").value = movie?.status || "catalogue";

    $("movieModalHeading").textContent =
        movie ? "Edit Movie" : "Add Movie";

    $("movieAdminModal").classList.add("show");
}

$("addMovieBtn").onclick = () => openMovie();

$("closeMovieModal").onclick = () => {
    $("movieAdminModal").classList.remove("show");
};

$("movieAdminModal").onclick = event => {
    if (event.target.id === "movieAdminModal") {
        event.currentTarget.classList.remove("show");
    }
};

// Save movie
$("movieForm").onsubmit = event => {
    event.preventDefault();

    const list = read(MK, defaultMovies);
    const id = $("editMovieId").value;

    const movie = {
        id: id ? Number(id) : Date.now(),
        title: $("movieTitleInput").value.trim(),
        genre: $("movieGenreInput").value.trim(),
        image: $("movieImageInput").value.trim(),
        description: $("movieDescriptionInput").value.trim(),
        status: $("movieStatusInput").value
    };

    write(
        MK,
        id
            ? list.map(item =>
                item.id === Number(id) ? movie : item
            )
            : [...list, movie]
    );

    $("movieAdminModal").classList.remove("show");

    populateShowMovieDropdown();
    render();
    toast("Movie saved.");
};

// Edit and delete movies
$("moviesTable").onclick = event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
        const movie = read(MK, defaultMovies).find(
            item => item.id === Number(editButton.dataset.edit)
        );

        if (movie) openMovie(movie);
    }

    if (deleteButton && confirm("Delete this movie?")) {
        write(
            MK,
            read(MK, defaultMovies).filter(
                item => item.id !== Number(deleteButton.dataset.delete)
            )
        );

        populateShowMovieDropdown();
        render();
        toast("Movie deleted.");
    }
};

// Showtime management
function minutesOf(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

const SHOW_LENGTH_WITH_CLEANUP = 165;

// Populate movie dropdown
function populateShowMovieDropdown() {
    const select = $("showMovie");
    if (!select) return;

    const previousValue = select.value;
    const movies = read(MK, defaultMovies);

    select.innerHTML =
        '<option value="">Select Movie</option>' +
        movies.map(movie => `
            <option value="${safe(movie.title)}">
                ${safe(movie.title)}
            </option>
        `).join("");

    if (movies.some(movie => movie.title === previousValue)) {
        select.value = previousValue;
    }
}

// Set minimum date to today
function setupShowDate() {
    const dateInput = $("showDate");
    if (!dateInput) return;

    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.min = today;

    if (!dateInput.value || dateInput.value < today) {
        dateInput.value = today;
    }
}

// Add showtime
$("showtimeForm").onsubmit = event => {
    event.preventDefault();

    const list = read(SK, []);

    const item = {
        id: Date.now(),
        branch: $("showBranch").value,
        movie: $("showMovie").value,
        date: $("showDate").value,
        room: $("showRoom").value,
        time: $("showTime").value
    };

    if (!item.movie || !item.date || !item.time) {
        toast("Please complete all showtime fields.");
        return;
    }

    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    if (item.date < today) {
        toast("You cannot add a showtime for a past date.");
        return;
    }

    const start = minutesOf(item.time);
    const end = start + SHOW_LENGTH_WITH_CLEANUP;

    if (end > 24 * 60) {
        toast("This showtime ends after midnight. Choose an earlier time.");
        return;
    }

    // Check conflicts in the same branch, room and date.
    const clash = list.find(show => {
        if (
            show.branch !== item.branch ||
            String(show.room) !== String(item.room) ||
            show.date !== item.date
        ) {
            return false;
        }

        const existingStart = minutesOf(show.time);
        const existingEnd =
            existingStart + SHOW_LENGTH_WITH_CLEANUP;

        return Math.max(start, existingStart) <
            Math.min(end, existingEnd);
    });

    if (clash) {
        toast(
            `Room ${item.room} already has a show at ${clash.time} on this date. Leave at least 2 hours 45 minutes between shows.`
        );
        return;
    }

    write(SK, [...list, item]);

    render();
    toast("Showtime added.");

    $("showtimeForm").reset();
    setupShowDate();
};

// Delete showtime
$("showtimesTable").onclick = event => {
    const button = event.target.closest("[data-delshow]");
    if (!button) return;

    write(
        SK,
        read(SK, []).filter(
            show => show.id !== Number(button.dataset.delshow)
        )
    );

    render();
    toast("Showtime removed.");
};

populateShowMovieDropdown();
setupShowDate();

// Booking management
$("bookingsTable").onclick = event => {
    const button = event.target.closest("[data-cancel]");

    if (
        !button ||
        !confirm("Cancel this demo booking and release seats?")
    ) return;

    const books = read(BK, []);

    const booking = books.find(
        item => item.reference === button.dataset.cancel
    );

    if (!booking) return;

    write(
        BK,
        books.filter(
            item => item.reference !== booking.reference
        )
    );

    const key = [
        "nueplexDemoSeats",
        booking.movie,
        booking.branch,
        booking.date,
        booking.room
    ].join("_");

    write(
        key,
        read(key, []).filter(
            seat => !(booking.seats || []).includes(seat)
        )
    );

    render();
    toast("Booking cancelled.");
};

// Ticket settings
$("settingsForm").onsubmit = event => {
    event.preventDefault();

    const price = Number($("ticketPriceInput").value);

    if (price <= 0) {
        toast("Enter a valid price.");
        return;
    }

    localStorage.setItem(PK, price);
    toast("Ticket price saved.");
};

// Reset demo data
$("resetDemoData").onclick = () => {
    if (!confirm(
        "Reset all Nueplex demo movies, showtimes, bookings and seat reservations in this browser?"
    )) return;

    Object.keys(localStorage)
        .filter(key =>
            [MK, SK, BK, PK].includes(key) ||
            key.startsWith("nueplexDemoSeats_")
        )
        .forEach(key => localStorage.removeItem(key));

    write(MK, defaultMovies);
    write(SK, defaultShows);

    populateShowMovieDropdown();
    render();

    toast("Demo data reset.");
};

render();
