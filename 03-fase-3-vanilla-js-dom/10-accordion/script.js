// 1. SELEKSI SEMUA ELEMEN ACCORDION ITEM
const accordionItems = document.querySelectorAll(".accordion-item");

// 2. FUNGSI UNTUK MENGATUR TINGGI AWAL ITEM YANG MEMILIKI CLASS ACTIVE
accordionItems.forEach((item) => {
  const content = item.querySelector(".accordion-content");

  // Jika item memiliki class 'active' bawaan dari HTML
  if (item.classList.contains("active")) {
    content.style.maxHeight = content.scrollHeight + "px";
  }
});

// 3. EVENT LISTENER CLICK PADA MINGGAT/HEADER SETIAP ITEM
accordionItems.forEach((item) => {
  const header = item.querySelector(".accordion-header");
  const content = item.querySelector(".accordion-content");

  header.addEventListener("click", () => {
    const isOpen = item.classList.contains("active");

    // A. TUTUP SEMUA ACCORDION ITEM LAIN (SINGLE-OPEN BEHAVIOR)
    accordionItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
        const otherContent = otherItem.querySelector(".accordion-content");
        otherContent.style.maxHeight = null; // Reset height ke 0
      }
    });

    // B. TOGGLE ITEM YANG DIKLIK
    if (isOpen) {
      // Jika sedang terbuka, tutup
      item.classList.remove("active");
      content.style.maxHeight = null;
    } else {
      // Jika sedang tertutup, buka dan set maxHeight sesuai scrollHeight
      item.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});
