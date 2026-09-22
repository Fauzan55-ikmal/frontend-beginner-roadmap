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
