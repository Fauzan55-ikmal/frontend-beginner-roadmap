// ==========================================================================
// ENTERPRISE KANBAN ENGINE - SCRIPT.JS
// ==========================================================================

// 1. STATE MANAGEMENT & LOCAL STORAGE PERSISTENCE
const STORAGE_KEY = "kanban_engine_state_v1";

let state = {
  columns: [
    { id: "col-todo", title: "To Do" },
    { id: "col-inprogress", title: "In Progress" },
    { id: "col-review", title: "Review" },
    { id: "col-done", title: "Done" },
  ],
  tasks: [
    { id: "task-1", columnId: "col-todo", title: "Setup Webpack Config", description: "Konfigurasi awal module bundler untuk production build.", priority: "high", createdAt: "2026-09-22" },
    { id: "task-2", columnId: "col-inprogress", title: "Fix Drag & Drop Bug", description: "Perbaiki masalah event target saat kartu dilepas di kolom kosong.", priority: "medium", createdAt: "2026-09-22" },
    { id: "task-3", columnId: "col-review", title: "Refactor CSS Tokens", description: "Pindahkan hardcoded color ke CSS custom properties.", priority: "low", createdAt: "2026-09-21" },
    { id: "task-4", columnId: "col-done", title: "HTML Shell Layout", description: "Selesaikan kerangka struktur semantik HTML5.", priority: "high", createdAt: "2026-09-20" },
  ],
  filter: "all",
  searchQuery: "",
};

// History Stacks untuk fitur Undo / Redo (Command Pattern)
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 20;

/**
 * Menyimpan snapshot state saat ini ke history stack sebelum perubahan
 */
function recordHistory() {
  historyStack.push(JSON.parse(JSON.stringify({ columns: state.columns, tasks: state.tasks })));
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift(); // Buang data tertua jika melebihi batas
  }
  redoStack = []; // Reset redo stack setiap ada aksi baru
  updateHistoryButtons();
}

/**
 * Menyimpan state ke LocalStorage dengan indikator visual
 */
function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns: state.columns, tasks: state.tasks }));
    updateStorageIndicator(true);
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
    updateStorageIndicator(false);
  }
}

/**
 * Memuat state dari LocalStorage jika tersedia
 */
function loadStateFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      state.columns = parsed.columns || state.columns;
      state.tasks = parsed.tasks || state.tasks;
    }
  } catch (err) {
    console.error("Gagal memuat dari localStorage:", err);
  }
}

/**
 * Memperbarui indikator status penyimpanan di header
 */
function updateStorageIndicator(isSuccess) {
  const indicator = document.getElementById("storage-status");
  if (!indicator) return;
  const dot = indicator.querySelector(".dot");
  if (isSuccess) {
    dot.style.backgroundColor = "var(--priority-low)";
    indicator.lastChild.textContent = " Saved";
  } else {
    dot.style.backgroundColor = "var(--danger)";
    indicator.lastChild.textContent = " Error";
  }
}

/**
 * Mengatur status aktif/disabled tombol Undo dan Redo
 */
function updateHistoryButtons() {
  const btnUndo = document.getElementById("btn-undo");
  const btnRedo = document.getElementById("btn-redo");
  if (btnUndo) btnUndo.disabled = historyStack.length === 0;
  if (btnRedo) btnRedo.disabled = redoStack.length === 0;
}
