// 1. SELEKSI ELEMEN DOM
const cookieBanner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("accept-btn");
const declineBtn = document.getElementById("decline-btn");
const resetBtn = document.getElementById("reset-btn");
const cookieStatus = document.getElementById("cookie-status");

// Nama key yang digunakan di localStorage
const STORAGE_KEY = "user_cookie_consent";

// 2. FUNGSI UNTUK MENG-UPDATE TAMPILAN STATUS DAN BANNER
function checkCookieConsent() {
  const consentValue = localStorage.getItem(STORAGE_KEY);

  if (consentValue) {
    // Jika data sudah ada di localStorage, sembunyikan banner
    cookieBanner.classList.remove("show");
    cookieStatus.textContent = consentValue === "accepted" ? "Disetujui (Accepted)" : "Ditolak (Declined)";
    cookieStatus.style.color = consentValue === "accepted" ? "#16a34a" : "#dc2626";
  } else {
    // Jika data belum ada, tampilkan banner cookie
    cookieBanner.classList.add("show");
    cookieStatus.textContent = "Belum Ditentukan";
    cookieStatus.style.color = "#64748b";
  }
}

// 3. FUNGSI UNTUK MENYIMPAN KEPUTUSAN KE LOCALSTORAGE
function setConsent(status) {
  localStorage.setItem(STORAGE_KEY, status);
  checkCookieConsent();
}

// 4. EVENT LISTENERS
acceptBtn.addEventListener("click", () => {
  setConsent("accepted");
});

declineBtn.addEventListener("click", () => {
  setConsent("declined");
});

// Fitur Reset khusus pengujian
resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  checkCookieConsent();
});

// 5. JALANKAN PENGECEKAN AWAL SAAT HALAMAN DILOAD
checkCookieConsent();
