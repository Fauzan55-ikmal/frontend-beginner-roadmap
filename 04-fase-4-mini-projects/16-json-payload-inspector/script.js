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

// 6. HELPER FUNCTIONS - UI STATUS & METRICS UPDATES
/**
 * Memperbarui status badge validasi, metrics bar, dan tampilan visual textarea output
 * @param {'ready' | 'valid' | 'invalid'} state - Status validasi
 * @param {string} message - Pesan status atau detail error sintaksis
 * @param {object|null} metrics - Objek statistik dari analyzePayload()
 */
function updateUIStatus(state, message, metrics = null) {
  // Reset kelas status badge & textarea
  statusBadge.className = "badge";
  outputJson.classList.remove("has-error");

  if (state === "valid") {
    statusBadge.classList.add("badge-success");
    statusBadge.textContent = "Valid JSON";

    if (metrics) {
      statKeys.textContent = metrics.totalKeys.toLocaleString("id-ID");
      statDepth.textContent = metrics.maxDepth;
      statType.textContent = metrics.dataType;
    }
  } else if (state === "invalid") {
    statusBadge.classList.add("badge-danger");
    statusBadge.textContent = "Invalid JSON";
    outputJson.classList.add("has-error");

    resetMetrics();
  } else {
    // State 'ready' / default
    statusBadge.classList.add("badge-neutral");
    statusBadge.textContent = message || "Ready";

    resetMetrics();
  }
}

/**
 * Mengembalikan tampilan indikator statistik ke kondisi awal (-)
 */
function resetMetrics() {
  statKeys.textContent = "0";
  statDepth.textContent = "0";
  statType.textContent = "-";
}

// 7. EVENT LISTENER - CLEAR BUTTON
btnClear.addEventListener("click", () => {
  inputJson.value = "";
  outputJson.value = "";
  updateUIStatus("ready", "Ready");
  updateByteCounters();
  inputJson.focus();
});

// 8. CORE FORMATTING ENGINE - PRETTIFY & MINIFY
/**
 * Memproses validasi, penataan format (Prettify/Minify), dan kalkulasi metrik payload
 * @param {'prettify' | 'minify'} mode - Mode format yang dipilih
 */
function processJson(mode) {
  const rawInput = inputJson.value.trim();

  // Validasi Input Kosong
  if (!rawInput) {
    outputJson.value = "";
    updateUIStatus("ready", "Ready");
    updateByteCounters();
    return;
  }

  try {
    // Parsing String JSON
    const parsedData = JSON.parse(rawInput);

    // Opsi Indentasi dari Dropdown Control
    const indentSize = parseInt(indentSelect.value, 10) || 2;

    let formattedResult = "";
    if (mode === "prettify") {
      formattedResult = JSON.stringify(parsedData, null, indentSize);
    } else if (mode === "minify") {
      formattedResult = JSON.stringify(parsedData);
    }

    // Tampilkan Hasil di Textarea Output
    outputJson.value = formattedResult;

    // Jalankan Analisis Metrik Payload
    const metrics = analyzePayload(parsedData);

    // Update UI Status ke Valid
    updateUIStatus("valid", "Valid JSON", metrics);
    updateByteCounters();
  } catch (error) {
    // Penanganan Error Sintaksis JSON
    outputJson.value = `Syntax Error: ${error.message}`;
    updateUIStatus("invalid", "Invalid JSON");
    updateByteCounters();
  }
}

// 9. EVENT LISTENERS - PRETTIFY, MINIFY, & INDENT SELECT
btnPrettify.addEventListener("click", () => {
  processJson("prettify");
});

btnMinify.addEventListener("click", () => {
  processJson("minify");
});

// Re-format otomatis jika user mengubah opsi indentasi saat output sudah ada
indentSelect.addEventListener("change", () => {
  if (inputJson.value.trim()) {
    processJson("prettify");
  }
});
