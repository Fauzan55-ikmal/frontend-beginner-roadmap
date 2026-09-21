// 1. SELEKSI ELEMEN DOM
const toastContainer = document.getElementById("toast-container");
const buttons = document.querySelectorAll(".buttons-grid .btn");

// 2. FUNGSI UNTUK MEMBUAT & MENAMPILKAN TOAST
function showToast(type, message) {
  // A. Buat elemen div baru untuk toast
  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);

  // B. Isi struktur HTML di dalam toast
  toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;

  // C. Tempelkan toast ke dalam container
  toastContainer.appendChild(toast);
}
