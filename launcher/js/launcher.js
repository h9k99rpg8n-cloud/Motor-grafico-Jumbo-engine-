import { templates, renderers } from "./templates.js";
import {
  getLocation,
  getRecentList,
  saveLocation,
  saveProject,
  updateRecentList,
} from "./storage.js";
import { handleProjectAction, renderProjects } from "./project-manager.js";

const recentContainer = document.getElementById("recent-projects");
const projectsGrid = document.getElementById("projects-grid");
const newProjectModal = document.getElementById("new-project-modal");
const templatesModal = document.getElementById("templates-modal");
const installBtn = document.getElementById("install-btn");
const installHint = document.getElementById("install-hint");
const importInput = document.getElementById("import-file");

let layout = "grid";
let deferredPrompt;

function uuid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `jumbo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function renderRecent() {
  const list = getRecentList();
  if (!list.length) {
    recentContainer.innerHTML = `<p class="empty">No hay proyectos recientes. Crea uno nuevo para empezar.</p>`;
    return;
  }

  recentContainer.innerHTML = list
    .map(
      (project) => `
        <div class="project-card">
          <img src="${project.thumbnail || "./assets/thumbnails/template-3d.svg"}" alt="${project.name}" />
          <div class="meta">
            <strong>${project.name}</strong>
            <span>Modificado: ${new Date(project.modified).toLocaleDateString("es-ES")}</span>
          </div>
          <div class="project-actions">
            <button class="btn primary" data-action="open" data-id="${project.id}">Abrir en editor</button>
          </div>
        </div>
      `
    )
    .join("");
}

function setupTemplateOptions() {
  const templateOptions = document.getElementById("template-options");
  templateOptions.innerHTML = templates
    .map(
      (template, index) => `
      <label class="radio-card">
        <input type="radio" name="template" value="${template.id}" ${
          index === 0 ? "checked" : ""
        } />
        <strong>${template.name}</strong>
        <span>${template.description}</span>
      </label>
    `
    )
    .join("");

  const rendererOptions = document.getElementById("renderer-options");
  rendererOptions.innerHTML = renderers
    .map(
      (renderer, index) => `
      <label class="radio-card">
        <input type="radio" name="renderer" value="${renderer.id}" ${
          index === 0 ? "checked" : ""
        } />
        <strong>${renderer.name}</strong>
      </label>
    `
    )
    .join("");

  const templatesList = document.getElementById("templates-list");
  templatesList.innerHTML = templates
    .map(
      (template) => `
      <article class="template-preview">
        <img src="${template.thumbnail}" alt="${template.name}" />
        <strong>${template.name}</strong>
        <span>${template.description}</span>
      </article>
    `
    )
    .join("");
}

async function createProject() {
  const name = document.getElementById("project-name").value.trim();
  const location = document.getElementById("project-location").value.trim();
  const template = document.querySelector("input[name=template]:checked").value;
  const renderer = document.querySelector("input[name=renderer]:checked").value;

  if (!name) {
    window.alert("Ingresa un nombre para el proyecto.");
    return;
  }

  const templateData = templates.find((item) => item.id === template);
  const now = Date.now();
  const project = {
    id: uuid(),
    name,
    created: now,
    modified: now,
    template,
    renderer,
    thumbnail: templateData?.thumbnail || "",
    sceneData: {},
    location,
  };

  await saveProject(project);
  updateRecentList(project);
  saveLocation(location);
  renderRecent();
  await renderProjects(projectsGrid, layout);
  closeModal(newProjectModal);
  window.location.href = `./editor.html?id=${encodeURIComponent(project.id)}`;
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.style.display = "inline-flex";
  });

  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = "none";
    }
  });

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone = window.navigator.standalone === true;
  if (isIos && !isStandalone) {
    installBtn.style.display = "inline-flex";
    installHint.textContent =
      "En iPhone: toca Compartir y selecciona \"Agregar a pantalla de inicio\".";
  }
}

function setupEvents() {
  document.getElementById("new-project-btn").addEventListener("click", () => openModal(newProjectModal));
  document.getElementById("templates-btn").addEventListener("click", () => openModal(templatesModal));
  document.getElementById("open-manager-btn").addEventListener("click", () =>
    document.getElementById("project-manager").scrollIntoView({ behavior: "smooth" })
  );

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", (event) => closeModal(document.getElementById(event.currentTarget.dataset.close)));
  });

  document.getElementById("create-project-btn").addEventListener("click", createProject);

  document.getElementById("project-location").value = getLocation();

  document.getElementById("import-project-btn").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const project = JSON.parse(text);
      project.id = project.id || uuid();
      project.modified = Date.now();
      await saveProject(project);
      updateRecentList(project);
      renderRecent();
      await renderProjects(projectsGrid, layout);
    } catch (error) {
      window.alert("Archivo inválido.");
    }
  });

  document.getElementById("refresh-projects").addEventListener("click", async () => {
    await renderProjects(projectsGrid, layout);
  });

  document.getElementById("toggle-layout").addEventListener("click", async (event) => {
    layout = layout === "grid" ? "list" : "grid";
    event.currentTarget.textContent = layout === "grid" ? "Vista lista" : "Vista grid";
    await renderProjects(projectsGrid, layout);
  });

  projectsGrid.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    await handleProjectAction(target.dataset.action, target.dataset.id);
    renderRecent();
    await renderProjects(projectsGrid, layout);
  });

  recentContainer.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    await handleProjectAction(target.dataset.action, target.dataset.id);
  });
}

async function init() {
  setupTemplateOptions();
  setupInstallPrompt();
  setupEvents();
  renderRecent();
  await renderProjects(projectsGrid, layout);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
}

init();
