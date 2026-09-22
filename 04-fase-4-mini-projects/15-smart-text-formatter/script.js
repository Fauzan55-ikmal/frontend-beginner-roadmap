// 1. DOM ELEMENTS SELECTION
const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const inputCharCount = document.getElementById("input-char-count");
const outputCharCount = document.getElementById("output-char-count");

const btnClean = document.getElementById("btn-clean");
const btnRedact = document.getElementById("btn-redact");
const btnClear = document.getElementById("btn-clear");
const btnCopy = document.getElementById("btn-copy");

// 2. UTILITY FUNCTIONS
/**
 * Memperbarui tampilan jumlah karakter pada badge panel
 * @param {HTMLTextAreaElement} element - Textarea target
 * @param {HTMLElement} displayTarget - Badge span target
 */
function updateCharacterCount(element, displayTarget) {
  const count = element.value.length;
  displayTarget.textContent = `${count.toLocaleString("id-ID")} Karakter`;
}

// 3. EVENT LISTENERS - INPUT MONITORING
inputText.addEventListener("input", () => {
  updateCharacterCount(inputText, inputCharCount);
});

// 4. CORE FORMATTER LOGIC
/**
 * Membersihkan format teks mentah:
 * - Menghapus trailing spaces di setiap baris
 * - Mengubah multiple blank lines berturut-turut menjadi maksimal 1 baris kosong
 * - Menghapus whitespace di awal & akhir keseluruhan teks
 * @param {string} rawText
 * @returns {string} Teks yang sudah dibersihkan
 */
function cleanText(rawText) {
  if (!rawText) return "";

  return (
    rawText
      // Trim spasi liar di akhir tiap baris
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      // Normalisasi multiple baris kosong berturut-turut (3+ \n jadi 2 \n)
      .replace(/\n{3,}/g, "\n\n")
      // Trim spasi di ujung awal dan akhir teks utama
      .trim()
  );
}

// 5. EVENT LISTENERS - FORMAT ACTIONS
btnClean.addEventListener("click", () => {
  const rawVal = inputText.value;
  if (!rawVal.trim()) return;

  const cleaned = cleanText(rawVal);
  outputText.value = cleaned;

  // Update counter karakter pada output
  updateCharacterCount(outputText, outputCharCount);
});

// 6. DATA REDACTION LOGIC
/**
 * Menyamarkan data sensitif dalam teks (Email, IP Address, Phone Number, Credit Card)
 * @param {string} rawText
 * @returns {string} Teks yang data sensitifnya sudah disamarkan
 */
function redactText(rawText) {
  if (!rawText) return "";

  // Pattern Regex Standar Industri untuk Data Sensitif
  const patterns = {
    // Email: user@domain.com -> [REDACTED_EMAIL]
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    // IPv4 Address: 192.168.1.1 -> [REDACTED_IP]
    ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,

    // Nomor HP/Telepon Indonesia & Internasional (+62 / 08xx / formatted)
    phone: /(\+62|62|0)[8][1-9][0-9]{6,10}\b/g,

    // Nomor Kartu Kredit (16 digit angka dengan spasi/dash)
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  };

  return rawText.replace(patterns.email, "[REDACTED_EMAIL]").replace(patterns.ipAddress, "[REDACTED_IP]").replace(patterns.phone, "[REDACTED_PHONE]").replace(patterns.creditCard, "[REDACTED_CARD]");
}

// 7. EVENT LISTENERS - REDACT ACTION
btnRedact.addEventListener("click", () => {
  const rawVal = inputText.value;
  if (!rawVal.trim()) return;

  // Bersihkan format terlebih dahulu, lalu samarkan data sensitif
  const formatted = cleanText(rawVal);
  const redacted = redactText(formatted);

  outputText.value = redacted;

  // Update counter karakter pada output
  updateCharacterCount(outputText, outputCharCount);
});
