import "./style.css";

// ========================================
// 1. TIPE DATA
// ========================================

interface Todo {
  id: number;
  teks: string;
  selesai: boolean;
  tanggal: string;
}

// ========================================
// 2. STATE
// ========================================

const KUNCI_STORAGE = "todos";

let kataCari = "";

let todos: Todo[] = muatDariStorage();

// ========================================
// 3. ELEMEN DOM
// ========================================

const form = document.getElementById("todo-form") as HTMLFormElement;
const input = document.getElementById("todo-input") as HTMLInputElement;
const list = document.getElementById("todo-list") as HTMLUListElement;

const counter = document.getElementById(
  "todo-counter"
) as HTMLParagraphElement;

const tombolHapusSelesai = document.getElementById(
  "hapus-selesai"
) as HTMLButtonElement;

const searchInput = document.getElementById(
  "todo-search"
) as HTMLInputElement;

// ========================================
// 4. PENYIMPANAN (localStorage)
// ========================================

function simpanKeStorage(): void {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(todos));
}

function muatDariStorage(): Todo[] {
  try {
    const data = localStorage.getItem(KUNCI_STORAGE);
    if (!data) return [];

    const hasil = JSON.parse(data);
    if (!Array.isArray(hasil)) return [];

    return hasil
      .filter(
        (item): item is Todo =>
          typeof item === "object" &&
          item != null &&
          typeof item.id === "number" &&
          typeof item.teks === "string" &&
          typeof item.selesai === "boolean"
      )
      .map((item) => ({
        ...item,
        tanggal: typeof item.tanggal === "string" ? item.tanggal : "-",
      }));
  } catch {
    return [];
  }
}

// ========================================
// 5. LOGIKA APLIKASI
// ========================================

function tambahTodo(teks: string): void {
  const todoBaru: Todo = {
    id: Date.now(),
    teks: teks,
    selesai: false,
    tanggal: new Date().toISOString().split("T")[0],
  };
  todos.push(todoBaru);
  simpanKeStorage();
  render();
}

function ubahStatus(id: number): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, selesai: !todo.selesai } : todo
  );
  simpanKeStorage();
  render();
}

function hapusTodo(id: number): void {
  todos = todos.filter((todo) => todo.id !== id);
  simpanKeStorage();
  render();
}

function editTodo(id: number, teksBaru: string): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, teks: teksBaru } : todo
  );
  simpanKeStorage();
  render();
}

function hapusSelesai(): void {
  todos = todos.filter((todo) => !todo.selesai);
  simpanKeStorage();
  render();
}

function cariTodo(kata: string): Todo[] {
  const kunci = kata.toLowerCase().trim();
  if (kunci === "") return todos;
  return todos.filter((todo) => todo.teks.toLowerCase().includes(kunci));
}

// ========================================
// 6. RENDER
// ========================================

function render(): void {
  list.innerHTML = "";

  const todosTampil = cariTodo(kataCari);

  const belumSelesai = todos.filter((todo) => !todo.selesai).length;
  counter.textContent = `${belumSelesai} tugas tersisa`;

  todosTampil.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.selesai ? "todo-item selesai" : "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.selesai;
    checkbox.addEventListener("change", () => ubahStatus(todo.id));

    const span = document.createElement("span");
    span.className = "teks";
    span.textContent = todo.teks;

    const spanTanggal = document.createElement("small");
    spanTanggal.className = "tanggal";
    spanTanggal.textContent = todo.tanggal;

    const tombolEdit = document.createElement("button");
    tombolEdit.className = "edit";
    tombolEdit.textContent = "Edit";
    tombolEdit.addEventListener("click", () => {
      const teksBaru = prompt("Ubah tugas:", todo.teks);
      if (teksBaru !== null && teksBaru.trim() !== "") {
        editTodo(todo.id, teksBaru.trim());
      }
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.className = "hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.addEventListener("click", () => hapusTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(spanTanggal);
    li.appendChild(tombolEdit);
    li.appendChild(tombolHapus);
    list.appendChild(li);
  });
}

// ========================================
// 7. EVENT LISTENER
// ========================================

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const teks = input.value.trim();
  if (teks === "") return;
  tambahTodo(teks);
  input.value = "";
  input.focus();
});

tombolHapusSelesai.addEventListener("click", hapusSelesai);

searchInput.addEventListener("input", () => {
  kataCari = searchInput.value;
  render();
});

render();