// 1. SELEKSI ELEMEN DOM
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

// 2. ITERASI DENGAN FOR EACH UNTUK MENAMBAHKAN EVENT LISTENER CLICK
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // A. Ambil ID target panel dari custom attribute data-tab
    const targetTab = button.dataset.tab;

    // B. Hapus class 'active' dari SEMUA tombol tab
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    // C. Hapus class 'active' dari SEMUA panel konten
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    // D. Tambahkan class 'active' HANYA ke tombol yang diklik
    button.classList.add("active");

    // E. Tambahkan class 'active' HANYA ke panel yang ID-nya cocok
    const activePanel = document.getElementById(targetTab);
    if (activePanel) {
      activePanel.classList.add("active");
    }
  });
});
