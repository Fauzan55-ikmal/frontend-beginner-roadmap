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

// 2. DOM ELEMENTS MAPPING
const boardContainer = document.getElementById("board-container");
const searchInput = document.getElementById("search-input");
const filterPriority = document.getElementById("filter-priority");
const btnAddColumn = document.getElementById("btn-add-column");
const btnUndo = document.getElementById("btn-undo");
const btnRedo = document.getElementById("btn-redo");

// Modal DOM Elements
const modalTask = document.getElementById("modal-task");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const taskIdInput = document.getElementById("task-id");
const taskColumnIdInput = document.getElementById("task-column-id");
const taskTitleInput = document.getElementById("task-title-input");
const taskDescInput = document.getElementById("task-desc-input");
const taskPriorityInput = document.getElementById("task-priority-input");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelTask = document.getElementById("btn-cancel-task");

// 3. UI RENDERING ENGINE
/**
 * Sanitasi string teks untuk mencegah celah keamanan XSS
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[tag] || tag);
}

/**
 * Merender ulang seluruh papan Kanban berdasarkan state terkini
 */
function renderKanbanBoard() {
  if (!boardContainer) return;
  boardContainer.innerHTML = "";

  state.columns.forEach((column) => {
    // Filter tugas berdasarkan kolom aktif, prioritas, dan query pencarian teks
    const columnTasks = state.tasks.filter((task) => {
      const matchColumn = task.columnId === column.id;
      const matchPriority = state.filter === "all" || task.priority === state.filter;
      const query = state.searchQuery.toLowerCase();
      const matchSearch = task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query));
      return matchColumn && matchPriority && matchSearch;
    });

    // Buat elemen kolom
    const columnEl = document.createElement("div");
    columnEl.className = "kanban-column";
    columnEl.setAttribute("data-column-id", column.id);

    columnEl.innerHTML = `
            <div class="column-header">
                <div class="column-title-group">
                    <h2 class="column-title">${escapeHTML(column.title)}</h2>
                    <span class="card-count">${columnTasks.length}</span>
                </div>
                <div class="column-actions">
                    <button class="btn-icon btn-add-card" title="Tambah Kartu" data-column-id="${column.id}">+</button>
                    <button class="btn-icon btn-column-menu" title="Opsi Kolom" data-column-id="${column.id}">⋮</button>
                </div>
            </div>
            <div class="cards-dropzone" data-dropzone-id="${column.id}">
                <!-- Task Cards di-render di sini -->
            </div>
        `;

    // Render Task Cards ke dalam zona drop kolom
    const dropzone = columnEl.querySelector(".cards-dropzone");

    columnTasks.forEach((task) => {
      const cardEl = document.createElement("div");
      cardEl.className = "task-card";
      cardEl.setAttribute("draggable", "true");
      cardEl.setAttribute("data-task-id", task.id);

      cardEl.innerHTML = `
                <div class="task-header">
                    <span class="task-badge ${task.priority}">${task.priority.toUpperCase()}</span>
                    <div class="task-card-actions">
                        <button class="btn-icon btn-edit-task" title="Edit Tugas" data-task-id="${task.id}">✏️</button>
                        <button class="btn-icon btn-delete-task" title="Hapus Tugas" data-task-id="${task.id}">🗑️</button>
                    </div>
                </div>
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                <p class="task-desc">${escapeHTML(task.description || "")}</p>
                <div class="task-footer">
                    <span>📅 ${task.createdAt}</span>
                </div>
            `;

      dropzone.appendChild(cardEl);
    });

    boardContainer.appendChild(columnEl);
  });

  // Simpan otomatis ke localStorage setiap kali UI dirender ulang
  saveStateToStorage();
}

// 4. NATIVE HTML5 DRAG AND DROP ENGINE
let draggedTaskId = null;

// Event ketika kartu mulai ditarik
document.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".task-card");
  if (card) {
    draggedTaskId = card.getAttribute("data-task-id");
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", draggedTaskId);
    e.dataTransfer.effectAllowed = "move";
  }
});

// Event ketika proses tarik kartu selesai
document.addEventListener("dragend", (e) => {
  const card = e.target.closest(".task-card");
  if (card) {
    card.classList.remove("dragging");
    draggedTaskId = null;

    // Bersihkan semua indikator drop zone aktif
    document.querySelectorAll(".cards-dropzone").forEach((zone) => {
      zone.classList.remove("drag-over");
    });
  }
});

// Mencegah default behavior agar elemen lain mengizinkan drop
document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
});

// Efek visual saat kartu masuk ke area dropzone kolom
document.addEventListener("dragenter", (e) => {
  const dropzone = e.target.closest(".cards-dropzone");
  if (dropzone) {
    dropzone.classList.add("drag-over");
  }
});

// Menghapus efek visual saat kursor keluar dari dropzone
document.addEventListener("dragleave", (e) => {
  const dropzone = e.target.closest(".cards-dropzone");
  if (dropzone && !dropzone.contains(e.relatedTarget)) {
    dropzone.classList.remove("drag-over");
  }
});

// Event utama saat kartu dilepaskan (dropped) ke dalam kolom tujuan
document.addEventListener("drop", (e) => {
  e.preventDefault();
  const dropzone = e.target.closest(".cards-dropzone");
  if (!dropzone) return;

  dropzone.classList.remove("drag-over");
  const targetColumnId = dropzone.getAttribute("data-dropzone-id");

  if (draggedTaskId && targetColumnId) {
    const task = state.tasks.find((t) => t.id === draggedTaskId);

    // Hanya update state jika kolom tujuan berbeda dari kolom asal
    if (task && task.columnId !== targetColumnId) {
      recordHistory(); // Catat snapshot ke history buffer sebelum mutasi
      task.columnId = targetColumnId;
      renderKanbanBoard();
    }
  }
});

// 5. CRUD OPERATIONS & MODAL FORM CONTROLLER

/**
 * Membuka modal form (mode create atau edit)
 */
function openModal(mode, columnId = null, task = null) {
  if (!modalTask) return;
  modalTask.classList.add("active");
  modalTask.setAttribute("aria-hidden", "false");

  if (mode === "create") {
    modalTitle.textContent = "Tambah Tugas Baru";
    taskIdInput.value = "";
    taskColumnIdInput.value = columnId;
    taskTitleInput.value = "";
    taskDescInput.value = "";
    taskPriorityInput.value = "medium";
  } else if (mode === "edit" && task) {
    modalTitle.textContent = "Edit Tugas";
    taskIdInput.value = task.id;
    taskColumnIdInput.value = task.columnId;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description || "";
    taskPriorityInput.value = task.priority;
  }
  taskTitleInput.focus();
}

/**
 * Menutup modal form dan mereset isi form
 */
function closeModal() {
  if (!modalTask) return;
  modalTask.classList.remove("active");
  modalTask.setAttribute("aria-hidden", "true");
  taskForm.reset();
}

// Event Listener Tombol Tutup / Batal Modal
if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if (btnCancelTask) btnCancelTask.addEventListener("click", closeModal);
if (modalTask) {
  modalTask.addEventListener("click", (e) => {
    if (e.target === modalTask) closeModal();
  });
}

// Event Listener Delegasi Klik pada Papan (Tambah, Edit, dan Hapus Kartu)
document.addEventListener("click", (e) => {
  // Tombol Tambah Kartu di Header Kolom
  const addCardBtn = e.target.closest(".btn-add-card");
  if (addCardBtn) {
    const colId = addCardBtn.getAttribute("data-column-id");
    openModal("create", colId);
    return;
  }

  // Tombol Edit Kartu
  const editCardBtn = e.target.closest(".btn-edit-task");
  if (editCardBtn) {
    const tId = editCardBtn.getAttribute("data-task-id");
    const task = state.tasks.find((t) => t.id === tId);
    if (task) openModal("edit", null, task);
    return;
  }

  // Tombol Hapus Kartu
  const deleteCardBtn = e.target.closest(".btn-delete-task");
  if (deleteCardBtn) {
    const tId = deleteCardBtn.getAttribute("data-task-id");
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      recordHistory();
      state.tasks = state.tasks.filter((t) => t.id !== tId);
      renderKanbanBoard();
    }
    return;
  }
});

// Event Submit Form (Simpan Tugas Baru atau Perbarui Tugas)
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const tId = taskIdInput.value;
    const colId = taskColumnIdInput.value;
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();
    const priority = taskPriorityInput.value;

    if (!title) return;

    recordHistory(); // Catat snapshot ke history buffer sebelum mutasi

    if (tId) {
      // Mode Edit
      const task = state.tasks.find((t) => t.id === tId);
      if (task) {
        task.title = title;
        task.description = description;
        task.priority = priority;
      }
    } else {
      // Mode Create
      const newTask = {
        id: "task-" + Date.now(),
        columnId: colId,
        title: title,
        description: description,
        priority: priority,
        createdAt: new Date().toISOString().split("T")[0],
      };
      state.tasks.push(newTask);
    }

    closeModal();
    renderKanbanBoard();
  });
}

// Event Listener Tombol Tambah Kolom Kustom
if (btnAddColumn) {
  btnAddColumn.addEventListener("click", () => {
    const colTitle = prompt("Masukkan nama kolom baru:");
    if (colTitle && colTitle.trim() !== "") {
      recordHistory();
      const newColId = "col-" + Date.now();
      state.columns.push({ id: newColId, title: colTitle.trim() });
      renderKanbanBoard();
    }
  });
}

// 6. SEARCH, FILTERS, HISTORY (UNDO/REDO), & APP INITIALIZATION

// Event Listener untuk Real-time Search
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderKanbanBoard();
  });
}

// Event Listener untuk Priority Filter Dropdown
if (filterPriority) {
  filterPriority.addEventListener("change", (e) => {
    state.filter = e.target.value;
    renderKanbanBoard();
  });
}

// Event Listener untuk Tombol Undo
if (btnUndo) {
  btnUndo.addEventListener("click", () => {
    if (historyStack.length === 0) return;

    // Simpan state saat ini ke redo stack sebelum melakukan undo
    const currentState = {
      columns: JSON.parse(JSON.stringify(state.columns)),
      tasks: JSON.parse(JSON.stringify(state.tasks)),
    };
    redoStack.push(currentState);

    // Ambil state sebelumnya dari history stack
    const previousState = historyStack.pop();
    state.columns = previousState.columns;
    state.tasks = previousState.tasks;

    updateHistoryButtons();
    renderKanbanBoard();
  });
}

// Event Listener untuk Tombol Redo
if (btnRedo) {
  btnRedo.addEventListener("click", () => {
    if (redoStack.length === 0) return;

    // Simpan state saat ini ke history stack sebelum melakukan redo
    const currentState = {
      columns: JSON.parse(JSON.stringify(state.columns)),
      tasks: JSON.parse(JSON.stringify(state.tasks)),
    };
    historyStack.push(currentState);

    // Ambil state berikutnya dari redo stack
    const nextState = redoStack.pop();
    state.columns = nextState.columns;
    state.tasks = nextState.tasks;

    updateHistoryButtons();
    renderKanbanBoard();
  });
}

// Global Keyboard Listener untuk Shortcut (Ctrl+Z untuk Undo, Ctrl+Y untuk Redo)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (historyStack.length > 0 && btnUndo) btnUndo.click();
  } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
    e.preventDefault();
    if (redoStack.length > 0 && btnRedo) btnRedo.click();
  }
});

// Inisialisasi Aplikasi saat DOM Selesai Dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();
  renderKanbanBoard();
  updateHistoryButtons();
  console.log("🚀 Enterprise Kanban Engine successfully initialized.");
});
