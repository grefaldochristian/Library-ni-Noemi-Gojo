"use strict";

/* ==========================================
   LIBCENTRAL - LIBRARY MANAGEMENT SYSTEM
   Final version: fixed payments, borrowing,
   login sound, roles and data handling
========================================== */

/* CONFIGURATION */

const FINE_PER_DAY = 1.00;
const LOAN_PERIOD = 2;            /* normal loan period: 2 days */
const MAX_RESERVATIONS = 5;
const MAX_LOANS = 5;
const MIN_LOAN_DAYS = 1;   /* earliest return date: tomorrow */
const MAX_LOAN_DAYS = 30;  /* latest return date a student may choose */
const TEST_LOAN_MINUTES = 1;      /* payment test loan becomes due after 1 minute */
const TEST_FINE_PER_MINUTE = 1.00; /* and then adds ₱1.00 fine for every minute late */
const SOUND_PREF_KEY = "lib_sound_enabled_v1";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80";

const STORAGE_KEYS = {
  books: "lib_books_v3",
  users: "lib_users_v3",
  loans: "lib_loans_v3",
  reservations: "lib_reservations_v3",
  payments: "lib_payments_v3",
  activity: "lib_activity_v3",
  currentUser: "lib_current_user_v3"
};

/* INITIAL DATA (15 BOOKS PER SUBJECT) */

const unsplash = id =>
  "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=400&q=80";

const BOOK_DATA = [
  // COMPUTER SCIENCE
  ["b1", "Clean Code", "Robert C. Martin", "Computer Science", "978-0132350884", "1555066931-4365d14bab8c"],
  ["b2", "Introduction to Algorithms", "Thomas H. Cormen", "Computer Science", "978-0262033848", "1516116216624-53e697fedbea"],
  ["cs3", "Design Patterns", "Erich Gamma et al.", "Computer Science", "978-0201633610", "1507238691740-187a5b1d37b8"],
  ["cs4", "The Pragmatic Programmer", "Andrew Hunt", "Computer Science", "978-0135957059", "1461749280684-dccba630e2f6"],
  ["cs5", "Structure and Interpretation of Computer Programs", "Harold Abelson", "Computer Science", "978-0262510875", "1526374965328-7f61d4dc18c5"],
  ["cs6", "Code Complete", "Steve McConnell", "Computer Science", "978-0735619678", "1555066931-4365d14bab8c"],
  ["cs7", "Refactoring", "Martin Fowler", "Computer Science", "978-0134757599", "1515879218367-8466d910aaa4"],
  ["cs8", "Head First Java", "Kathy Sierra", "Computer Science", "978-0596009205", "1550751827-4bd374c3f58b"],
  ["cs9", "You Don't Know JS Yet", "Kyle Simpson", "Computer Science", "978-1491904244", "1579468118864-1b9ea3c0db4a"],
  ["cs10", "Operating System Concepts", "Abraham Silberschatz", "Computer Science", "978-1118063330", "1629654297299-c8506221ca97"],
  ["cs11", "Computer Networking: Top-Down Approach", "James Kurose", "Computer Science", "978-0133594140", "1544197150-b99a580bb7a8"],
  ["cs12", "Artificial Intelligence: A Modern Approach", "Stuart Russell", "Computer Science", "978-0134610993", "1677442136019-21780efad99a"],
  ["cs13", "Database System Concepts", "Abraham Silberschatz", "Computer Science", "978-0073523323", "1544383835-bda2bc66a55d"],
  ["cs14", "Domain-Driven Design", "Eric Evans", "Computer Science", "978-0321125217", "1531403009284-440f080d1e12"],
  ["cs15", "Clean Architecture", "Robert C. Martin", "Computer Science", "978-0134494166", "1503387762-592deb58ef4e"],

  // LITERATURE
  ["b3", "To Kill a Mockingbird", "Harper Lee", "Literature", "978-0061120084", "1543002588-bfa74002ed7e"],
  ["b5", "The Great Gatsby", "F. Scott Fitzgerald", "Literature", "978-0743273565", "1512820790803-83ca734da794"],
  ["lit3", "1984", "George Orwell", "Literature", "978-0451524935", "1495640388908-05fa85288e61"],
  ["lit4", "Pride and Prejudice", "Jane Austen", "Literature", "978-0141439518", "1524995997946-a1c2e315a42f"],
  ["lit5", "One Hundred Years of Solitude", "Gabriel García Márquez", "Literature", "978-0060883287", "1506880018603-83d5b814b5a6"],
  ["lit6", "Brave New World", "Aldous Huxley", "Literature", "978-0060850524", "1532012197267-da84d127e765"],
  ["lit7", "The Catcher in the Rye", "J.D. Salinger", "Literature", "978-0316769488", "1476275466078-4007374efbbe"],
  ["lit8", "Crime and Punishment", "Fyodor Dostoevsky", "Literature", "978-0143058442", "1516979187457-637abb4f9353"],
  ["lit9", "Moby-Dick", "Herman Melville", "Literature", "978-1503280786", "1519682337058-a94d519337bc"],
  ["lit10", "The Hobbit", "J.R.R. Tolkien", "Literature", "978-0547928227", "1512820790803-83ca734da794"],
  ["lit11", "Jane Eyre", "Charlotte Brontë", "Literature", "978-0141441146", "1457369804613-52c61a468e7d"],
  ["lit12", "The Alchemist", "Paulo Coelho", "Literature", "978-0062315007", "1521587760476-6c12a4b040da"],
  ["lit13", "Fahrenheit 451", "Ray Bradbury", "Literature", "978-1451673319", "1516979187457-637abb4f9353"],
  ["lit14", "Les Misérables", "Victor Hugo", "Literature", "978-0451419439", "1507842217343-583bb7270b66"],
  ["lit15", "Don Quixote", "Miguel de Cervantes", "Literature", "978-0060934347", "1497633762265-9d179a990aa6"],

  // GENERAL
  ["b4", "Atomic Habits", "James Clear", "General", "978-0735211292", "1544947950-fa07a98d237f"],
  ["gen2", "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "General", "978-0062316097", "1447752875215-b2761acb3c5d"],
  ["gen3", "Educated", "Tara Westover", "General", "978-0399590504", "1506880018603-83d5b814b5a6"],
  ["gen4", "Becoming", "Michelle Obama", "General", "978-1524763138", "1529333166437-7750a6dd5a70"],
  ["gen5", "Outliers", "Malcolm Gladwell", "General", "978-0316017930", "1497633762265-9d179a990aa6"],
  ["gen6", "Deep Work", "Cal Newport", "General", "978-1455586691", "1455390582262-044cdead277a"],
  ["gen7", "Guns, Germs, and Steel", "Jared Diamond", "General", "978-0393317558", "1532012197267-da84d127e765"],
  ["gen8", "The Subtle Art of Not Giving a F*ck", "Mark Manson", "General", "978-0062457714", "1516979187457-637abb4f9353"],
  ["gen9", "Shoe Dog", "Phil Knight", "General", "978-1501135927", "1507842217343-583bb7270b66"],
  ["gen10", "Principles", "Ray Dalio", "General", "978-1501124020", "1457369804613-52c61a468e7d"],
  ["gen11", "Steve Jobs", "Walter Isaacson", "General", "978-1451648539", "1519682337058-a94d519337bc"],
  ["gen12", "Quiet: The Power of Introverts", "Susan Cain", "General", "978-0307352156", "1524995997946-a1c2e315a42f"],
  ["gen13", "Cosmos", "Carl Sagan", "General", "978-0345331359", "1451187580459-43490279c0fa"],
  ["gen14", "A Short History of Nearly Everything", "Bill Bryson", "General", "978-0767908184", "1532012197267-da84d127e765"],
  ["gen15", "Zero to One", "Peter Thiel", "General", "978-0804139298", "1516321318423-f06f85e504b3"],

  // PSYCHOLOGY
  ["b6", "The Psychology of Money", "Morgan Housel", "Psychology", "978-0857197689", "1519682337058-a94d519337bc"],
  ["psy2", "Thinking, Fast and Slow", "Daniel Kahneman", "Psychology", "978-0374533557", "1507842217343-583bb7270b66"],
  ["psy3", "Man's Search for Meaning", "Viktor E. Frankl", "Psychology", "978-0807014295", "1544947950-fa07a98d237f"],
  ["psy4", "Influence: The Psychology of Persuasion", "Robert B. Cialdini", "Psychology", "978-0061241896", "1457369804613-52c61a468e7d"],
  ["psy5", "Grit", "Angela Duckworth", "Psychology", "978-1501111105", "1524995997946-a1c2e315a42f"],
  ["psy6", "Flow: The Psychology of Optimal Experience", "Mihaly Csikszentmihalyi", "Psychology", "978-0061339202", "1516979187457-637abb4f9353"],
  ["psy7", "The Power of Habit", "Charles Duhigg", "Psychology", "978-0812981605", "1532012197267-da84d127e765"],
  ["psy8", "Predictably Irrational", "Dan Ariely", "Psychology", "978-0061353246", "1506880018603-83d5b814b5a6"],
  ["psy9", "Emotional Intelligence", "Daniel Goleman", "Psychology", "978-0553383712", "1512820790803-83ca734da794"],
  ["psy10", "Mindset: The New Psychology of Success", "Carol S. Dweck", "Psychology", "978-0345472328", "1497633762265-9d179a990aa6"],
  ["psy11", "The Body Keeps the Score", "Bessel van der Kolk", "Psychology", "978-0143127741", "1507842217343-583bb7270b66"],
  ["psy12", "Blink: The Power of Thinking Without Thinking", "Malcolm Gladwell", "Psychology", "978-0316010665", "1543002588-bfa74002ed7e"],
  ["psy13", "Stumbling on Happiness", "Daniel Gilbert", "Psychology", "978-1400077427", "1521587760476-6c12a4b040da"],
  ["psy14", "Drive: The Surprising Truth About What Motivates Us", "Daniel H. Pink", "Psychology", "978-1594488849", "1455390582262-044cdead277a"],
  ["psy15", "The Paradox of Choice", "Barry Schwartz", "Psychology", "978-0060005696", "1529333166437-7750a6dd5a70"]
];

const GENRE_BY_ID = {
  b1: "Programming", b2: "Algorithms", cs3: "Software Design", cs4: "Programming", cs5: "Programming",
  cs6: "Software Engineering", cs7: "Software Design", cs8: "Programming", cs9: "Web Development",
  cs10: "Operating Systems", cs11: "Networking", cs12: "Artificial Intelligence", cs13: "Databases",
  cs14: "Software Design", cs15: "Software Design",
  b3: "Classic Fiction", b5: "Classic Fiction", lit3: "Dystopian", lit4: "Romance", lit5: "Magical Realism",
  lit6: "Dystopian", lit7: "Coming of Age", lit8: "Classic Fiction", lit9: "Adventure", lit10: "Fantasy",
  lit11: "Romance", lit12: "Adventure", lit13: "Dystopian", lit14: "Historical Fiction", lit15: "Classic Fiction",
  b4: "Self-Help", gen2: "History", gen3: "Memoir", gen4: "Memoir", gen5: "Self-Help", gen6: "Self-Help",
  gen7: "History", gen8: "Self-Help", gen9: "Business", gen10: "Business", gen11: "Biography",
  gen12: "Self-Help", gen13: "Science", gen14: "Science", gen15: "Business",
  b6: "Personal Finance", psy2: "Cognitive Psychology", psy3: "Philosophy", psy4: "Social Psychology",
  psy5: "Personal Growth", psy6: "Positive Psychology", psy7: "Personal Growth", psy8: "Behavioral Economics",
  psy9: "Personal Growth", psy10: "Personal Growth", psy11: "Clinical Psychology", psy12: "Cognitive Psychology",
  psy13: "Positive Psychology", psy14: "Behavioral Economics", psy15: "Behavioral Economics"
};

const initialBooks = BOOK_DATA.map(([id, title, author, category, isbn, photo], index) => ({
  id, title, author, category, isbn,
  bookNo: "LC-" + String(index + 1).padStart(4, "0"),
  genre: GENRE_BY_ID[id] || category,
  status: "Available",
  cover: unsplash(photo)
}));

const initialUsers = [
  { id: "u1", name: "Admin Librarian", email: "admin@lib.edu", password: "123456", role: "Admin", status: "Active" },
  { id: "u2", name: "Christian Grefaldo", email: "student@lib.edu", password: "123456", role: "Student", status: "Active" },
  { id: "u3", name: "Staff Librarian", email: "librarian@lib.edu", password: "123456", role: "Librarian", status: "Active" }
];

const initialLoans = [
  {
    id: "l1",
    userId: "u2",
    bookId: "b2",
    issueDate: "2026-10-15",
    dueDate: "2026-10-22",
    returnDate: null,
    status: "Active",
    finePaid: 0
  }
];

/* PAYMENT METHODS */

const PAYMENT_METHODS = {
  "Library Desk Cash": { type: "cash" },
  "GCash": { type: "mobile", label: "GCash mobile number", placeholder: "09XX XXX XXXX" },
  "Maya": { type: "mobile", label: "Maya mobile number", placeholder: "09XX XXX XXXX" },
  "Credit / Debit Card": { type: "card", label: "Card number", placeholder: "1234 5678 9012 3456" }
};

/* STORAGE */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return clone(fallback);
    const parsed = JSON.parse(raw);
    return parsed === null ? clone(fallback) : parsed;
  } catch (error) {
    console.error("Storage read error:", key, error);
    return clone(fallback);
  }
}

let books = readStorage(STORAGE_KEYS.books, initialBooks);
let users = readStorage(STORAGE_KEYS.users, initialUsers);
let loans = readStorage(STORAGE_KEYS.loans, initialLoans);
let reservations = readStorage(STORAGE_KEYS.reservations, []);
let payments = readStorage(STORAGE_KEYS.payments, []);
let activity = readStorage(STORAGE_KEYS.activity, []);
let currentUser = readStorage(STORAGE_KEYS.currentUser, null);

if (!Array.isArray(books)) books = clone(initialBooks);
if (!Array.isArray(users)) users = clone(initialUsers);
if (!Array.isArray(loans)) loans = clone(initialLoans);
if (!Array.isArray(reservations)) reservations = [];
if (!Array.isArray(payments)) payments = [];
if (!Array.isArray(activity)) activity = [];

/* Only the user id is stored for the session; the full record is looked up from users */
if (currentUser && typeof currentUser === "object" && currentUser.id) {
  currentUser = users.find(user => user.id === currentUser.id) || null;
} else {
  currentUser = null;
}

/* NORMALIZE DATA (keeps older saved data working) */

books.forEach(book => {
  if (!book.cover) book.cover = DEFAULT_COVER;
  if (!book.status) book.status = "Available";
  if (!book.genre) book.genre = GENRE_BY_ID[book.id] || book.category || "General";
  /* repair titles/authors that were saved with broken characters earlier */
  const original = initialBooks.find(item => item.id === book.id);
  if (original && /Ã|â€/.test(book.title + book.author)) {
    book.title = original.title;
    book.author = original.author;
  }
});

books.forEach(book => {
  if (!book.bookNo) book.bookNo = nextBookNo();
});

users.forEach(user => {
  if (!user.status) user.status = "Active";
  if (user.status === "Inactive") user.status = "Blocked";
});

/* DATA HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function makeId(prefix, records) {
  let id;
  do {
    id = prefix + "-" +
      Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 9);
  } while (records.some(item => item.id === id));
  return id;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = String(value ?? "");
  }
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function todayString() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function parseLocalDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
}

function dayDifference(first, second) {
  const a = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
  const b = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());
  return Math.round((b - a) / 86400000);
}

function addDays(dateString, days) {
  const date = parseLocalDate(dateString);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

/* Due-date fields for a new loan (1 minute in test mode, otherwise the normal days) */
function formatMoney(value) {
  return "₱" + Number(value || 0).toFixed(2);
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    : "—";
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

function calculatePenalty(dueDateStr, referenceDate = todayString()) {
  const due = parseLocalDate(dueDateStr);
  const today = parseLocalDate(referenceDate);
  if (!due || !today) {
    return { overdueDays: 0, fine: "0.00" };
  }
  const overdueDays = Math.max(0, dayDifference(due, today));
  return {
    overdueDays,
    fine: (overdueDays * FINE_PER_DAY).toFixed(2)
  };
}

/* Penalty for one loan. Normal loans are charged per day; test loans (dueAt)
   are charged per minute so payments can be checked quickly. */
function formatDueCell(loan) {
  if (!loan.dueAt) return formatDate(loan.dueDate);
  const due = new Date(Number(loan.dueAt));
  const time = due.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  const left = Number(loan.dueAt) - Date.now();
  let note;
  if (left > 0) {
    const mins = Math.floor(left / 60000);
    const secs = Math.floor((left % 60000) / 1000);
    note = "due in " + mins + "m " + secs + "s";
  } else {
    note = "overdue";
  }
  return formatDate(loan.dueDate) + " " + time + '<br><small>🧪 Test loan &middot; ' + note + "</small>";
}

function unpaidFineFor(loan) {
  const penalty = getPenalty(loan);
  return Math.max(0, round2(Number(penalty.fine) - Number(loan.finePaid || 0)));
}

function outstandingFinesFor(userId) {
  return round2(
    loans
      .filter(loan => loan.userId === userId && loan.status === "Active")
      .reduce((sum, loan) => sum + unpaidFineFor(loan), 0)
  );
}

function activeLoanCount(userId) {
  return loans.filter(loan => loan.userId === userId && loan.status === "Active").length;
}

function getBook(bookId) {
  return books.find(book => book.id === bookId);
}

function getUser(userId) {
  return users.find(user => user.id === userId);
}

function getActiveLoans(bookId) {
  return loans.filter(loan => loan.bookId === bookId && loan.status === "Active");
}

/* SAVE DATA */

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.loans, JSON.stringify(loans));
    localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservations));
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify(currentUser ? { id: currentUser.id } : null)
    );
    return true;
  } catch (error) {
    console.error("Unable to save library data:", error);
    notify("Unable to save changes. Browser storage may be full.", "error");
    return false;
  }
}

/* SOUND EFFECTS (generated in the browser, no audio file required) */

let soundEnabled = true;
try {
  soundEnabled = localStorage.getItem(SOUND_PREF_KEY) !== "off";
} catch (error) {
  soundEnabled = true;
}

let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/* [frequency, startSeconds, durationSeconds, waveform, volume] */
const SOUNDS = {
  login: [
    [523.25, 0.00, 0.40, "sine", 0.20],
    [659.25, 0.12, 0.40, "sine", 0.20],
    [783.99, 0.24, 0.45, "sine", 0.20],
    [1046.50, 0.36, 0.80, "triangle", 0.18]
  ],
  logout: [
    [783.99, 0.00, 0.25, "sine", 0.18],
    [523.25, 0.14, 0.50, "sine", 0.18]
  ],
  success: [
    [659.25, 0.00, 0.22, "sine", 0.18],
    [880.00, 0.11, 0.45, "triangle", 0.18]
  ],
  coin: [
    [987.77, 0.00, 0.10, "square", 0.07],
    [1318.51, 0.09, 0.50, "square", 0.07]
  ],
  error: [
    [233.08, 0.00, 0.18, "sawtooth", 0.08],
    [174.61, 0.14, 0.32, "sawtooth", 0.08]
  ]
};

function playTones(notes) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  notes.forEach(([freq, start, duration, type, volume]) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.05);
  });
}

function playSound(name) {
  if (!soundEnabled || !SOUNDS[name]) return;
  try {
    playTones(SOUNDS[name]);
  } catch (error) {
    console.warn("Sound could not play:", error);
  }
}

function playLoginSound() {
  if (!soundEnabled) return;
  const audio = document.getElementById("loginSound");
  /* use the optional audio file if it exists, otherwise fall back to the built-in chime */
  if (audio && audio.getAttribute("src")) {
    audio.currentTime = 0;
    audio.volume = 0.7;
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => playSound("login"));
    }
  } else {
    playSound("login");
  }
}

function updateSoundButtons() {
  document.querySelectorAll(".sound-toggle").forEach(button => {
    button.textContent = soundEnabled ? "🔊" : "🔇";
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.setAttribute("aria-label", soundEnabled ? "Mute sound effects" : "Turn on sound effects");
    button.title = soundEnabled ? "Sound on" : "Sound off";
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? "on" : "off");
  } catch (error) {
    /* preference simply will not persist */
  }
  updateSoundButtons();
  if (soundEnabled) playSound("success");
}

/* NOTIFICATIONS */

function notify(message, type = "success") {
  let toast = document.getElementById("lib-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "lib-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  if (type === "error") playSound("error");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* ROLE SECURITY */

function requireRole(...roles) {
  if (!currentUser) {
    notify("Please sign in to continue.", "error");
    switchView("login-view");
    return false;
  }
  const savedUser = getUser(currentUser.id);
  if (!savedUser || savedUser.status !== "Active") {
    currentUser = null;
    saveData();
    updateAuthUI();
    notify("Your account is inactive.", "error");
    switchView("login-view");
    return false;
  }
  currentUser = savedUser;
  if (!roles.includes(currentUser.role)) {
    notify("You do not have permission to do this.", "error");
    return false;
  }
  return true;
}

/* INITIALIZATION */

document.addEventListener("DOMContentLoaded", initialize);

const notifiedOverdueLoans = new Set();

function refreshTestLoans() {
  if (!currentUser) return;
  const testLoans = loans.filter(loan => loan.dueAt && loan.status === "Active");
  if (!testLoans.length) return;

  if (currentUser.role === "Student") {
    renderMemberDashboard();
    testLoans.forEach(loan => {
      if (loan.userId === currentUser.id && Date.now() > Number(loan.dueAt) && !notifiedOverdueLoans.has(loan.id)) {
        notifiedOverdueLoans.add(loan.id);
        notify("Your test loan is now overdue. Open My Dashboard and click Pay Fine.", "warning");
      }
    });
  } else {
    renderLibrarianDashboard();
    renderAdminDashboard();
  }
}

/* Creates a loan that is due in 2 minutes so the payment feature can be tested */
function startPaymentTest() {
  if (!requireRole("Student")) return;

  if (activeLoanCount(currentUser.id) >= MAX_LOANS) {
    notify("You already have " + MAX_LOANS + " active loans. Return one first.", "error");
    return;
  }

  const book = books.find(b => {
    syncBookStatus(b.id);
    return b.status === "Available" && getActiveReservations(b.id).length === 0;
  });
  if (!book) {
    notify("No available book for the test.", "error");
    return;
  }

  const newLoan = {
    id: makeId("l", loans),
    userId: currentUser.id,
    bookId: book.id,
    issueDate: todayString(),
    dueDate: todayString(),
    dueAt: Date.now() + TEST_LOAN_MINUTES * 60000,
    returnDate: null,
    status: "Active",
    finePaid: 0
  };

  loans.push(newLoan);
  book.status = "Checked Out";

  if (!saveData()) {
    loans = loans.filter(l => l.id !== newLoan.id);
    book.status = "Available";
    return;
  }

  renderAll();
  playSound("success");
  notify("Test loan created for \"" + book.title + "\". It is due in " + TEST_LOAN_MINUTES + (TEST_LOAN_MINUTES === 1 ? " minute" : " minutes") + ", then the fine grows ₱" + TEST_FINE_PER_MINUTE.toFixed(2) + " per minute.");
}

function renderAll() {
  renderHome();
  renderCatalog();
  renderMemberDashboard();
  renderAdminDashboard();
  renderLibrarianDashboard();
}

/* NAVIGATION */

function setupNavigation() {
  const hamburger = document.getElementById("hamburger-btn");
  const navLinks = document.getElementById("nav-links");
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    hamburger.textContent = isOpen ? "✕" : "☰";
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeNavigation);
  });
  document.addEventListener("click", event => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
      closeNavigation();
    }
  });
}

function closeNavigation() {
  const navLinks = document.getElementById("nav-links");
  const hamburger = document.getElementById("hamburger-btn");
  if (navLinks) navLinks.classList.remove("active");
  if (hamburger) {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open navigation");
    hamburger.textContent = "☰";
  }
}

function updateNavigationActive(viewId) {
  document.querySelectorAll("#nav-links .nav-link").forEach(link => {
    const handler = link.getAttribute("onclick") || "";
    const active = handler.includes("'" + viewId + "'");
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function switchView(viewId) {
  const view = document.getElementById(viewId);
  if (!view || !view.classList.contains("view-section")) return;

  const protectedViews = {
    "member-dashboard-view": ["Student"],
    "admin-dashboard-view": ["Admin"],
    "librarian-dashboard-view": ["Librarian", "Admin"],
    "profile-view": ["Student", "Librarian", "Admin"]
  };

  if (protectedViews[viewId] && !requireRole(...protectedViews[viewId])) {
    return;
  }

  document.querySelectorAll(".view-section").forEach(section => {
    section.classList.remove("active");
  });
  view.classList.add("active");
  closeNavigation();

  if (viewId === "home-view") renderHome();
  if (viewId === "catalog-view") renderCatalog();
  if (viewId === "member-dashboard-view") renderMemberDashboard();
  if (viewId === "admin-dashboard-view") renderAdminDashboard();
  if (viewId === "profile-view") renderProfile();
  if (viewId === "librarian-dashboard-view") renderLibrarianDashboard();

  updateNavigationActive(viewId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchTab(tabId, btn) {
  const parent = btn.closest(".view-section");
  const target = document.getElementById(tabId);
  if (!parent || !target || !parent.contains(target)) return;

  parent.querySelectorAll(".tab-content").forEach(tab => {
    tab.style.display = "none";
  });
  parent.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
  });
  target.style.display = "block";
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
}

/* AUTHENTICATION */

function logout() {
  currentUser = null;
  saveData();
  updateAuthUI();
  playSound("logout");
  notify("You have signed out.");
  switchView("home-view");
}

/* UI HELPERS */

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "?";
}

function updateAuthUI() {
  const authActions = document.getElementById("nav-auth-actions");
  const userActions = document.getElementById("nav-user-actions");
  const profileLink = document.getElementById("profile-link");
  const memberLink = document.getElementById("member-link");
  const adminLink = document.getElementById("admin-link");
  const librarianLink = document.getElementById("librarian-link");
  const nameDisplay = document.getElementById("user-display-name");

  if (currentUser) {
    if (authActions) authActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    if (nameDisplay) nameDisplay.textContent = currentUser.name;
    const avatar = document.getElementById("user-avatar");
    if (avatar) {
      avatar.textContent = getInitials(currentUser.name);
      avatar.dataset.role = currentUser.role;
    }
    if (profileLink) profileLink.style.display = "block";
    if (memberLink) memberLink.style.display = currentUser.role === "Student" ? "block" : "none";
    if (adminLink) adminLink.style.display = currentUser.role === "Admin" ? "block" : "none";
    if (librarianLink) librarianLink.style.display = ["Librarian", "Admin"].includes(currentUser.role) ? "block" : "none";
  } else {
    if (authActions) authActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
    if (memberLink) memberLink.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
    if (librarianLink) librarianLink.style.display = "none";
  }
}

/* HOME */

function renderHome() {
  setText("home-total-books", books.length);
  setText("home-available-books", books.filter(book => book.status === "Available").length);
  setText("home-active-loans", loans.filter(loan => loan.status === "Active").length);
  setText("home-total-members", users.filter(user => user.role === "Student" && user.status === "Active").length);

  const featured = document.getElementById("home-featured-books");
  if (!featured) return;
  let selectedBooks = ["b1", "b3", "b4"].map(getBook).filter(Boolean);
  if (!selectedBooks.length) selectedBooks = books.slice(0, 3);
  featured.innerHTML = selectedBooks.length
    ? selectedBooks.map(createBookCard).join("")
    : emptyState("No books available", "Books will appear here once added.");
}

/* CATALOG */

function emptyState(title, message, action = "") {
  return `
    <div class="empty-state">
      <div style="font-size:36px">📚</div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(message)}</p>
      ${action}
    </div>
  `;
}

/* BOOK DETAILS & BORROWING */

/* RESERVATIONS */

/* PAYMENT (MEMBER FINES) */

let currentPaymentScope = null;
let paymentBusy = false;

function getPayableLoans(scope) {
  if (!currentUser) return [];
  return loans
    .filter(loan =>
      loan.userId === currentUser.id &&
      loan.status === "Active" &&
      (scope === "ALL" || loan.id === scope)
    )
    .map(loan => ({ loan, unpaid: unpaidFineFor(loan) }))
    .filter(item => item.unpaid > 0);
}

function showPaymentForm() {
  const formWrap = document.getElementById("payment-form-wrap");
  const receipt = document.getElementById("payment-receipt");
  const title = document.getElementById("payment-title");
  if (formWrap) formWrap.style.display = "block";
  if (receipt) receipt.style.display = "none";
  if (title) title.textContent = "Pay Library Fine";
}

function openPaymentModal(loanId) {
  if (!requireRole("Student")) return;

  const scope = typeof loanId === "string" && loanId ? loanId : "ALL";
  const items = getPayableLoans(scope);
  const total = round2(items.reduce((sum, item) => sum + item.unpaid, 0));

  if (total <= 0) {
    notify("You have no outstanding penalty fines to pay.", "error");
    renderMemberDashboard();
    return;
  }

  let desc;
  if (scope === "ALL") {
    desc = "Paying all outstanding penalty fines (" + items.length + (items.length === 1 ? " book" : " books") + ").";
  } else {
    const book = getBook(items[0].loan.bookId);
    desc = "Penalty for \"" + (book?.title || "Book") + "\" (" + getPenalty(items[0].loan).label + " overdue).";
  }

  currentPaymentScope = scope;
  paymentBusy = false;

  const form = document.getElementById("payment-form");
  const select = document.getElementById("payment-method-select");
  const modal = document.getElementById("payment-modal");
  const submit = document.getElementById("payment-submit-btn");
  if (form) form.reset();
  if (submit) {
    submit.classList.remove("is-loading");
    submit.disabled = false;
  }

  setText("payment-modal-amount", formatMoney(total));
  setText("payment-item-desc", desc);
  showPaymentForm();
  togglePaymentFields(select ? select.value : "Library Desk Cash");

  if (modal) modal.style.display = "flex";
  if (select) select.focus();
}

function closePaymentModal() {
  if (paymentBusy) return;
  const modal = document.getElementById("payment-modal");
  if (modal) modal.style.display = "none";
  currentPaymentScope = null;
  showPaymentForm();
}

function togglePaymentFields(method) {
  const config = PAYMENT_METHODS[method] || PAYMENT_METHODS["Library Desk Cash"];
  const onlineFields = document.getElementById("online-pay-fields");
  const cardFields = document.getElementById("card-extra-fields");
  const cashNote = document.getElementById("cash-note");
  const account = document.getElementById("payment-account-number");
  const expiry = document.getElementById("payment-card-expiry");
  const cvv = document.getElementById("payment-card-cvv");
  const label = document.getElementById("payment-account-label");

  const isCash = config.type === "cash";
  const isCard = config.type === "card";

  if (onlineFields) onlineFields.style.display = isCash ? "none" : "block";
  if (cardFields) cardFields.style.display = isCard ? "grid" : "none";
  if (cashNote) cashNote.style.display = isCash ? "block" : "none";

  if (account) {
    account.value = "";
    account.required = !isCash;
    account.placeholder = config.placeholder || "";
    account.maxLength = isCard ? 19 : 13;
  }
  if (label && config.label) label.textContent = config.label;
  if (expiry) { expiry.value = ""; expiry.required = isCard; }
  if (cvv) { cvv.value = ""; cvv.required = isCard; }
}

function validatePaymentInputs(method) {
  const config = PAYMENT_METHODS[method];
  if (!config) return "Please choose a payment method.";
  if (config.type === "cash") return "";

  const account = document.getElementById("payment-account-number").value.replace(/[\s-]/g, "");

  if (config.type === "mobile") {
    if (!/^09\d{9}$/.test(account)) {
      return "Enter a valid 11-digit mobile number starting with 09.";
    }
    return "";
  }

  if (!/^\d{16}$/.test(account)) {
    return "Enter a valid 16-digit card number.";
  }

  const expiry = document.getElementById("payment-card-expiry").value.trim();
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return "Enter the card expiry as MM/YY.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Card expiry month is not valid.";
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return "This card has expired.";
  }

  const cvv = document.getElementById("payment-card-cvv").value.trim();
  if (!/^\d{3,4}$/.test(cvv)) return "Enter the 3 or 4 digit security code.";

  return "";
}

function makeReference() {
  const date = todayString().replace(/-/g, "");
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return "PAY-" + date + "-" + code;
}

function maskedAccount(method) {
  const config = PAYMENT_METHODS[method];
  if (!config || config.type === "cash") return "Pay at the library desk";
  const digits = document.getElementById("payment-account-number").value.replace(/\D/g, "");
  return "•••• " + digits.slice(-4);
}

function processPayment(event) {
  event.preventDefault();
  if (paymentBusy) return;
  if (!requireRole("Student")) return;

  const method = document.getElementById("payment-method-select").value;
  const problem = validatePaymentInputs(method);
  if (problem) {
    notify(problem, "error");
    return;
  }

  const items = getPayableLoans(currentPaymentScope || "ALL");
  const total = round2(items.reduce((sum, item) => sum + item.unpaid, 0));
  if (total <= 0) {
    notify("There is nothing left to pay.", "error");
    closePaymentModal();
    renderAll();
    return;
  }

  const accountLabel = maskedAccount(method);
  const submit = document.getElementById("payment-submit-btn");
  paymentBusy = true;
  if (submit) {
    submit.classList.add("is-loading");
    submit.disabled = true;
  }

  /* short delay so the member sees the payment being processed */
  setTimeout(() => finalizePayment(method, accountLabel), 900);
}

function finalizePayment(method, accountLabel) {
  const submit = document.getElementById("payment-submit-btn");
  const resetButton = () => {
    paymentBusy = false;
    if (submit) {
      submit.classList.remove("is-loading");
      submit.disabled = false;
    }
  };

  if (!currentUser) {
    resetButton();
    return;
  }

  /* recompute at the moment of payment so the amount is always correct */
  const items = getPayableLoans(currentPaymentScope || "ALL");
  const total = round2(items.reduce((sum, item) => sum + item.unpaid, 0));
  if (total <= 0) {
    resetButton();
    notify("There is nothing left to pay.", "error");
    closePaymentModal();
    renderAll();
    return;
  }

  const snapshot = items.map(item => ({ loan: item.loan, finePaid: item.loan.finePaid || 0 }));
  const payment = {
    id: makeId("p", payments),
    reference: makeReference(),
    userId: currentUser.id,
    loanIds: items.map(item => item.loan.id),
    amount: total,
    method,
    account: accountLabel,
    date: new Date().toISOString()
  };

  items.forEach(item => {
    item.loan.finePaid = round2(Number(item.loan.finePaid || 0) + item.unpaid);
  });
  payments.push(payment);

  if (!saveData()) {
    snapshot.forEach(entry => { entry.loan.finePaid = entry.finePaid; });
    payments = payments.filter(item => item.id !== payment.id);
    resetButton();
    return;
  }

  paymentBusy = false;
  resetButton();
  renderAll();
  showReceipt(payment, items.length);
  playSound("coin");
  notify("Payment of " + formatMoney(total) + " received. Thank you!");
}

function showReceipt(payment, bookCount) {
  const formWrap = document.getElementById("payment-form-wrap");
  const receipt = document.getElementById("payment-receipt");
  const title = document.getElementById("payment-title");
  if (formWrap) formWrap.style.display = "none";
  if (receipt) receipt.style.display = "block";
  if (title) title.textContent = "Payment Receipt";

  setText("receipt-amount", formatMoney(payment.amount));
  setText("receipt-ref", payment.reference);
  setText("receipt-method", payment.method);
  setText("receipt-account", payment.account);
  setText("receipt-items", bookCount + (bookCount === 1 ? " overdue book" : " overdue books"));
  setText("receipt-date", formatDateTime(payment.date));
}

function setupModalEvents() {
  const modal = document.getElementById("payment-modal");
  if (!modal) return;

  modal.addEventListener("click", event => {
    if (event.target === modal) closePaymentModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      closePaymentModal();
    }
  });

  const account = document.getElementById("payment-account-number");
  const expiry = document.getElementById("payment-card-expiry");
  const cvv = document.getElementById("payment-card-cvv");
  const select = document.getElementById("payment-method-select");

  if (select) {
    select.addEventListener("change", () => togglePaymentFields(select.value));
  }

  if (account) {
    account.addEventListener("input", () => {
      const method = select ? select.value : "";
      const type = PAYMENT_METHODS[method]?.type;
      const digits = account.value.replace(/\D/g, "");
      if (type === "card") {
        account.value = digits.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
      } else if (type === "mobile") {
        const d = digits.slice(0, 11);
        account.value = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean).join(" ");
      }
    });
  }

  if (expiry) {
    expiry.addEventListener("input", () => {
      const digits = expiry.value.replace(/\D/g, "").slice(0, 4);
      expiry.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
    });
  }

  if (cvv) {
    cvv.addEventListener("input", () => {
      cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
    });
  }
}

/* MEMBER DASHBOARD */

function emptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" style="text-align:center; color:var(--muted); padding:24px;">${escapeHTML(message)}</td></tr>`;
}

/* LIBRARIAN DASHBOARD */

/* ADMIN DASHBOARD */

function renderAdminLoans(activeLoans) {
  const tbody = document.getElementById("admin-loans-tbody");
  if (!tbody) return;

  tbody.innerHTML = activeLoans.length
    ? activeLoans.map(loan => {
        const user = getUser(loan.userId);
        const book = getBook(loan.bookId);
        const unpaidFine = unpaidFineFor(loan);

        return `
          <tr>
            <td><strong>${escapeHTML(user?.name || "Unknown")}</strong></td>
            <td>${escapeHTML(book?.title || "Unknown")}</td>
            <td>${formatDueCell(loan)}</td>
            <td>${formatMoney(unpaidFine)}</td>
            <td><button class="btn btn-primary btn-sm" type="button" onclick="returnBook('${escapeHTML(loan.id)}')">Process Return</button></td>
          </tr>
        `;
      }).join("")
    : emptyRow(5, "No active borrowing transactions.");
}

function renderAdminPayments() {
  const tbody = document.getElementById("admin-payments-tbody");
  if (!tbody) return;

  const list = payments.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  tbody.innerHTML = list.length
    ? list.map(item => `
      <tr>
        <td><strong>${escapeHTML(item.reference)}</strong></td>
        <td>${escapeHTML(getUser(item.userId)?.name || "Unknown")}</td>
        <td>${escapeHTML(item.method)}</td>
        <td>${formatDateTime(item.date)}</td>
        <td>${formatMoney(item.amount)}</td>
      </tr>
    `).join("")
    : emptyRow(5, "No fine payments recorded yet.");
}

/* =========================================================
   FEATURE BLOCK v4
   Return-date borrowing, account approval, availability check,
   librarian desk, inventory CRUD, penalty insights, lifecycle log
========================================================= */

const CATEGORY_COLORS = {
  "Computer Science": "#2f6bb5",
  "Literature": "#8a4fb3",
  "General": "#c98a1b",
  "Psychology": "#be4b6c",
  "Education": "#0f8a8a",
  "Science": "#2f8f4e",
  "History": "#a65d2e",
  "Mathematics": "#5a55c4",
  "Business": "#3a6d7e"
};

/* ---------- small helpers ---------- */

function bookLabel(bookId) {
  const book = getBook(bookId);
  return book ? book.title : "Removed book";
}

function userLabel(userId) {
  const user = getUser(userId);
  return user ? user.name : "Unknown";
}

function nextBookNo() {
  const max = books.reduce((highest, book) => {
    const number = parseInt(String(book.bookNo || "").replace(/\D/g, ""), 10);
    return Number.isFinite(number) && number > highest ? number : highest;
  }, 0);
  return "LC-" + String(max + 1).padStart(4, "0");
}

function statusBadgeClass(status) {
  if (status === "Available") return "badge-success";
  if (status === "Withdrawn") return "badge-danger";
  return "badge-warning";
}

function userBadgeClass(status) {
  if (status === "Active") return "badge-success";
  if (status === "Pending") return "badge-warning";
  return "badge-danger";
}

function eventBadgeClass(type) {
  if (type === "Overdue" || type === "Withdrawn") return "badge-danger";
  if (type === "Returned" || type === "New Record" || type === "Restored") return "badge-success";
  return "badge-warning";
}

function getActiveReservations(bookId) {
  return reservations
    .filter(item => item.bookId === bookId && item.status === "Active")
    .sort((a, b) =>
      (a.createdAt || 0) - (b.createdAt || 0) ||
      String(a.date).localeCompare(String(b.date)) ||
      String(a.id).localeCompare(String(b.id))
    );
}

/* Book lifecycle: Available > Checked Out > (Pending) On Hold > Checked Out ... or Withdrawn */
function syncBookStatus(bookId) {
  const book = getBook(bookId);
  if (!book || book.status === "Withdrawn") return;
  if (getActiveLoans(bookId).length) {
    book.status = "Checked Out";
  } else if (getActiveReservations(bookId).length) {
    book.status = "On Hold";
  } else {
    book.status = "Available";
  }
}

/* The "Check Availability" step used before borrowing or reserving */
function checkAvailability(bookId) {
  const book = getBook(bookId);
  if (!book) return { state: "missing", queue: [], loan: null };
  syncBookStatus(bookId);
  const queue = getActiveReservations(bookId);
  const loan = getActiveLoans(bookId)[0] || null;
  let state = "available";
  if (book.status === "Withdrawn") state = "withdrawn";
  else if (loan) state = "checked-out";
  else if (queue.length) state = "on-hold";
  return { state, book, loan, queue };
}

function lifecycleStage(book) {
  const info = checkAvailability(book.id);
  if (info.state === "withdrawn") return "Withdrawn";
  if (info.state === "available") return "Available";
  if (info.state === "on-hold") return "Pending Hold (reserved for the next student)";
  return info.loan && getPenalty(info.loan).overdue ? "Overdue" : "Checked Out";
}

/* ---------- activity / lifecycle log ---------- */

function pushEvent(type, bookId, userId, note, actorId) {
  activity.push({
    id: makeId("e", activity),
    type,
    bookId: bookId || null,
    userId: userId || null,
    actorId: actorId === undefined ? (currentUser ? currentUser.id : null) : actorId,
    date: new Date().toISOString(),
    note: note || ""
  });
  if (activity.length > 600) activity = activity.slice(-600);
}

function recordEvent(type, bookId, userId, note) {
  pushEvent(type, bookId, userId, note);
  saveData();
}

function flagOverdueLoans() {
  let changed = false;
  loans.forEach(loan => {
    if (loan.status === "Active" && !loan.overdueLogged && getPenalty(loan).overdue) {
      loan.overdueLogged = true;
      pushEvent("Overdue", loan.bookId, loan.userId, "Not returned by the deadline", null);
      changed = true;
    }
  });
  if (changed) saveData();
  return changed;
}

/* ---------- penalty and due-date checks ---------- */

function getPenalty(loan) {
  if (loan.dueAt) {
    const left = Number(loan.dueAt) - Date.now();
    const minutes = left < 0 ? Math.ceil(-left / 60000) : 0;
    return {
      test: true,
      overdue: minutes > 0,
      soon: left > 0 && left <= 120000,
      overdueDays: 0,
      overdueMinutes: minutes,
      fine: (minutes * TEST_FINE_PER_MINUTE).toFixed(2),
      label: minutes + (minutes === 1 ? " minute" : " minutes")
    };
  }
  const penalty = calculatePenalty(loan.dueDate);
  const due = parseLocalDate(loan.dueDate);
  const untilDue = due ? dayDifference(parseLocalDate(todayString()), due) : 99;
  return {
    test: false,
    overdue: penalty.overdueDays > 0,
    soon: penalty.overdueDays === 0 && untilDue <= 1,
    overdueDays: penalty.overdueDays,
    overdueMinutes: 0,
    fine: penalty.fine,
    label: penalty.overdueDays + (penalty.overdueDays === 1 ? " day" : " days")
  };
}

function dueWhenText(loan) {
  if (loan.dueAt) return "within a minute";
  const due = parseLocalDate(loan.dueDate);
  const days = due ? dayDifference(parseLocalDate(todayString()), due) : 0;
  return days <= 0 ? "today" : "tomorrow";
}

function loanStatusBadge(loan) {
  const penalty = getPenalty(loan);
  if (penalty.overdue) {
    const text = penalty.test ? penalty.overdueMinutes + "m" : penalty.overdueDays + "d";
    return '<span class="badge badge-danger">Overdue (' + text + ")</span>";
  }
  if (penalty.soon) return '<span class="badge badge-warning">Due ' + dueWhenText(loan) + "</span>";
  return '<span class="badge badge-success">On Time</span>';
}

/* "Check Due Dates" step: runs on login and whenever the dashboard opens */
function checkDueDates(userId) {
  const mine = loans.filter(loan => loan.userId === userId && loan.status === "Active");
  return {
    overdue: mine.filter(loan => getPenalty(loan).overdue),
    soon: mine.filter(loan => {
      const penalty = getPenalty(loan);
      return !penalty.overdue && penalty.soon;
    }),
    fines: outstandingFinesFor(userId)
  };
}

function dueDateError(dueDate) {
  const chosen = parseLocalDate(dueDate);
  if (!chosen) return "Please choose a valid return date.";
  const days = dayDifference(parseLocalDate(todayString()), chosen);
  if (days < MIN_LOAN_DAYS) return "The return date must be at least tomorrow.";
  if (days > MAX_LOAN_DAYS) return "You can borrow a book for up to " + MAX_LOAN_DAYS + " days.";
  return "";
}

function updateBorrowHint() {
  const input = document.getElementById("borrow-return-date");
  const hint = document.getElementById("borrow-date-hint");
  if (!input || !hint) return;
  const problem = dueDateError(input.value);
  if (problem) {
    hint.textContent = problem;
    hint.dataset.state = "error";
    return;
  }
  const days = dayDifference(parseLocalDate(todayString()), parseLocalDate(input.value));
  hint.dataset.state = "ok";
  hint.textContent =
    "You will return it on " + formatDate(input.value) + " (" + days + (days === 1 ? " day" : " days") +
    "). If it comes back late, a penalty of " + formatMoney(FINE_PER_DAY) + " per day is added automatically.";
}

/* ---------- creating loans (one shared, validated path) ---------- */

function loanBlocker(user, book, dueDate) {
  if (!user || user.role !== "Student") return "Only student accounts can borrow books.";
  if (user.status !== "Active") return "This student account is not active.";
  if (!book) return "Book not found.";

  syncBookStatus(book.id);
  if (book.status === "Withdrawn") return "This book has been withdrawn from the collection.";
  if (getActiveLoans(book.id).length) return "This book is currently checked out.";
  if (loans.some(item => item.userId === user.id && item.bookId === book.id && item.status === "Active")) {
    return "This student already has this book.";
  }
  if (activeLoanCount(user.id) >= MAX_LOANS) {
    return user.name + " can borrow up to " + MAX_LOANS + " books at a time. Please return one first.";
  }
  const unpaid = outstandingFinesFor(user.id);
  if (unpaid > 0) {
    return "Unpaid fines of " + formatMoney(unpaid) + " must be paid before borrowing.";
  }
  const queue = getActiveReservations(book.id);
  if (queue.length && queue[0].userId !== user.id) {
    return "This book is on hold for another student in the reservation queue.";
  }
  return dueDateError(dueDate);
}

function createLoan(userId, bookId, dueDate, via) {
  const user = getUser(userId);
  const book = getBook(bookId);
  const problem = loanBlocker(user, book, dueDate);
  if (problem) {
    notify(problem, "error");
    return null;
  }

  const reservation = getActiveReservations(bookId).find(item => item.userId === userId) || null;
  const previousBookStatus = book.status;
  const previousReservationStatus = reservation ? reservation.status : null;

  const loan = {
    id: makeId("l", loans),
    userId,
    bookId,
    issueDate: todayString(),
    dueDate,
    returnDate: null,
    status: "Active",
    finePaid: 0,
    via: via || "Online"
  };

  loans.push(loan);
  book.status = "Checked Out";
  if (reservation) reservation.status = "Fulfilled";

  if (!saveData()) {
    loans = loans.filter(item => item.id !== loan.id);
    book.status = previousBookStatus;
    if (reservation) reservation.status = previousReservationStatus;
    return null;
  }

  recordEvent("Checked Out", bookId, userId, "Return by " + formatDate(dueDate) + " (" + loan.via + ")");
  return loan;
}

function borrowBookDirect(bookId) {
  if (!requireRole("Student")) return;

  const input = document.getElementById("borrow-return-date");
  const dueDate = input ? input.value : addDays(todayString(), LOAN_PERIOD);
  const loan = createLoan(currentUser.id, bookId, dueDate, "Online");
  if (!loan) return;

  renderAll();
  playSound("success");
  notify(
    "Borrowed \"" + bookLabel(bookId) + "\". Return it by " + formatDate(loan.dueDate) +
    " to avoid a " + formatMoney(FINE_PER_DAY) + " per day penalty."
  );
  switchView("member-dashboard-view");
}

function handleIssueBook(event, prefix) {
  event.preventDefault();
  prefix = prefix || "issue";
  if (!requireRole("Admin", "Librarian")) return;

  const userId = document.getElementById(prefix + "-user-select").value;
  const bookId = document.getElementById(prefix + "-book-select").value;
  const dueDate = document.getElementById(prefix + "-due-input").value;

  const loan = createLoan(userId, bookId, dueDate, currentUser.role === "Admin" ? "Admin desk" : "Librarian desk");
  if (!loan) return;

  renderAll();
  event.target.reset();
  populateIssueDropdowns(prefix);
  playSound("success");
  notify("\"" + bookLabel(bookId) + "\" checked out to " + userLabel(userId) + ". Due " + formatDate(loan.dueDate) + ".");
}

function populateIssueDropdowns(prefix) {
  const userSelect = document.getElementById(prefix + "-user-select");
  const bookSelect = document.getElementById(prefix + "-book-select");
  const dateInput = document.getElementById(prefix + "-due-input");

  if (userSelect) {
    const previous = userSelect.value;
    const students = users.filter(user => user.role === "Student" && user.status === "Active");
    userSelect.innerHTML = students.length
      ? students.map(student =>
          `<option value="${escapeHTML(student.id)}">${escapeHTML(student.name)} (${escapeHTML(student.email)})</option>`
        ).join("")
      : '<option value="">No active students</option>';
    if (previous && students.some(student => student.id === previous)) userSelect.value = previous;
  }

  if (bookSelect) {
    const previous = bookSelect.value;
    const issuable = books.filter(book => {
      const info = checkAvailability(book.id);
      return info.state === "available" || info.state === "on-hold";
    });
    bookSelect.innerHTML = issuable.length
      ? issuable.map(book => {
          const info = checkAvailability(book.id);
          const note = info.state === "on-hold" ? " — held for " + userLabel(info.queue[0].userId) : "";
          return `<option value="${escapeHTML(book.id)}">${escapeHTML(book.bookNo)} · ${escapeHTML(book.title)}${escapeHTML(note)}</option>`;
        }).join("")
      : '<option value="">No books available</option>';
    if (previous && issuable.some(book => book.id === previous)) bookSelect.value = previous;
  }

  if (dateInput) {
    dateInput.min = addDays(todayString(), MIN_LOAN_DAYS);
    dateInput.max = addDays(todayString(), MAX_LOAN_DAYS);
    if (!dateInput.value) dateInput.value = addDays(todayString(), LOAN_PERIOD);
  }
}

/* ---------- auth with account approval ---------- */

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  const form = event.target;
  const candidate = users.find(item => String(item.email).toLowerCase() === email);
  const user = candidate && await passwordMatches(candidate, password) ? candidate : null;
  if (!user) {
    notify("Invalid email or password.", "error");
    return;
  }
  if (user.status === "Pending") {
    notify("Your registration is waiting for admin approval. Please try again later.", "warning");
    return;
  }
  if (user.status !== "Active") {
    notify("This account has been blocked. Please contact the library.", "error");
    return;
  }

  /* upgrade an old plain-text password to a hashed one on first login */
  if (!String(user.password).startsWith("sha256:")) {
    user.password = await hashPassword(user.id, password);
  }

  const previousUser = currentUser;
  currentUser = user;
  if (!saveData()) {
    currentUser = previousUser;
    return;
  }

  /* role check, then automatic due-date / overdue alert */
  let message = "Welcome back, " + user.name + "!";
  let type = "success";
  if (user.role === "Student") {
    const due = checkDueDates(user.id);
    if (due.overdue.length) {
      message += " You have " + due.overdue.length + (due.overdue.length === 1 ? " overdue book" : " overdue books") +
        ". Penalty so far: " + formatMoney(due.fines) + ".";
      type = "warning";
    } else if (due.soon.length) {
      message += " " + due.soon.length + (due.soon.length === 1 ? " book is" : " books are") + " due soon.";
      type = "warning";
    }
  } else {
    const overdueCount = loans.filter(loan => loan.status === "Active" && getPenalty(loan).overdue).length;
    if (overdueCount) {
      message += " " + overdueCount + (overdueCount === 1 ? " book is" : " books are") + " overdue.";
      type = "warning";
    }
  }

  updateAuthUI();
  playLoginSound();
  notify(message, type);
  form.reset();

  if (user.role === "Admin") {
    switchView("admin-dashboard-view");
  } else if (user.role === "Librarian") {
    switchView("librarian-dashboard-view");
  } else {
    switchView("member-dashboard-view");
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;

  if (name.length < 2) {
    notify("Please enter your full name.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    notify("Please enter a valid email address.", "error");
    return;
  }
  if (password.length < 6) {
    notify("Password must have at least 6 characters.", "error");
    return;
  }
  if (users.some(user => String(user.email).toLowerCase() === email)) {
    notify("This email is already registered.", "error");
    return;
  }

  const newId = makeId("u", users);
  const newUser = {
    id: newId,
    name,
    email,
    password: await hashPassword(newId, password),
    role: "Student",
    status: "Pending",
    registeredAt: todayString()
  };

  users.push(newUser);
  if (!saveData()) {
    users = users.filter(user => user.id !== newUser.id);
    return;
  }

  form.reset();
  playSound("success");
  notify("Registration received! An admin must approve your membership before you can sign in.");
  switchView("login-view");
}

/* ---------- catalog ---------- */

function populateGenreFilter() {
  const select = document.getElementById("catalog-genre-filter");
  if (!select) return;
  const genres = [...new Set(books.map(book => book.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const signature = genres.join("|");
  if (select.dataset.signature === signature) return;
  const previous = select.value || "ALL";
  select.innerHTML = '<option value="ALL">All Genres</option>' +
    genres.map(genre => `<option value="${escapeHTML(genre)}">${escapeHTML(genre)}</option>`).join("");
  select.value = genres.includes(previous) ? previous : "ALL";
  select.dataset.signature = signature;
}

function setupCatalogEvents() {
  ["catalog-search-input", "catalog-category-filter", "catalog-genre-filter", "catalog-status-filter"].forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", renderCatalog);
    element.addEventListener("change", renderCatalog);
  });
}

function renderCatalog() {
  const grid = document.getElementById("catalog-book-grid");
  if (!grid) return;

  populateGenreFilter();

  const search = (document.getElementById("catalog-search-input")?.value || "").trim().toLowerCase();
  const category = document.getElementById("catalog-category-filter")?.value || "ALL";
  const genre = document.getElementById("catalog-genre-filter")?.value || "ALL";
  const status = document.getElementById("catalog-status-filter")?.value || "ALL";

  const filtered = books.filter(book => {
    const matchesSearch = !search || [
      book.title, book.author, book.genre, book.category, book.bookNo, book.isbn, book.status
    ].some(value => String(value || "").toLowerCase().includes(search));
    return matchesSearch &&
      (category === "ALL" || book.category === category) &&
      (genre === "ALL" || book.genre === genre) &&
      (status === "ALL" || book.status === status);
  });

  setText("catalog-results-count", filtered.length + (filtered.length === 1 ? " book found" : " books found"));
  grid.innerHTML = filtered.length
    ? filtered.map(createBookCard).join("")
    : emptyState("No books found", "Try another search term or change your filters.", '<button class="btn btn-outline" type="button" onclick="resetCatalogFilters()">Clear Filters</button>');
}

function resetCatalogFilters() {
  ["catalog-search-input"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  ["catalog-category-filter", "catalog-genre-filter", "catalog-status-filter"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "ALL";
  });
  renderCatalog();
}

function createBookCard(book) {
  return `
    <article class="book-card" data-category="${escapeHTML(book.category)}">
      <img src="${escapeHTML(book.cover || DEFAULT_COVER)}" alt="Cover of ${escapeHTML(book.title)}" class="book-cover" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_COVER}'">
      <div class="book-details">
        <span class="book-category">${escapeHTML(book.category)}</span>
        <h3 class="book-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</h3>
        <p class="book-author has-meta">By ${escapeHTML(book.author)}</p>
        <p class="book-meta">${escapeHTML(book.bookNo)} &middot; ${escapeHTML(book.genre)}</p>
        <div class="book-status">
          <span class="badge ${statusBadgeClass(book.status)}">${escapeHTML(book.status)}</span>
          <button class="btn btn-outline btn-sm" type="button" data-view-book="${escapeHTML(book.id)}" onclick="viewBookDetails(this.dataset.viewBook)">View Details</button>
        </div>
      </div>
    </article>
  `;
}

/* ---------- book details, borrowing with a chosen return date ---------- */

function viewBookDetails(bookId) {
  const book = getBook(bookId);
  if (!book) {
    notify("Book not found.", "error");
    return;
  }

  const container = document.getElementById("book-details-container");
  if (!container) return;

  const info = checkAvailability(book.id);
  const me = currentUser;
  const myReservation = me ? info.queue.find(item => item.userId === me.id) : null;
  const myPosition = myReservation ? info.queue.findIndex(item => item.id === myReservation.id) + 1 : 0;
  const alreadyBorrowed = me
    ? loans.some(item => item.userId === me.id && item.bookId === book.id && item.status === "Active")
    : false;

  let action = "";
  if (!me) {
    action = `<button class="btn btn-primary" type="button" onclick="switchView('login-view')">Sign in to borrow or reserve</button>`;
  } else if (me.role === "Student") {
    const canBorrow = info.state === "available" || (info.state === "on-hold" && info.queue[0].userId === me.id);
    if (alreadyBorrowed) {
      action = `<p class="notice-text">You already have this book borrowed.</p>`;
    } else if (info.state === "withdrawn") {
      action = `<p class="notice-text">This book has been withdrawn from the collection.</p>`;
    } else if (canBorrow) {
      action = `
        <div class="borrow-box">
          <div class="field">
            <label for="borrow-return-date">When will you return this book?</label>
            <input type="date" id="borrow-return-date"
              min="${addDays(todayString(), MIN_LOAN_DAYS)}"
              max="${addDays(todayString(), MAX_LOAN_DAYS)}"
              value="${addDays(todayString(), LOAN_PERIOD)}"
              oninput="updateBorrowHint()" onchange="updateBorrowHint()">
            <small id="borrow-date-hint" class="borrow-hint"></small>
          </div>
          <button class="btn btn-primary" type="button" onclick="borrowBookDirect('${escapeHTML(book.id)}')">📖 Borrow This Book</button>
        </div>
      `;
    } else if (info.state === "on-hold") {
      action = myReservation
        ? `<p class="notice-text">A copy is being held for the first student in the queue. You are #${myPosition}.</p>`
        : `<p class="notice-text">A copy is being held for another student.</p>`;
    } else if (myReservation) {
      action = `<p class="notice-text">You are #${myPosition} in the reservation queue for this book.</p>`;
    } else {
      action = `
        <p>Queue position if you reserve: <strong>${info.queue.length + 1}</strong></p>
        <button class="btn btn-primary" type="button" onclick="reserveBook('${escapeHTML(book.id)}')">Reserve This Book</button>
      `;
    }
  } else {
    action = `<p class="notice-text">Borrowing and reservations are available through student accounts. Use the Check-out form on your dashboard to issue this book.</p>`;
  }

  let expected = "";
  if (info.loan) {
    expected = `<p>Expected back: <strong>${formatDate(info.loan.dueDate)}</strong></p>`;
  }

  let history = "";
  if (me && ["Admin", "Librarian"].includes(me.role)) {
    const events = activity.filter(item => item.bookId === book.id).slice(-6).reverse();
    history = `
      <div class="lifecycle-box">
        <h3>Record lifecycle</h3>
        ${events.length
          ? `<ul class="lifecycle-list">${events.map(item => `
              <li><span class="badge ${eventBadgeClass(item.type)}">${escapeHTML(item.type)}</span>
              <span>${formatDateTime(item.date)}${item.userId ? " · " + escapeHTML(userLabel(item.userId)) : ""}</span></li>`).join("")}</ul>`
          : '<p class="muted-note">No activity recorded for this book yet.</p>'}
      </div>`;
  }

  container.innerHTML = `
    <div class="book-details-layout">
      <img src="${escapeHTML(book.cover || DEFAULT_COVER)}" alt="Cover of ${escapeHTML(book.title)}" onerror="this.onerror=null;this.src='${DEFAULT_COVER}'">
      <div>
        <span class="book-category">${escapeHTML(book.category)}</span>
        <h2>${escapeHTML(book.title)}</h2>
        <p>Author: <strong>${escapeHTML(book.author)}</strong></p>
        <p>Genre: <strong>${escapeHTML(book.genre)}</strong> &middot; Book No.: <strong>${escapeHTML(book.bookNo)}</strong></p>
        <p>ISBN: <strong>${escapeHTML(book.isbn)}</strong></p>
        <p>Availability: <span class="badge ${statusBadgeClass(book.status)}">${escapeHTML(book.status)}</span></p>
        <p>Lifecycle stage: <strong>${escapeHTML(lifecycleStage(book))}</strong></p>
        ${expected}
        <p>Active reservations: <strong>${info.queue.length}</strong></p>
        <p>You choose the return date (1 to ${MAX_LOAN_DAYS} days). Late fine: <strong>${formatMoney(FINE_PER_DAY)} per day</strong> after the deadline.</p>
        <div class="form-actions">
          ${action}
          <button class="btn btn-outline" type="button" onclick="switchView('catalog-view')">Back to Catalog</button>
        </div>
        ${history}
      </div>
    </div>
  `;

  switchView("book-details-view");
  updateBorrowHint();
}

/* ---------- reservations ---------- */

function reserveBook(bookId) {
  if (!currentUser) {
    notify("Please sign in first.", "error");
    switchView("login-view");
    return;
  }
  if (!requireRole("Student")) return;

  /* step 1: Check Availability */
  const info = checkAvailability(bookId);
  if (info.state === "missing") {
    notify("Book not found.", "error");
    return;
  }
  if (info.state === "withdrawn") {
    notify("This book has been withdrawn and cannot be reserved.", "error");
    return;
  }
  if (info.state === "available") {
    notify("Good news: this book is available now. You can borrow it instead of reserving.", "warning");
    viewBookDetails(bookId);
    return;
  }
  if (info.state === "on-hold") {
    notify("A returned copy is already being held for the reservation queue.", "error");
    return;
  }

  if (loans.some(loan => loan.userId === currentUser.id && loan.bookId === bookId && loan.status === "Active")) {
    notify("You already borrowed this book.", "error");
    return;
  }
  if (info.queue.some(item => item.userId === currentUser.id)) {
    notify("You already reserved this book.", "error");
    return;
  }

  const activeCount = reservations.filter(item => item.userId === currentUser.id && item.status === "Active").length;
  if (activeCount >= MAX_RESERVATIONS) {
    notify("Maximum of " + MAX_RESERVATIONS + " active reservations reached.", "error");
    return;
  }

  /* step 2: place the hold */
  const reservation = {
    id: makeId("r", reservations),
    userId: currentUser.id,
    bookId,
    date: todayString(),
    createdAt: Date.now(),
    status: "Active"
  };

  reservations.push(reservation);
  if (!saveData()) {
    reservations = reservations.filter(item => item.id !== reservation.id);
    return;
  }

  recordEvent("Reserved", bookId, currentUser.id, "Queue position " + (info.queue.length + 1));
  renderAll();
  playSound("success");
  notify("Your reservation has been placed. You are #" + (info.queue.length + 1) + " in the queue.");
  viewBookDetails(bookId);
}

function cancelReservation(reservationId) {
  if (!requireRole("Student")) return;
  const reservation = reservations.find(item => item.id === reservationId && item.userId === currentUser.id && item.status === "Active");
  if (!reservation) {
    notify("Reservation not found.", "error");
    return;
  }
  if (!confirm("Are you sure you want to cancel this reservation?")) return;

  const previousStatus = getBook(reservation.bookId)?.status;
  reservation.status = "Cancelled";
  syncBookStatus(reservation.bookId);

  if (saveData()) {
    recordEvent("Hold Cancelled", reservation.bookId, currentUser.id, "");
    renderAll();
    notify("Reservation cancelled successfully.");
  } else {
    reservation.status = "Active";
    const book = getBook(reservation.bookId);
    if (book && previousStatus) book.status = previousStatus;
  }
}

function assignBookToHold(reservationId) {
  if (!requireRole("Librarian", "Admin")) return;

  const reservation = reservations.find(item => item.id === reservationId && item.status === "Active");
  if (!reservation) {
    notify("Active reservation not found.", "error");
    return;
  }
  const book = getBook(reservation.bookId);
  const user = getUser(reservation.userId);
  if (!book || !user) {
    notify("Book or member is no longer available.", "error");
    return;
  }

  const info = checkAvailability(book.id);
  if (info.state === "checked-out") {
    notify("This book has not been returned yet.", "error");
    return;
  }
  if (info.queue[0]?.id !== reservation.id) {
    notify("Please process the earliest reservation first.", "error");
    return;
  }

  const dueDate = addDays(todayString(), LOAN_PERIOD);
  if (!confirm("Assign \"" + book.title + "\" to " + user.name + "? Return date: " + formatDate(dueDate) + ".")) return;

  const loan = createLoan(user.id, book.id, dueDate, "Hold assigned by " + currentUser.role.toLowerCase());
  if (!loan) return;

  renderAll();
  playSound("success");
  notify("Reserved book assigned and checked out to " + user.name + ".");
}

/* ---------- member dashboard ---------- */

function renderMemberAlerts(myLoans, totalFines) {
  const box = document.getElementById("member-due-alerts");
  if (!box) return;

  const overdue = myLoans.filter(loan => getPenalty(loan).overdue);
  const soon = myLoans.filter(loan => {
    const penalty = getPenalty(loan);
    return !penalty.overdue && penalty.soon;
  });
  const ready = reservations.filter(item =>
    item.userId === currentUser.id &&
    item.status === "Active" &&
    getBook(item.bookId)?.status === "On Hold" &&
    getActiveReservations(item.bookId)[0]?.id === item.id
  );

  const parts = [];
  if (overdue.length) {
    parts.push(`
      <div class="alert-box alert-danger">
        <strong>⚠ ${overdue.length} overdue ${overdue.length === 1 ? "book" : "books"}</strong>
        <span>${overdue.map(loan => escapeHTML(bookLabel(loan.bookId))).join(", ")}.
        Penalty so far: <b>${formatMoney(totalFines)}</b> (${formatMoney(FINE_PER_DAY)} per day late). Please return the book and pay the fine.</span>
      </div>`);
  }
  if (soon.length) {
    parts.push(`
      <div class="alert-box alert-warning">
        <strong>⏰ Due soon</strong>
        <span>${soon.map(loan => escapeHTML(bookLabel(loan.bookId)) + " (" + dueWhenText(loan) + ")").join(", ")}.
        Return on time to avoid a penalty.</span>
      </div>`);
  }
  if (ready.length) {
    parts.push(`
      <div class="alert-box alert-info">
        <strong>📗 Your reserved book is ready</strong>
        <span>${ready.map(item => escapeHTML(bookLabel(item.bookId))).join(", ")} can be borrowed now. Open My Reservations to choose your return date.</span>
      </div>`);
  }
  box.innerHTML = parts.join("");
}

function renderMemberDashboard() {
  if (!currentUser || currentUser.role !== "Student") return;

  setText("member-welcome-name", currentUser.name);

  const myLoans = loans.filter(loan => loan.userId === currentUser.id && loan.status === "Active");
  const myHistory = loans.filter(loan => loan.userId === currentUser.id && loan.status === "Returned");
  const myHolds = reservations.filter(item => item.userId === currentUser.id && item.status === "Active");
  const myPayments = payments
    .filter(item => item.userId === currentUser.id)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const totalFines = outstandingFinesFor(currentUser.id);

  setText("member-active-loans-count", myLoans.length);
  setText("member-reservations-count", myHolds.length);
  setText("member-total-fines", formatMoney(totalFines));

  const payBtn = document.getElementById("pay-fines-btn");
  if (payBtn) payBtn.style.display = totalFines > 0 ? "inline-flex" : "none";

  renderMemberAlerts(myLoans, totalFines);

  const loansTbody = document.getElementById("member-loans-tbody");
  if (loansTbody) {
    loansTbody.innerHTML = myLoans.length
      ? myLoans.map(loan => {
          const penalty = getPenalty(loan);
          const unpaidFine = unpaidFineFor(loan);
          const fineState = unpaidFine > 0
            ? '<span class="badge-unpaid">Unpaid</span>'
            : (penalty.overdue ? '<span class="badge-paid">Paid</span>' : "");
          return `
            <tr>
              <td><strong>${escapeHTML(bookLabel(loan.bookId))}</strong></td>
              <td>${formatDate(loan.issueDate)}</td>
              <td>${formatDueCell(loan)}</td>
              <td>${formatMoney(unpaidFine)} ${fineState}</td>
              <td>${loanStatusBadge(loan)}</td>
              <td>${unpaidFine > 0 ? `<button class="btn btn-primary btn-sm" type="button" onclick="openPaymentModal('${escapeHTML(loan.id)}')">💳 Pay Fine</button>` : "—"}</td>
            </tr>
          `;
        }).join("")
      : emptyRow(6, "You currently have no active loans.");
  }

  const historyTbody = document.getElementById("member-history-tbody");
  if (historyTbody) {
    historyTbody.innerHTML = myHistory.length
      ? myHistory
          .slice()
          .sort((a, b) => String(b.returnDate).localeCompare(String(a.returnDate)))
          .map(loan => `
            <tr>
              <td><strong>${escapeHTML(bookLabel(loan.bookId))}</strong></td>
              <td>${formatDate(loan.issueDate)}</td>
              <td>${formatDate(loan.returnDate)}</td>
              <td>${formatMoney(loan.finePaid)}</td>
            </tr>
          `).join("")
      : emptyRow(4, "No borrowing history yet.");
  }

  const holdsTbody = document.getElementById("member-holds-tbody");
  if (holdsTbody) {
    holdsTbody.innerHTML = myHolds.length
      ? myHolds.map(hold => {
          const book = getBook(hold.bookId);
          const queue = getActiveReservations(hold.bookId);
          const position = queue.findIndex(item => item.id === hold.id) + 1;
          const ready = book?.status === "On Hold" && position === 1;
          return `
            <tr>
              <td><strong>${escapeHTML(book?.title || "Unknown")}</strong></td>
              <td>${formatDate(hold.date)}</td>
              <td>#${position}</td>
              <td>
                ${ready
                  ? `<button class="btn btn-primary btn-sm" type="button" onclick="viewBookDetails('${escapeHTML(hold.bookId)}')">Borrow Now</button>`
                  : '<span class="badge badge-warning">Waiting for return</span>'}
                <button class="btn btn-outline btn-sm" type="button" onclick="cancelReservation('${escapeHTML(hold.id)}')">Cancel</button>
              </td>
            </tr>
          `;
        }).join("")
      : emptyRow(4, "You have no active reservations.");
  }

  const paymentsTbody = document.getElementById("member-payments-tbody");
  if (paymentsTbody) {
    paymentsTbody.innerHTML = myPayments.length
      ? myPayments.map(item => `
          <tr>
            <td><strong>${escapeHTML(item.reference)}</strong></td>
            <td>${formatDateTime(item.date)}</td>
            <td>${escapeHTML(item.method)}</td>
            <td>${formatMoney(item.amount)}</td>
          </tr>
        `).join("")
      : emptyRow(4, "No payments yet.");
  }
}

/* ---------- librarian desk ---------- */

function renderStaffAlerts(containerId, includeApprovals) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const overdue = loans.filter(loan => loan.status === "Active" && getPenalty(loan).overdue);
  const fines = round2(overdue.reduce((sum, loan) => sum + unpaidFineFor(loan), 0));
  const waiting = reservations.filter(item =>
    item.status === "Active" &&
    getBook(item.bookId)?.status === "On Hold" &&
    getActiveReservations(item.bookId)[0]?.id === item.id
  );
  const pending = includeApprovals ? users.filter(user => user.status === "Pending") : [];

  const parts = [];
  if (overdue.length) {
    parts.push(`<div class="alert-box alert-danger"><strong>⚠ ${overdue.length} overdue ${overdue.length === 1 ? "book" : "books"}</strong><span>Unpaid penalties: <b>${formatMoney(fines)}</b>. Collect the books and fines at the desk.</span></div>`);
  }
  if (waiting.length) {
    parts.push(`<div class="alert-box alert-info"><strong>📗 ${waiting.length} reserved ${waiting.length === 1 ? "book is" : "books are"} ready</strong><span>Assign the book to the student at the front of the queue.</span></div>`);
  }
  if (pending.length) {
    parts.push(`<div class="alert-box alert-warning"><strong>👤 ${pending.length} membership ${pending.length === 1 ? "request" : "requests"} waiting</strong><span>Open the Users tab to approve or reject new members.</span></div>`);
  }
  box.innerHTML = parts.join("");
}

function renderLibrarianDashboard() {
  if (!currentUser || !["Librarian", "Admin"].includes(currentUser.role)) return;

  populateIssueDropdowns("lib-issue");
  renderStaffAlerts("librarian-alerts", false);

  const tbody = document.getElementById("librarian-reservations-tbody");
  if (tbody) {
    const activeHolds = reservations
      .filter(item => item.status === "Active")
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || String(a.date).localeCompare(String(b.date)));

    tbody.innerHTML = activeHolds.length
      ? activeHolds.map(hold => {
          const info = checkAvailability(hold.bookId);
          const first = info.queue[0];
          const position = info.queue.findIndex(item => item.id === hold.id) + 1;
          let action;
          if (first?.id === hold.id && info.state === "on-hold") {
            action = `<button class="btn btn-primary btn-sm" type="button" onclick="assignBookToHold('${escapeHTML(hold.id)}')">Assign Book</button>`;
          } else if (info.loan) {
            action = `<span class="badge badge-warning">Waiting · back ${formatDate(info.loan.dueDate)}</span>`;
          } else {
            action = `<span class="badge badge-warning">Queue #${position}</span>`;
          }
          return `
            <tr>
              <td><strong>${escapeHTML(userLabel(hold.userId))}</strong></td>
              <td>${escapeHTML(bookLabel(hold.bookId))}</td>
              <td>${formatDate(hold.date)} · #${position}</td>
              <td>${action}</td>
            </tr>
          `;
        }).join("")
      : emptyRow(4, "No pending reservations.");
  }

  const loansBody = document.getElementById("librarian-loans-tbody");
  if (loansBody) {
    const activeLoans = loans.filter(loan => loan.status === "Active");
    loansBody.innerHTML = activeLoans.length
      ? activeLoans.map(loan => `
          <tr>
            <td><strong>${escapeHTML(userLabel(loan.userId))}</strong></td>
            <td>${escapeHTML(bookLabel(loan.bookId))}</td>
            <td>${formatDueCell(loan)}</td>
            <td>${loanStatusBadge(loan)} ${formatMoney(unpaidFineFor(loan))}</td>
            <td><button class="btn btn-primary btn-sm" type="button" onclick="returnBook('${escapeHTML(loan.id)}')">Check In</button></td>
          </tr>
        `).join("")
      : emptyRow(5, "No active borrowing transactions.");
  }
}

function returnBook(loanId) {
  if (!requireRole("Admin", "Librarian")) return;

  const loan = loans.find(item => item.id === loanId && item.status === "Active");
  if (!loan) {
    notify("Active loan not found.", "error");
    return;
  }

  const book = getBook(loan.bookId);
  const penalty = getPenalty(loan);
  const unpaidFine = unpaidFineFor(loan);
  const previousFinePaid = loan.finePaid || 0;
  const previousBookStatus = book ? book.status : null;
  let payment = null;

  if (unpaidFine > 0) {
    if (!confirm("This book is " + penalty.label + " overdue. Unpaid penalty: " + formatMoney(unpaidFine) + ". Collect the fine at the desk and check the book in?")) {
      return;
    }
    loan.finePaid = round2(previousFinePaid + unpaidFine);
    payment = {
      id: makeId("p", payments),
      reference: makeReference(),
      userId: loan.userId,
      loanIds: [loan.id],
      amount: unpaidFine,
      method: "Library Desk Cash",
      account: "Collected at return",
      date: new Date().toISOString()
    };
    payments.push(payment);
  }

  loan.status = "Returned";
  loan.returnDate = todayString();
  if (book) syncBookStatus(book.id);

  if (!saveData()) {
    loan.status = "Active";
    loan.returnDate = null;
    loan.finePaid = previousFinePaid;
    if (payment) payments = payments.filter(item => item.id !== payment.id);
    if (book && previousBookStatus) book.status = previousBookStatus;
    return;
  }

  const wasLate = penalty.overdue;
  recordEvent(
    wasLate ? "Returned" : "Returned",
    loan.bookId,
    loan.userId,
    wasLate ? "Returned " + penalty.label + " late · penalty " + formatMoney(unpaidFine) : "Returned on time"
  );

  const nextInQueue = book ? getActiveReservations(book.id)[0] : null;
  if (nextInQueue) {
    recordEvent("Pending Hold", loan.bookId, nextInQueue.userId, "Held for the next student in the queue");
  }

  renderAll();
  playSound("success");
  notify(
    "Book checked in successfully." +
    (nextInQueue ? " It is now on hold for " + userLabel(nextInQueue.userId) + "." : "")
  );
}

/* ---------- admin dashboard ---------- */

function renderAdminDashboard() {
  if (!currentUser || currentUser.role !== "Admin") return;

  const activeLoans = loans.filter(loan => loan.status === "Active");
  const overdueCount = activeLoans.filter(loan => getPenalty(loan).overdue).length;
  const totalFinesCollected = loans.reduce((sum, loan) => sum + Number(loan.finePaid || 0), 0);
  const pendingUsers = users.filter(user => user.status === "Pending").length;

  setText("admin-total-books", books.length);
  setText("admin-issued-books", activeLoans.length);
  setText("admin-overdue-books", overdueCount);
  setText("admin-total-users", users.filter(user => user.role === "Student").length);
  setText("admin-total-fines", formatMoney(totalFinesCollected));
  setText("admin-users-tab-btn", pendingUsers ? "Users (" + pendingUsers + " pending)" : "Users");

  populateIssueDropdowns("issue");
  renderStaffAlerts("admin-alerts", true);
  renderAdminLoans(activeLoans);
  renderAdminInventory();
  renderAdminUsers();
  renderAdminPayments();
  renderAdminInsights();
}

function renderAdminUsers() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  tbody.innerHTML = users.length
    ? users.map(user => {
        const id = escapeHTML(user.id);
        let actions = "—";
        if (user.role !== "Admin") {
          if (user.status === "Pending") {
            actions = `<button class="btn btn-primary btn-sm" type="button" onclick="setUserStatus('${id}','Active')">Approve</button>
                       <button class="btn btn-outline btn-sm" type="button" onclick="setUserStatus('${id}','Blocked')">Reject</button>`;
          } else if (user.status === "Active") {
            actions = `<button class="btn btn-outline btn-sm" type="button" onclick="setUserStatus('${id}','Blocked')">Block</button>`;
          } else {
            actions = `<button class="btn btn-outline btn-sm" type="button" onclick="setUserStatus('${id}','Active')">Unblock</button>`;
          }
        }
        let records = "—";
        if (user.role === "Student") {
          const total = loans.filter(loan => loan.userId === user.id).length;
          records = `${activeLoanCount(user.id)} active · ${total} total · fine ${formatMoney(outstandingFinesFor(user.id))}`;
        }
        return `
          <tr>
            <td><strong>${escapeHTML(user.name)}</strong>${user.registeredAt ? `<br><small>Registered ${formatDate(user.registeredAt)}</small>` : ""}</td>
            <td>${escapeHTML(user.email)}</td>
            <td><span class="role-chip role-${escapeHTML(String(user.role).toLowerCase())}">${escapeHTML(user.role)}</span></td>
            <td><span class="badge ${userBadgeClass(user.status)}">${escapeHTML(user.status)}</span></td>
            <td>${records}</td>
            <td>${actions}</td>
          </tr>
        `;
      }).join("")
    : emptyRow(6, "No registered users.");
}

function setUserStatus(userId, status) {
  if (!requireRole("Admin")) return;
  const user = getUser(userId);
  if (!user || user.role === "Admin") return;

  const wasPending = user.status === "Pending";
  if (status === "Blocked" && !confirm((wasPending ? "Reject " : "Block ") + user.name + "?")) return;

  const previous = user.status;
  user.status = status;
  if (!saveData()) {
    user.status = previous;
    return;
  }

  renderAll();
  if (status === "Active") {
    notify(wasPending ? user.name + " has been approved as a member." : user.name + " has been unblocked.");
  } else {
    notify(user.name + (wasPending ? " was rejected." : " has been blocked."));
  }
}

/* ---------- inventory CRUD with cover upload ---------- */

let editingBookId = null;
let pendingCover = "";

function refreshCoverPreview() {
  const preview = document.getElementById("book-cover-preview");
  if (!preview) return;
  const urlValue = (document.getElementById("book-cover-input")?.value || "").trim();
  const existing = editingBookId ? getBook(editingBookId)?.cover : "";
  const source = pendingCover || urlValue || existing || "";
  if (source) {
    preview.src = source;
    preview.style.display = "block";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
  }
}

function handleCoverFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    pendingCover = "";
    refreshCoverPreview();
    return;
  }
  if (!file.type.startsWith("image/")) {
    notify("Please choose an image file (JPG, PNG or WEBP).", "error");
    event.target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    notify("The image is too large. Please choose a file under 5 MB.", "error");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      /* shrink the picture so it fits in browser storage */
      const scale = Math.min(1, 480 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      pendingCover = canvas.toDataURL("image/jpeg", 0.82);
      refreshCoverPreview();
    };
    image.onerror = () => notify("That image could not be read.", "error");
    image.src = reader.result;
  };
  reader.onerror = () => notify("That file could not be read.", "error");
  reader.readAsDataURL(file);
}

function resetBookForm() {
  const form = document.getElementById("add-book-form");
  if (form) form.reset();
  editingBookId = null;
  pendingCover = "";
  setText("book-form-title", "Add New Book");
  setText("book-save-btn", "Add Book");
  const cancel = document.getElementById("book-cancel-btn");
  if (cancel) cancel.style.display = "none";
  refreshCoverPreview();
}

function editBook(bookId) {
  if (!requireRole("Admin")) return;
  const book = getBook(bookId);
  if (!book) {
    notify("Book not found.", "error");
    return;
  }

  editingBookId = bookId;
  pendingCover = "";
  document.getElementById("book-title-input").value = book.title;
  document.getElementById("book-author-input").value = book.author;
  document.getElementById("book-category-input").value = book.category;
  document.getElementById("book-genre-input").value = book.genre || "";
  document.getElementById("book-isbn-input").value = book.isbn;
  document.getElementById("book-no-input").value = book.bookNo || "";
  const isLink = /^https?:\/\//i.test(book.cover || "");
  document.getElementById("book-cover-input").value = isLink ? book.cover : "";
  const file = document.getElementById("book-cover-file");
  if (file) file.value = "";

  setText("book-form-title", "Edit Book · " + book.bookNo);
  setText("book-save-btn", "Save Changes");
  const cancel = document.getElementById("book-cancel-btn");
  if (cancel) cancel.style.display = "inline-flex";
  refreshCoverPreview();

  const form = document.getElementById("add-book-form");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleSaveBook(event) {
  event.preventDefault();
  if (!requireRole("Admin")) return;

  const title = document.getElementById("book-title-input").value.trim();
  const author = document.getElementById("book-author-input").value.trim();
  const category = document.getElementById("book-category-input").value;
  const genre = document.getElementById("book-genre-input").value.trim() || category;
  const isbn = document.getElementById("book-isbn-input").value.trim();
  const bookNoInput = document.getElementById("book-no-input").value.trim().toUpperCase();
  const coverUrl = document.getElementById("book-cover-input").value.trim();

  if (!title || !author || !isbn) {
    notify("Title, author and ISBN are required.", "error");
    return;
  }
  if (coverUrl && !/^https?:\/\//i.test(coverUrl)) {
    notify("Cover link must start with http:// or https://", "error");
    return;
  }

  const others = books.filter(book => book.id !== editingBookId);
  if (others.some(book => String(book.isbn).replace(/-/g, "") === isbn.replace(/-/g, ""))) {
    notify("A book with this ISBN already exists.", "error");
    return;
  }
  if (bookNoInput && others.some(book => String(book.bookNo).toUpperCase() === bookNoInput)) {
    notify("This book number is already used.", "error");
    return;
  }

  if (editingBookId) {
    const book = getBook(editingBookId);
    const snapshot = { ...book };
    Object.assign(book, {
      title, author, category, genre, isbn,
      bookNo: bookNoInput || book.bookNo,
      cover: pendingCover || coverUrl || book.cover || DEFAULT_COVER
    });
    if (!saveData()) {
      Object.assign(book, snapshot);
      return;
    }
    recordEvent("Updated", book.id, null, "Book details edited");
    resetBookForm();
    renderAll();
    playSound("success");
    notify("Book updated successfully.");
    return;
  }

  const newBook = {
    id: makeId("b", books),
    bookNo: bookNoInput || nextBookNo(),
    title, author, category, genre, isbn,
    status: "Available",
    cover: pendingCover || coverUrl || DEFAULT_COVER
  };

  books.push(newBook);
  if (!saveData()) {
    books = books.filter(book => book.id !== newBook.id);
    return;
  }

  recordEvent("New Record", newBook.id, null, "Added to the catalog as " + newBook.bookNo);
  resetBookForm();
  renderAll();
  playSound("success");
  notify("New book added successfully.");
}

function renderAdminInventory() {
  const tbody = document.getElementById("admin-inventory-tbody");
  if (!tbody) return;

  const list = document.getElementById("genre-options");
  if (list) {
    const genres = [...new Set(books.map(book => book.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    list.innerHTML = genres.map(genre => `<option value="${escapeHTML(genre)}"></option>`).join("");
  }

  tbody.innerHTML = books.length
    ? books.map(book => {
        const id = escapeHTML(book.id);
        const withdrawn = book.status === "Withdrawn";
        return `
          <tr>
            <td><img class="inventory-cover" src="${escapeHTML(book.cover)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_COVER}'"></td>
            <td><strong>${escapeHTML(book.title)}</strong><br><small>${escapeHTML(book.author)}</small></td>
            <td>${escapeHTML(book.bookNo)}</td>
            <td>${escapeHTML(book.category)}<br><small>${escapeHTML(book.genre)}</small></td>
            <td>${escapeHTML(book.isbn)}</td>
            <td><span class="badge ${statusBadgeClass(book.status)}">${escapeHTML(book.status)}</span></td>
            <td class="action-cell">
              <button class="btn btn-outline btn-sm" type="button" onclick="editBook('${id}')">Edit</button>
              <button class="btn btn-outline btn-sm" type="button" onclick="toggleWithdraw('${id}')">${withdrawn ? "Restore" : "Withdraw"}</button>
              <button class="btn btn-outline btn-sm" type="button" onclick="deleteBook('${id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join("")
    : emptyRow(7, "No books in inventory.");
}

function toggleWithdraw(bookId) {
  if (!requireRole("Admin")) return;
  const book = getBook(bookId);
  if (!book) return;

  if (book.status === "Withdrawn") {
    book.status = "Available";
    syncBookStatus(book.id);
    if (!saveData()) {
      book.status = "Withdrawn";
      return;
    }
    recordEvent("Restored", book.id, null, "Returned to the collection");
    renderAll();
    notify("\"" + book.title + "\" is back in the collection.");
    return;
  }

  if (getActiveLoans(book.id).length) {
    notify("This book is checked out. Check it in first, then withdraw it.", "error");
    return;
  }
  const holds = getActiveReservations(book.id);
  if (!confirm("Withdraw \"" + book.title + "\" from the collection?" + (holds.length ? " " + holds.length + " reservation(s) will be cancelled." : ""))) return;

  const previous = book.status;
  holds.forEach(hold => { hold.status = "Cancelled"; });
  book.status = "Withdrawn";
  if (!saveData()) {
    book.status = previous;
    holds.forEach(hold => { hold.status = "Active"; });
    return;
  }
  recordEvent("Withdrawn", book.id, null, "Removed from circulation");
  renderAll();
  notify("Book withdrawn from the collection.");
}

function deleteBook(bookId) {
  if (!requireRole("Admin")) return;
  const book = getBook(bookId);
  if (!book) return;

  if (getActiveLoans(bookId).length > 0) {
    notify("Cannot delete a book that is currently checked out.", "error");
    return;
  }
  if (loans.some(loan => loan.bookId === bookId)) {
    notify("This book has borrowing history. Withdraw it instead so no record is lost.", "error");
    return;
  }
  if (!confirm("Permanently delete \"" + book.title + "\"?")) return;

  const previousBooks = books;
  const previousReservations = reservations;
  books = books.filter(item => item.id !== bookId);
  reservations = reservations.filter(item => item.bookId !== bookId);
  if (!saveData()) {
    books = previousBooks;
    reservations = previousReservations;
    return;
  }

  if (editingBookId === bookId) resetBookForm();
  renderAll();
  notify("Book deleted successfully.");
}

/* ---------- admin insights: fines, popular books, genres, lifecycle ---------- */

function exportBackup() {
  if (!requireRole("Admin")) return;
  const data = { exportedAt: new Date().toISOString(), books, users, loans, reservations, payments, activity };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "libcentral-backup-" + todayString() + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  notify("Backup file downloaded.");
}

function dueSortKey(loan) {
  if (loan.dueAt) return Number(loan.dueAt);
  const due = parseLocalDate(loan.dueDate);
  return due ? due.getTime() : 0;
}

function renderAdminInsights() {
  const active = loans.filter(loan => loan.status === "Active");
  const overdue = active.filter(loan => getPenalty(loan).overdue);
  const outstanding = round2(active.reduce((sum, loan) => sum + unpaidFineFor(loan), 0));
  const collected = round2(loans.reduce((sum, loan) => sum + Number(loan.finePaid || 0), 0));

  setText("ins-outstanding-fines", formatMoney(outstanding));
  setText("ins-collected-fines", formatMoney(collected));
  setText("ins-overdue", overdue.length);
  setText("ins-pending-returns", active.length);

  /* most requested genres (borrows + reservations) */
  const genreCounts = {};
  const genreCategory = {};
  const addRequest = bookId => {
    const book = getBook(bookId);
    if (!book) return;
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
    genreCategory[book.genre] = book.category;
  };
  loans.forEach(loan => addRequest(loan.bookId));
  reservations.forEach(item => addRequest(item.bookId));

  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxGenre = topGenres.length ? topGenres[0][1] : 1;
  const bars = document.getElementById("ins-genre-bars");
  if (bars) {
    bars.innerHTML = topGenres.length
      ? topGenres.map(([genre, count]) => `
          <div class="bar-row">
            <span class="bar-label">${escapeHTML(genre)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max(6, Math.round(count / maxGenre * 100))}%;--cat:${CATEGORY_COLORS[genreCategory[genre]] || "#176b57"}"></div></div>
            <strong>${count}</strong>
          </div>`).join("")
      : '<p class="muted-note">No borrowing or reservation data yet.</p>';
  }

  /* popular books */
  const stats = {};
  const bump = (bookId, key) => {
    stats[bookId] = stats[bookId] || { borrowed: 0, reserved: 0 };
    stats[bookId][key] += 1;
  };
  loans.forEach(loan => bump(loan.bookId, "borrowed"));
  reservations.forEach(item => bump(item.bookId, "reserved"));
  const popular = Object.entries(stats)
    .filter(([bookId]) => getBook(bookId))
    .sort((a, b) => (b[1].borrowed + b[1].reserved) - (a[1].borrowed + a[1].reserved))
    .slice(0, 5);
  const popularBody = document.getElementById("ins-popular-tbody");
  if (popularBody) {
    popularBody.innerHTML = popular.length
      ? popular.map(([bookId, count], index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHTML(bookLabel(bookId))}</strong><br><small>${escapeHTML(getBook(bookId).genre)}</small></td>
            <td>${count.borrowed}</td>
            <td>${count.reserved}</td>
          </tr>`).join("")
      : emptyRow(4, "No data yet.");
  }

  /* active members */
  const members = users
    .filter(user => user.role === "Student")
    .map(user => ({
      user,
      active: activeLoanCount(user.id),
      total: loans.filter(loan => loan.userId === user.id).length,
      fine: outstandingFinesFor(user.id)
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.active - a.active || b.total - a.total)
    .slice(0, 5);
  const memberBody = document.getElementById("ins-members-tbody");
  if (memberBody) {
    memberBody.innerHTML = members.length
      ? members.map(item => `
          <tr>
            <td><strong>${escapeHTML(item.user.name)}</strong></td>
            <td>${item.active}</td>
            <td>${item.total}</td>
            <td>${formatMoney(item.fine)}</td>
          </tr>`).join("")
      : emptyRow(4, "No member activity yet.");
  }

  /* pending returns with automatic penalty */
  const pending = active.slice().sort((a, b) =>
    Number(getPenalty(b).overdue) - Number(getPenalty(a).overdue) || dueSortKey(a) - dueSortKey(b)
  );
  const pendingBody = document.getElementById("ins-pending-tbody");
  if (pendingBody) {
    pendingBody.innerHTML = pending.length
      ? pending.map(loan => `
          <tr>
            <td><strong>${escapeHTML(userLabel(loan.userId))}</strong></td>
            <td>${escapeHTML(bookLabel(loan.bookId))}</td>
            <td>${formatDueCell(loan)}</td>
            <td>${loanStatusBadge(loan)}</td>
            <td>${formatMoney(unpaidFineFor(loan))}</td>
          </tr>`).join("")
      : emptyRow(5, "No pending returns.");
  }

  /* lifecycle log */
  const logBody = document.getElementById("ins-log-tbody");
  if (logBody) {
    const recent = activity.slice(-15).reverse();
    logBody.innerHTML = recent.length
      ? recent.map(item => `
          <tr>
            <td>${formatDateTime(item.date)}</td>
            <td><span class="badge ${eventBadgeClass(item.type)}">${escapeHTML(item.type)}</span></td>
            <td>${escapeHTML(item.bookId ? bookLabel(item.bookId) : "—")}</td>
            <td>${escapeHTML(item.userId ? userLabel(item.userId) : "—")}</td>
            <td>${escapeHTML(item.note || "")}</td>
          </tr>`).join("")
      : emptyRow(5, "No lifecycle activity recorded yet.");
  }
}

/* ---------- startup ---------- */

function tick() {
  const changed = flagOverdueLoans();
  refreshTestLoans();
  if (changed && currentUser && currentUser.role !== "Student") renderAll();
}

function initialize() {
  if (currentUser && currentUser.status !== "Active") currentUser = null;
  books.forEach(book => syncBookStatus(book.id));
  flagOverdueLoans();
  saveData();
  updateAuthUI();
  updateSoundButtons();
  renderAll();
  setupNavigation();
  setupCatalogEvents();
  setupModalEvents();
  updateNavigationActive("home-view");

  /* browsers only allow sound after a click or tap, so unlock audio on the first one */
  document.addEventListener("pointerdown", () => {
    if (soundEnabled) getAudioContext();
  }, { once: true });

  const coverUrl = document.getElementById("book-cover-input");
  if (coverUrl) coverUrl.addEventListener("input", refreshCoverPreview);

  /* keep countdowns, fines and overdue alerts live */
  setInterval(tick, 5000);
}

/* ---------- password hashing and profile management ---------- */

async function hashPassword(userId, plain) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const bytes = new TextEncoder().encode("libcentral|" + userId + "|" + plain);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
      return "sha256:" + hex;
    }
  } catch (error) {
    console.warn("Password hashing unavailable:", error);
  }
  return plain;
}

async function passwordMatches(user, plain) {
  const stored = String(user.password || "");
  if (stored.startsWith("sha256:")) {
    return stored === await hashPassword(user.id, plain);
  }
  return stored === plain;
}

function renderProfile() {
  if (!currentUser) return;
  const set = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  };
  set("profile-name", currentUser.name);
  set("profile-email", currentUser.email);
  set("profile-role", currentUser.role);
  set("profile-current-password", "");
  set("profile-new-password", "");
  set("profile-confirm-password", "");
  setText("profile-avatar", getInitials(currentUser.name));
  setText("profile-heading-name", currentUser.name);

  const summary = document.getElementById("profile-summary");
  if (!summary) return;
  if (currentUser.role === "Student") {
    const total = loans.filter(loan => loan.userId === currentUser.id).length;
    summary.innerHTML = `
      <div class="receipt-row"><span>Member since</span><strong>${currentUser.registeredAt ? formatDate(currentUser.registeredAt) : "—"}</strong></div>
      <div class="receipt-row"><span>Borrowing now</span><strong>${activeLoanCount(currentUser.id)} of ${MAX_LOANS}</strong></div>
      <div class="receipt-row"><span>Total borrowed</span><strong>${total}</strong></div>
      <div class="receipt-row"><span>Unpaid fines</span><strong>${formatMoney(outstandingFinesFor(currentUser.id))}</strong></div>`;
  } else {
    summary.innerHTML = `<div class="receipt-row"><span>Account type</span><strong>${escapeHTML(currentUser.role)}</strong></div>`;
  }
}

async function handleProfileSave(event) {
  event.preventDefault();
  if (!requireRole("Student", "Librarian", "Admin")) return;

  const name = document.getElementById("profile-name").value.trim();
  const email = document.getElementById("profile-email").value.trim().toLowerCase();
  const current = document.getElementById("profile-current-password").value;
  const next = document.getElementById("profile-new-password").value;
  const confirmNext = document.getElementById("profile-confirm-password").value;

  if (name.length < 2) {
    notify("Please enter your full name.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    notify("Please enter a valid email address.", "error");
    return;
  }
  if (users.some(user => user.id !== currentUser.id && String(user.email).toLowerCase() === email)) {
    notify("That email is used by another account.", "error");
    return;
  }

  const emailChanged = email !== String(currentUser.email).toLowerCase();
  const passwordChanged = next.length > 0;

  if (passwordChanged) {
    if (next.length < 6) {
      notify("The new password must have at least 6 characters.", "error");
      return;
    }
    if (next !== confirmNext) {
      notify("The new passwords do not match.", "error");
      return;
    }
  }
  if ((emailChanged || passwordChanged) && !(await passwordMatches(currentUser, current))) {
    notify("Enter your current password to change your email or password.", "error");
    return;
  }

  const user = getUser(currentUser.id);
  const snapshot = { ...user };
  user.name = name;
  user.email = email;
  if (passwordChanged) user.password = await hashPassword(user.id, next);

  if (!saveData()) {
    Object.assign(user, snapshot);
    return;
  }

  currentUser = user;
  updateAuthUI();
  renderAll();
  renderProfile();
  playSound("success");
  notify("Your profile has been updated.");
}