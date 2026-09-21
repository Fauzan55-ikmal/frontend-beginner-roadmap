// 1. SELEKSI ELEMEN DOM
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");

// 2. KONFIGURASI BATAS KARAKTER
const MAX_CHARS = 200;
const WARNING_THRESHOLD = 180; // Ditrigger saat karakter mencapai 180 (90%)

// 3. FUNGSI UPDATE PENGHITUNG KARAKTER & KONDISI VISUAL
function updateCounter() {
  const currentLength = messageInput.value.length;

  // A. Update Teks Counter di DOM
  charCount.textContent = `${currentLength} / ${MAX_CHARS} karakter`;

  // B. Reset Class Dahulu
  messageInput.classList.remove("warning", "limit-reached");
  charCount.classList.remove("warning", "limit-reached");

  // C. Pengondisian Status Visual berdasarkan Jumlah Karakter
  if (currentLength >= MAX_CHARS) {
    messageInput.classList.add("limit-reached");
    charCount.classList.add("limit-reached");
  } else if (currentLength >= WARNING_THRESHOLD) {
    messageInput.classList.add("warning");
    charCount.classList.add("warning");
  }
}

// 4. EVENT LISTENER PADA TEXTAREA
messageInput.addEventListener("input", updateCounter);
