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
