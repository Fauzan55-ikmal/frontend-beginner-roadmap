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
