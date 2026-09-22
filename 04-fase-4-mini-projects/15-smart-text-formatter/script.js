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
