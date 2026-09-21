// 1. DATA FLASH CARDS (Array of Objects)
const flashcardsData = [
  {
    question: "Apa singkatan dari HTML?",
    answer: "HyperText Markup Language",
  },
  {
    question: "Properti CSS apa yang digunakan untuk membuat layout grid 2 dimensi?",
    answer: "display: grid;",
  },
  {
    question: "Method JavaScript apa yang digunakan untuk menambahkan elemen di akhir Array?",
    answer: ".push()",
  },
  {
    question: "Apa fungsi dari atribut 'defer' pada tag <script>?",
    answer: "Menunda eksekusi skrip hingga seluruh dokumen HTML selesai di-parse.",
  },
  {
    question: "Method DOM apa yang digunakan untuk mendengarkan event seperti click?",
    answer: "addEventListener()",
  },
];

// 2. SELEKSI ELEMEN DOM
const cardScene = document.querySelector(".card-scene");
const flashcard = document.getElementById("flashcard");
const cardQuestion = document.getElementById("card-question");
const cardAnswer = document.getElementById("card-answer");
const progressIndicator = document.getElementById("progress-indicator");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const flipBtn = document.getElementById("flip-btn");

// 3. STATE APLIKASI
let currentIndex = 0;

// 4. FUNGSI RENDER KARTU & INDIKATOR
function renderCard() {
  // Pastikan kartu kembali ke sisi depan (pertanyaan) setiap kali berganti kartu
  flashcard.classList.remove("flipped");

  // Ambil data kartu aktif
  const currentCard = flashcardsData[currentIndex];

  // Beri sedikit jeda rotasi jika sedang terbalik, lalu update isi teks
  setTimeout(() => {
    cardQuestion.textContent = currentCard.question;
    cardAnswer.textContent = currentCard.answer;
    progressIndicator.textContent = `${currentIndex + 1} / ${flashcardsData.length}`;

    // Control State Tombol Navigasi
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === flashcardsData.length - 1;
  }, 150);
}

// 5. FUNGSI FLIP KARTU
function toggleFlip() {
  flashcard.classList.toggle("flipped");
}

// 6. EVENT LISTENERS
// Toggle flip saat klik langsung pada area kartu
cardScene.addEventListener("click", toggleFlip);

// Toggle flip saat klik tombol "Balik Kartu"
flipBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Mencegah double trigger dari event click cardScene
  toggleFlip();
});

// Navigasi Kartu Sebelumnya
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
});

// Navigasi Kartu Selanjutnya
nextBtn.addEventListener("click", () => {
  if (currentIndex < flashcardsData.length - 1) {
    currentIndex++;
    renderCard();
  }
});

// Support Navigasi Keyboard (Panah Kiri, Panah Kanan, Spasi untuk Flip)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && !prevBtn.disabled) {
    currentIndex--;
    renderCard();
  } else if (e.key === "ArrowRight" && !nextBtn.disabled) {
    currentIndex++;
    renderCard();
  } else if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    toggleFlip();
  }
});

// 7. INITIAL RENDER
renderCard();
