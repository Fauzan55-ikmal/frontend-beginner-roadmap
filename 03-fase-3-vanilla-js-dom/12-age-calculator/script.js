// 1. SELEKSI ELEMEN DOM
const ageForm = document.getElementById("age-form");
const dayInput = document.getElementById("day-input");
const monthInput = document.getElementById("month-input");
const yearInput = document.getElementById("year-input");

const groupDay = document.getElementById("group-day");
const groupMonth = document.getElementById("group-month");
const groupYear = document.getElementById("group-year");

const resultYears = document.getElementById("result-years");
const resultMonths = document.getElementById("result-months");
const resultDays = document.getElementById("result-days");

// 2. FUNGSI UNTUK MENAMPILKAN / MENGHAPUS ERROR
function showError(group, message) {
  group.classList.add("error");
  const errorMsg = group.querySelector(".error-msg");
  errorMsg.textContent = message;
}

function clearError(group) {
  group.classList.remove("error");
}

// 3. FUNGSI CEK JUMLAH HARI MAKSIMAL DALAM SATU BULAN (TERMASUK KABISAT)
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

// 4. FUNGSI VALIDASI INPUT
function validateInputs(day, month, year) {
  let isValid = true;
  const now = new Date();
  const currentYear = now.getFullYear();

  // Reset error sebelumnya
  clearError(groupDay);
  clearError(groupMonth);
  clearError(groupYear);

  // Validasi Day
  if (!dayInput.value) {
    showError(groupDay, "Harus diisi");
    isValid = false;
  } else if (day < 1 || day > 31) {
    showError(groupDay, "Tanggal tidak valid");
    isValid = false;
  }

  // Validasi Month
  if (!monthInput.value) {
    showError(groupMonth, "Harus diisi");
    isValid = false;
  } else if (month < 1 || month > 12) {
    showError(groupMonth, "Bulan tidak valid");
    isValid = false;
  }

  // Validasi Year
  if (!yearInput.value) {
    showError(groupYear, "Harus diisi");
    isValid = false;
  } else if (year > currentYear) {
    showError(groupYear, "Tidak boleh di masa depan");
    isValid = false;
  } else if (year < 1900) {
    showError(groupYear, "Tahun terlalu lama");
    isValid = false;
  }

  // Jika input dasar valid, cek keabsahan kombinasi tanggal (misal: 31 Feb)
  if (isValid) {
    const inputDate = new Date(year, month - 1, day);
    const maxDays = getDaysInMonth(month, year);

    if (day > maxDays) {
      showError(groupDay, `Bulan ini maks ${maxDays} hari`);
      isValid = false;
    } else if (inputDate > now) {
      showError(groupDay, "Tanggal di masa depan");
      isValid = false;
    }
  }

  return isValid;
}

// 5. FUNGSI KALKULASI SELISIH UMUR PRESISI
function calculateAge(day, month, year) {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Jika hari minus, pinjam jumlah hari dari bulan sebelumnya
  if (days < 0) {
    months--;
    const prevMonthDays = getDaysInMonth(today.getMonth(), today.getFullYear());
    days += prevMonthDays;
  }

  // Jika bulan minus, pinjam 12 bulan dari tahun sebelumnya
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

// 6. FUNGSI ANIMASI HITUNG ANGKA (COUNT UP ANIMATION)
function animateResult(element, targetValue) {
  let currentValue = 0;
  const duration = 500; // Total durasi animasi (ms)
  const stepTime = Math.max(Math.floor(duration / (targetValue || 1)), 20);

  const timer = setInterval(() => {
    currentValue++;
    element.textContent = currentValue;

    if (currentValue >= targetValue) {
      element.textContent = targetValue;
      clearInterval(timer);
    }
  }, stepTime);
}

// 7. SUBMIT EVENT LISTENER
ageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const day = parseInt(dayInput.value, 10);
  const month = parseInt(monthInput.value, 10);
  const year = parseInt(yearInput.value, 10);

  if (validateInputs(day, month, year)) {
    const age = calculateAge(day, month, year);

    // Jalankan animasi hasil
    animateResult(resultYears, age.years);
    animateResult(resultMonths, age.months);
    animateResult(resultDays, age.days);
  }
});
