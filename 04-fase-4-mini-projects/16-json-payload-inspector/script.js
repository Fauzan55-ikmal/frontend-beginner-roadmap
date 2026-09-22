// 1. SELEKSI ELEMEN DOM
const inputJson = document.getElementById("input-json");
const outputJson = document.getElementById("output-json");
const indentSelect = document.getElementById("indent-select");

const inputCharCount = document.getElementById("input-char-count");
const outputCharCount = document.getElementById("output-char-count");

const statusBadge = document.getElementById("status-badge");
const statKeys = document.getElementById("stat-keys");
const statDepth = document.getElementById("stat-depth");
const statType = document.getElementById("stat-type");

const btnPrettify = document.getElementById("btn-prettify");
const btnMinify = document.getElementById("btn-minify");
const btnSample = document.getElementById("btn-sample");
const btnClear = document.getElementById("btn-clear");
const btnCopy = document.getElementById("btn-copy");

// 2. DATA SAMPEL JSON UNTUK TESTING
const SAMPLE_PAYLOAD = {
  project: "JSON Payload Inspector",
  version: 1.0,
  active: true,
  environment: "production",
  developer: {
    name: "Fauzan",
    role: "Frontend Software Engineer",
    skills: ["HTML5", "CSS3", "JavaScript", "Git"],
  },
  metrics: {
    status_code: 200,
    response_time_ms: 42.5,
  },
  tags: null,
};
