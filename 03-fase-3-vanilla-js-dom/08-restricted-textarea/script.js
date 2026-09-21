// 1. SELEKSI ELEMEN DOM
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");

// 2. KONFIGURASI BATAS KARAKTER
const MAX_CHARS = 200;
const WARNING_THRESHOLD = 180; // Ditrigger saat karakter mencapai 180 (90%)
