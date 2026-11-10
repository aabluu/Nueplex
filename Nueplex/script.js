
// Nueplex homepage movie catalogue
// Built-in movies are always kept in the saved catalogue.
// Poster paths for these 20 movies are controlled by this file.

const defaultMovies = [
    { id: 1, title: "Project Hail Mary", genre: "Sci-Fi", description: "A science teacher wakes up alone on a spaceship and must find a way to save humanity.", image: "images/projecthailmary.jpg", status: "catalogue" },
    { id: 2, title: "The Super Mario Galaxy Movie", genre: "Animation", description: "Mario and his friends embark on a spectacular adventure across the galaxy.", image: "images/mario2.jpg", status: "catalogue" },
    { id: 3, title: "Mortal Kombat II", genre: "Action", description: "The champions return for an epic battle against the dark forces threatening their world.", image: "images/mk.jpg", status: "catalogue" },
    { id: 4, title: "Scream 7", genre: "Horror", description: "A new Ghostface killer emerges, bringing terror to a familiar town.", image: "images/scream.jpg", status: "catalogue" },
    { id: 5, title: "Masters of the Universe", genre: "Adventure", description: "A young man discovers his extraordinary legacy and must protect his world.", image: "images/motu.jpg", status: "catalogue" },
    { id: 6, title: "The Batman", genre: "Action", description: "Batman investigates corruption and a series of riddles threatening Gotham City.", image: "images/bat.jpg", status: "catalogue" },
    { id: 7, title: "Coco", genre: "Animation", description: "A young musician journeys into the Land of the Dead to uncover his family's history.", image: "images/coco.jpg", status: "catalogue" },
    { id: 8, title: "The Dark Knight", genre: "Action", description: "Batman faces the Joker, a criminal mastermind determined to plunge Gotham into chaos.", image: "images/dk.jpg", status: "catalogue" },
    { id: 9, title: "Dune", genre: "Sci-Fi", description: "A gifted young man travels to a dangerous desert planet holding the key to humanity's future.", image: "images/dune.jpg", status: "catalogue" },
    { id: 10, title: "Avengers: Endgame", genre: "Action", description: "The Avengers assemble for one final effort to reverse the devastation caused by Thanos.", image: "images/end.jpg", status: "catalogue" },
    { id: 11, title: "Frozen", genre: "Animation", description: "Two sisters discover the strength of family when a kingdom is trapped in eternal winter.", image: "images/fro.jpg", status: "catalogue" },
    { id: 12, title: "Inception", genre: "Sci-Fi", description: "A skilled thief enters people's dreams to steal secrets and attempt an impossible task.", image: "images/in.jpg", status: "catalogue" },
    { id: 13, title: "Interstellar", genre: "Sci-Fi", description: "A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.", image: "images/inter.jpg", status: "catalogue" },
    { id: 14, title: "Inside Out 2", genre: "Animation", description: "Riley's emotions face new challenges as she enters her teenage years.", image: "images/io.jpg", status: "catalogue" },
    { id: 15, title: "John Wick", genre: "Action", description: "A retired hitman returns to the underworld after a personal loss.", image: "images/jw.jpg", status: "catalogue" },
    { id: 16, title: "The Super Mario Bros. Movie", genre: "Animation", description: "Mario and Luigi are pulled into a colorful world full of unexpected adventures.", image: "images/mario.jpg", status: "catalogue" },
    { id: 17, title: "Oppenheimer", genre: "Drama", description: "The story of J. Robert Oppenheimer and the development of the atomic bomb.", image: "images/op.jpg", status: "catalogue" },
    { id: 18, title: "The Shawshank Redemption", genre: "Drama", description: "Two imprisoned men form a lasting friendship while holding on to hope.", image: "images/redemp.jpg", status: "catalogue" },
    { id: 19, title: "Spider-Man: Across the Spider-Verse", genre: "Animation", description: "Miles Morales journeys across the multiverse and encounters a team of Spider-People.", image: "images/sm.jpg", status: "catalogue" },
    { id: 20, title: "Top Gun: Maverick", genre: "Action", description: "After decades of service, Maverick returns to train a new generation of fighter pilots.", image: "images/tg.jpg", status: "catalogue" }
];

// Load saved movies, add any missing built-in movies, and keep script.js poster paths.
let movies = [...defaultMovies];

try {
    const savedMovies = JSON.parse(localStorage.getItem("nueplexMovies") || "null");

    if (Array.isArray(savedMovies)) {
        const savedByTitle = new Map(
            savedMovies.map(movie => [
                String(movie.title || "").trim().toLowerCase(),
                movie
            ])
        );

        const defaultTitles = new Set(
            defaultMovies.map(movie => movie.title.trim().toLowerCase())
        );

        // Keep saved details/status, but use the poster path written in script.js.
        const mergedDefaults = defaultMovies.map(defaultMovie => {
            const savedMovie = savedByTitle.get(defaultMovie.title.trim().toLowerCase());

            return savedMovie
                ? { ...defaultMovie, ...savedMovie, image: defaultMovie.image }
                : { ...defaultMovie };
        });

        // Keep any extra movies that were added from the Admin Dashboard.
        const extraSavedMovies = savedMovies.filter(movie =>
            !defaultTitles.has(String(movie.title || "").trim().toLowerCase())
        );

        movies = [...mergedDefaults, ...extraSavedMovies];

        localStorage.setItem("nueplexMovies", JSON.stringify(movies));
    } else {
        localStorage.setItem("nueplexMovies", JSON.stringify(defaultMovies));
    }
} catch (error) {
    console.error("Unable to load saved movies:", error);
}

// HTML elements
const grid = document.getElementById("movieGrid");
const search = document.getElementById("movieSearch");
const genre = document.getElementById("genreFilter");
let activeFilter = "all";

// Prevent HTML injection
function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Display movies
function renderMovies() {
    if (!grid) return;

    const term = search ? search.value.trim().toLowerCase() : "";
    const selectedGenre = genre ? genre.value : "";

    const list = movies.filter(movie =>
        (activeFilter === "all" || movie.status === activeFilter) &&
        (!selectedGenre || movie.genre === selectedGenre) &&
        String(movie.title || "").toLowerCase().includes(term)
    );

    grid.innerHTML = list.map(movie => `
        <article class="movie-card">
            <img
                src="${safe(movie.image)}"
                alt="${safe(movie.title)}"
                loading="eager"
                decoding="async"
            >
            <div class="movie-info">
                <h3>${safe(movie.title)}</h3>
                <p>
                    ${safe(movie.genre)} ·
                    ${movie.status === "now" ? "Now Showing" : "Catalogue"}
                </p>
                <button type="button" data-id="${safe(movie.id)}">
                    VIEW DETAILS
                </button>
            </div>
        </article>
    `).join("");

    const emptyMessage = document.getElementById("movieEmpty");
    if (emptyMessage) {
        emptyMessage.hidden = list.length > 0;
    }

    // Show a clear message in the console if an image path is incorrect.
    grid.querySelectorAll(".movie-card img").forEach(img => {
        img.addEventListener("error", () => {
            console.error("Poster not found:", img.getAttribute("src"), "for", img.alt);
        }, { once: true });
    });

    grid.querySelectorAll("button[data-id]").forEach(button => {
        button.onclick = () => {
            const selectedMovie = movies.find(
                movie => String(movie.id) === button.dataset.id
            );
            openMovie(selectedMovie);
        };
    });

    // Update movie dropdown without resetting its current selection.
    const select = document.getElementById("movie");
    if (select) {
        const previousValue = select.value;

        select.innerHTML =
            '<option value="">Choose a movie</option>' +
            movies.map(movie => `
                <option value="${safe(movie.title)}">
                    ${safe(movie.title)}
                </option>
            `).join("");

        select.value = previousValue;
    }
}

// Open movie details
function openMovie(movie) {
    if (!movie) return;

    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalGenre = document.getElementById("modalGenre");
    const modalDescription = document.getElementById("modalDescription");
    const modalBook = document.getElementById("modalBook");
    const modal = document.getElementById("movieModal");

    if (modalImage) modalImage.src = movie.image;
    if (modalTitle) modalTitle.textContent = movie.title;
    if (modalGenre) modalGenre.textContent = movie.genre;
    if (modalDescription) modalDescription.textContent = movie.description;

    if (modalBook) {
        modalBook.href = "booking.html?movie=" + encodeURIComponent(movie.title);
    }

    if (modal) modal.classList.add("show");
}

// Close movie modal
const closeModal = document.getElementById("closeModal");
const movieModal = document.getElementById("movieModal");

if (closeModal && movieModal) {
    closeModal.onclick = () => movieModal.classList.remove("show");

    movieModal.onclick = event => {
        if (event.target.id === "movieModal") {
            movieModal.classList.remove("show");
        }
    };
}

// Movie category filters
document.querySelectorAll("[data-filter]").forEach(button => {
    button.onclick = () => {
        document.querySelectorAll("[data-filter]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        activeFilter = button.dataset.filter;
        renderMovies();
    };
});

// Search and genre filters
if (search) search.oninput = renderMovies;
if (genre) genre.onchange = renderMovies;

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
    menuToggle.onclick = () => mainNav.classList.toggle("open");
}

// Footer year
const footerYear = document.querySelector(".footer-year");
const oldYear = document.getElementById("year");
const currentYear = new Date().getFullYear();

if (footerYear) footerYear.textContent = currentYear;
if (oldYear) oldYear.textContent = currentYear;

// ==================== FIND A SHOWTIME ====================

const showBranchSelect = document.getElementById("showBranch");
const showMovieSelect = document.getElementById("showMovie");
const showDateInput = document.getElementById("showDate");
const showRoomSelect = document.getElementById("showRoom");
const findShowtimeBtn = document.getElementById("findShowtimeBtn");
const showtimeResults = document.getElementById("showtimeResults");

// Read the same storage keys used by admin.js.
function readNueplexStorage(key, fallback) {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        return saved ?? fallback;
    } catch (error) {
        console.error(`Could not read ${key}:`, error);
        return fallback;
    }
}

// Fill the homepage movie list from the admin-managed movie catalogue.
function populateHomepageShowMovies() {
    if (!showMovieSelect) return;

    const previousMovie = showMovieSelect.value;
    const savedMovies = readNueplexStorage("nueplexMovies", movies);
    const availableMovies = Array.isArray(savedMovies) ? savedMovies : movies;

    showMovieSelect.innerHTML = `
        <option value="">Select Movie</option>
        ${availableMovies.map(movie => `
            <option value="${safe(movie.title)}">${safe(movie.title)}</option>
        `).join("")}
    `;

    if (availableMovies.some(movie => movie.title === previousMovie)) {
        showMovieSelect.value = previousMovie;
    }
}

// Use local calendar date, not UTC, to avoid timezone date shifts.
function getHomepageLocalDate() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
}

function formatShowtimeDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function formatShowtimeTime(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-PK", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function findAvailableShowtimes() {
    if (!showtimeResults) return;

    const branch = showBranchSelect?.value || "";
    const movie = showMovieSelect?.value || "";
    const date = showDateInput?.value || "";
    const room = showRoomSelect?.value || "";

    if (!branch || !movie || !date || !room) {
        showtimeResults.innerHTML = `
            <p class="showtime-message">
                Please select a branch, movie, date and room first.
            </p>
        `;
        return;
    }

    if (date < getHomepageLocalDate()) {
        showtimeResults.innerHTML = `
            <p class="showtime-message">
                Please choose today or a future date.
            </p>
        `;
        return;
    }

    const savedShowtimes = readNueplexStorage("nueplexShowtimes", []);

    const availableShowtimes = Array.isArray(savedShowtimes)
        ? savedShowtimes.filter(show =>
            show.branch === branch &&
            show.movie === movie &&
            show.date === date &&
            String(show.room) === String(room) &&
            typeof show.time === "string"
        ).sort((a, b) => a.time.localeCompare(b.time))
        : [];

    if (availableShowtimes.length === 0) {
        showtimeResults.innerHTML = `
            <p class="showtime-message">
                No showtimes found for ${safe(movie)} in ${safe(branch)},
                Room ${safe(room)}, on ${safe(formatShowtimeDate(date))}.
            </p>
        `;
        return;
    }

    showtimeResults.innerHTML = `
        <div class="showtime-results-heading">
            <p>${safe(movie)} · ${safe(branch)} · Room ${safe(room)}</p>
            <span>${safe(formatShowtimeDate(date))}</span>
        </div>

        <div class="showtime-result-list">
            ${availableShowtimes.map(show => {
                const bookingUrl = new URL("booking.html", window.location.href);

                bookingUrl.searchParams.set("movie", movie);
                bookingUrl.searchParams.set("branch", branch);
                bookingUrl.searchParams.set("date", date);
                bookingUrl.searchParams.set("room", String(room));
                bookingUrl.searchParams.set("time", show.time);

                return `
                    <article class="showtime-result-card">
                        <div class="showtime-result-info">
                            <strong>${safe(formatShowtimeTime(show.time))}</strong>
                            <span>Room ${safe(show.room)}</span>
                        </div>

                        <a class="btn showtime-book-btn" href="${safe(bookingUrl.href)}">
                            BOOK NOW
                        </a>
                    </article>
                `;
            }).join("")}
        </div>
    `;
}

// Set today's date as the minimum selectable date.
if (showDateInput) {
    showDateInput.min = getHomepageLocalDate();

    if (!showDateInput.value) {
        showDateInput.value = getHomepageLocalDate();
    }
}

// Populate movie dropdown from admin dashboard.
populateHomepageShowMovies();

// Find Showtime button
if (findShowtimeBtn) {
    findShowtimeBtn.addEventListener("click", findAvailableShowtimes);
}

// Refresh movie dropdown if catalogue changes in another tab.
window.addEventListener("storage", event => {
    if (event.key === "nueplexMovies") {
        populateHomepageShowMovies();
    }
});

// Initial movie display
renderMovies();
