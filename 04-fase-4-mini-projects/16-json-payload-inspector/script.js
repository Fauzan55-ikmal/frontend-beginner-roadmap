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

// 3. UTILITY FUNCTIONS - PAYLOAD BYTE SIZE COUNTER
/**
 * Mengkalkulasi ukuran memori string dalam satuan Bytes / KB secara akurat
 * @param {string} str - String teks/JSON yang akan dihitung
 * @returns {string} Ukuran terformat (contoh: '120 Bytes' atau '1.5 KB')
 */
function calculateByteSize(str) {
  if (!str) return "0 Bytes";
  const bytes = new Blob([str]).size;

  if (bytes < 1024) {
    return `${bytes.toLocaleString("id-ID")} Bytes`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * Memperbarui tampilan teks ukuran byte pada header panel input dan output
 */
function updateByteCounters() {
  inputCharCount.textContent = calculateByteSize(inputJson.value);
  outputCharCount.textContent = calculateByteSize(outputJson.value);
}

// 4. EVENT LISTENERS - INPUT EVENT & SAMPLE BUTTON
// Update counter ukuran byte secara real-time saat user mengetik/paste
inputJson.addEventListener("input", () => {
  updateByteCounters();
});

// Suntikkan data sampel JSON ke textarea input saat tombol diklik
btnSample.addEventListener("click", () => {
  inputJson.value = JSON.stringify(SAMPLE_PAYLOAD, null, 2);
  updateByteCounters();
  inputJson.focus();
});

// 5. CORE ANALYTICS ENGINE - PAYLOAD INSPECTOR
/**
 * Menganalisis struktur objek JSON untuk menghitung Total Keys, Kedalaman (Depth), dan Tipe Data Teratas
 * @param {any} data - Data hasil dari JSON.parse()
 * @returns {object} Objek statistik { totalKeys, maxDepth, dataType }
 */
function analyzePayload(data) {
  // Determine Top-level Data Type
  let dataType = typeof data;
  if (data === null) {
    dataType = "Null";
  } else if (Array.isArray(data)) {
    dataType = "Array";
  } else if (dataType === "object") {
    dataType = "Object";
  } else {
    dataType = dataType.charAt(0).toUpperCase() + dataType.slice(1);
  }

  let totalKeys = 0;
  let maxDepth = 0;

  /**
   * Internal Recursive Traversal Function
   */
  function traverse(node, currentDepth) {
    if (node !== null && typeof node === "object") {
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }

      if (Array.isArray(node)) {
        node.forEach((item) => traverse(item, currentDepth + 1));
      } else {
        const keys = Object.keys(node);
        totalKeys += keys.length;
        keys.forEach((key) => traverse(node[key], currentDepth + 1));
      }
    }
  }

  // Execute traversal if data is Object or Array
  if (data !== null && typeof data === "object") {
    traverse(data, 1);
  }

  return {
    totalKeys,
    maxDepth,
    dataType,
  };
}
