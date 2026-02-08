const DB_NAME = "jumbo-engine-launcher";
const DB_VERSION = 1;
const STORE_NAME = "projects";
const LIST_KEY = "jumbo-projects-list";

let dbPromise;

function openDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function getList() {
  const raw = localStorage.getItem(LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveList(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

export async function getAllProjects() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve(project);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(project);
  });
}

export async function deleteProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).delete(id);
  });
}

export function getRecentList() {
  return getList();
}

export function updateRecentList(project) {
  const list = getList().filter((item) => item.id !== project.id);
  list.unshift({
    id: project.id,
    name: project.name,
    modified: project.modified,
    thumbnail: project.thumbnail,
  });
  saveList(list.slice(0, 6));
}

export function removeFromRecent(id) {
  const list = getList().filter((item) => item.id !== id);
  saveList(list);
}

export function saveLocation(location) {
  localStorage.setItem("jumbo-project-location", location);
}

export function getLocation() {
  return localStorage.getItem("jumbo-project-location") || "/Proyectos";
}
