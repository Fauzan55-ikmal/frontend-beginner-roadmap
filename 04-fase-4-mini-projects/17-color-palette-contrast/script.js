// 1. STATE MANAGEMENT
const state = {
  format: "hex", // 'hex' | 'rgb' | 'hsl'
  colors: [
    { hex: "#3B82F6", locked: false },
    { hex: "#10B981", locked: false },
    { hex: "#F59E0B", locked: false },
    { hex: "#EF4444", locked: false },
    { hex: "#8B5CF6", locked: false },
  ],
};

// 2. DOM ELEMENTS SELECTION
const btnGenerate = document.getElementById("btn-generate");
const formatSelect = document.getElementById("format-select");
const colorCards = document.querySelectorAll(".color-card");

// WCAG Contrast Checker DOM
const inputColorBg = document.getElementById("color-bg");
const inputTextBg = document.getElementById("hex-bg");
const inputColorFg = document.getElementById("color-fg");
const inputTextFg = document.getElementById("hex-fg");
const contrastPreviewBox = document.getElementById("contrast-preview-box");
const contrastRatioText = document.getElementById("contrast-ratio");
const contrastBadge = document.getElementById("contrast-badge");

const scoreNormalAA = document.getElementById("score-normal-aa");
const scoreLargeAA = document.getElementById("score-large-aa");
const scoreNormalAAA = document.getElementById("score-normal-aaa");
const scoreLargeAAA = document.getElementById("score-large-aaa");

// 3. COLOR MATH HELPERS
/**
 * Generates a random 6-character HEX color code
 * @returns {string} e.g. "#A3F12C"
 */
function getRandomHex() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Converts HEX color string to RGB object
 * @param {string} hex e.g. "#3B82F6"
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB object to HSL object
 * @param {number} r Red (0-255)
 * @param {number} g Green (0-255)
 * @param {number} b Blue (0-255)
 * @returns {{h: number, s: number, l: number}}
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Formats HEX color to target string based on active format mode
 * @param {string} hex e.g. "#3B82F6"
 * @param {'hex'|'rgb'|'hsl'} format
 * @returns {string}
 */
function formatColorValue(hex, format) {
  if (format === "rgb") {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (format === "hsl") {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return hex.toUpperCase();
}

// 4. PALETTE GENERATOR & UI RENDER ENGINE
/**
 * Memperbarui nilai warna acak baru untuk kartu yang tidak terkunci
 */
function generateNewPalette() {
  state.colors = state.colors.map((colorObj) => {
    if (colorObj.locked) return colorObj;
    return {
      ...colorObj,
      hex: getRandomHex(),
    };
  });
  renderPaletteUI();
}

/**
 * Merekam state ke tampilan DOM (kartu warna, background, teks kode, dan status gembok)
 */
function renderPaletteUI() {
  colorCards.forEach((card, index) => {
    const colorData = state.colors[index];
    const previewEl = card.querySelector(".color-preview");
    const codeEl = card.querySelector(".color-code");
    const lockBtn = card.querySelector(".btn-lock");
    const lockIcon = card.querySelector(".lock-icon");

    // Update background preview & kode warna berdasarkan format aktif
    previewEl.style.backgroundColor = colorData.hex;
    codeEl.textContent = formatColorValue(colorData.hex, state.format);

    // Update status UI gembok (Lock state)
    if (colorData.locked) {
      lockBtn.classList.add("is-locked");
      lockIcon.textContent = "🔒";
      lockBtn.setAttribute("title", "Buka Kunci Warna");
    } else {
      lockBtn.classList.remove("is-locked");
      lockIcon.textContent = "🔓";
      lockBtn.setAttribute("title", "Kunci Warna");
    }
  });
}

// 5. WCAG CONTRAST CALCULATOR ENGINE
/**
 * Menghitung Relative Luminance berdasarkan standar WCAG 2.1
 * @param {number} r (0-255)
 * @param {number} g (0-255)
 * @param {number} b (0-255)
 * @returns {number}
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Menghitung Rasio Kontras antara dua warna (1:1 hingga 21:1)
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number}
 */
function calculateContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Memperbarui UI WCAG Contrast Panel (Preview box, Rasio, & Badges)
 */
function updateContrastCheckerUI() {
  const bgHex = inputColorBg.value;
  const fgHex = inputColorFg.value;

  // Sinkronkan text input
  inputTextBg.value = bgHex.toUpperCase();
  inputTextFg.value = fgHex.toUpperCase();

  // Update Live Preview Box
  contrastPreviewBox.style.backgroundColor = bgHex;
  contrastPreviewBox.style.color = fgHex;

  // Hitung Rasio Kontras
  const ratio = calculateContrastRatio(bgHex, fgHex);
  contrastRatioText.textContent = `${ratio.toFixed(2)}:1`;

  // Evaluasi Standar WCAG 2.1
  const passNormalAA = ratio >= 4.5;
  const passLargeAA = ratio >= 3.0;
  const passNormalAAA = ratio >= 7.0;
  const passLargeAAA = ratio >= 4.5;

  // Helper untuk update status card
  const updateScoreCard = (el, isPass) => {
    const statusEl = el.querySelector(".score-status");
    if (isPass) {
      statusEl.textContent = "PASS";
      statusEl.className = "score-status status-pass";
    } else {
      statusEl.textContent = "FAIL";
      statusEl.className = "score-status status-fail";
    }
  };

  updateScoreCard(scoreNormalAA, passNormalAA);
  updateScoreCard(scoreLargeAA, passLargeAA);
  updateScoreCard(scoreNormalAAA, passNormalAAA);
  updateScoreCard(scoreLargeAAA, passLargeAAA);

  // Update Header Badge Overall
  if (passNormalAA) {
    contrastBadge.textContent = "WCAG Compliant (AA)";
    contrastBadge.className = "badge badge-success";
  } else {
    contrastBadge.textContent = "Poor Contrast";
    contrastBadge.className = "badge badge-danger";
  }
}
