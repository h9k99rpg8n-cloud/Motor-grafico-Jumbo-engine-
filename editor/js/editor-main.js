import { Viewport } from "./viewport.js";
import { SceneManager } from "./scene-manager.js";
import { SceneTree } from "./scene-tree.js";
import { Inspector } from "./inspector.js";
import { GizmosOverlay } from "./gizmos.js";
import { InputHandler } from "./input-handler.js";
import { loadProjectFromIndexedDB, saveProjectToIndexedDB } from "./project-loader.js";

const canvas = document.getElementById("gl-canvas");
const projectNameLabel = document.getElementById("project-name");
const sceneTreeList = document.getElementById("scene-tree-list");
const transformTab = document.getElementById("tab-transform");
const materialTab = document.getElementById("tab-material");
const fpsLabel = document.getElementById("fps");
const objectCountLabel = document.getElementById("object-count");
const polyCountLabel = document.getElementById("poly-count");
const rendererInfo = document.getElementById("renderer-info");
const contextMenu = document.getElementById("context-menu");

const sceneManager = new SceneManager();
const inspector = new Inspector(transformTab, materialTab);
const gizmoOverlay = new GizmosOverlay(document.getElementById("gizmo-overlay"));
let project = null;
let currentMode = "select";
let currentAxis = null;

const viewport = new Viewport(canvas, {
  onFrame: ({ delta, renderer }) => {
    const fps = Math.round(1000 / delta);
    fpsLabel.textContent = `FPS: ${fps}`;
    rendererInfo.textContent = `Renderer: ${renderer.version}`;
  },
});

const sceneTree = new SceneTree(sceneTreeList, sceneManager, {
  onSelect: (node) => {
    inspector.render(node, handleChange);
    currentAxis = null;
    gizmoOverlay.render(currentMode, currentAxis);
  },
  onChange: () => handleChange(),
});

new InputHandler({
  onModeChange: (mode) => setMode(mode),
  onAxisChange: (axis) => {
    currentAxis = axis;
    gizmoOverlay.render(currentMode, currentAxis);
  },
  onDelete: () => {
    sceneManager.removeSelected();
    sceneTree.render();
    inspector.render(sceneManager.getSelected(), handleChange);
    handleChange();
  },
  onFrame: () => {
    const selected = sceneManager.getSelected();
    if (selected?.transform?.position) {
      viewport.frameSelected(selected.transform.position);
    }
  },
  onUndo: () => alert("Deshacer: historial en progreso"),
  onRedo: () => alert("Rehacer: historial en progreso"),
});

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".mode").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  gizmoOverlay.render(mode, currentAxis);
  viewport.setMode(mode);
}

function handleChange() {
  objectCountLabel.textContent = `Objetos: ${sceneManager.nodes.length}`;
  const polyCount = sceneManager.getMeshes().length * 12;
  polyCountLabel.textContent = `Polígonos: ${polyCount}`;
  saveProject();
}

async function saveProject() {
  if (!project) return;
  project.modified = Date.now();
  project.sceneData = sceneManager.toSceneData();
  await saveProjectToIndexedDB(project);
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });
}

function setupToolbar() {
  document.querySelectorAll(".mode").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });
  document.getElementById("save-btn").addEventListener("click", saveProject);
  document.getElementById("play-btn").addEventListener("click", () => {
    alert("Preview en ejecución (placeholder).");
  });
  document.getElementById("menu-btn").addEventListener("click", () => {
    window.location.href = "../launcher/index.html";
  });
  document.getElementById("add-node").addEventListener("click", () => {
    sceneManager.addMesh();
    sceneTree.render();
    inspector.render(sceneManager.getSelected(), handleChange);
    handleChange();
  });
  document.getElementById("frame-selected").addEventListener("click", () => {
    const selected = sceneManager.getSelected();
    if (selected?.transform?.position) {
      viewport.frameSelected(selected.transform.position);
    }
  });
  document.getElementById("frame-all").addEventListener("click", () => viewport.frameAll());
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => viewport.setView(btn.dataset.view));
  });
}

function setupContextMenu() {
  sceneTreeList.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const target = event.target.closest("li");
    if (!target) return;
    sceneManager.selectNode(target.dataset.id);
    sceneTree.render();
    inspector.render(sceneManager.getSelected(), handleChange);
    contextMenu.hidden = false;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;
  });

  document.addEventListener("click", () => {
    contextMenu.hidden = true;
  });

  contextMenu.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    if (action === "duplicate") {
      sceneManager.duplicateSelected();
    }
    if (action === "delete") {
      sceneManager.removeSelected();
    }
    if (action === "rename") {
      const selected = sceneManager.getSelected();
      if (selected) {
        const name = prompt("Nuevo nombre", selected.name);
        if (name) selected.name = name;
      }
    }
    if (action === "add-child") {
      sceneManager.addMesh();
    }
    sceneTree.render();
    inspector.render(sceneManager.getSelected(), handleChange);
    handleChange();
  });
}

function setupMobilePanels() {
  document.querySelectorAll("[data-mobile-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.mobilePanel;
      document.querySelectorAll(".scene-tree, .inspector").forEach((panel) => {
        panel.style.display = "none";
      });
      if (target === "scene") {
        document.querySelector(".scene-tree").style.display = "block";
      }
      if (target === "inspector") {
        document.querySelector(".inspector").style.display = "block";
      }
    });
  });
}

async function loadProject() {
  const projectId = sessionStorage.getItem("currentProject");
  if (!projectId) {
    window.location.href = "../launcher/index.html";
    return;
  }
  project = await loadProjectFromIndexedDB(projectId);
  if (!project) {
    window.location.href = "../launcher/index.html";
    return;
  }

  projectNameLabel.textContent = project.name;
  sceneManager.initFromTemplate(project.template, project.sceneData);
  if (project.template === "2d-empty") {
    viewport.setView("top");
  }
  sceneTree.render();
  inspector.render(sceneManager.getSelected(), handleChange);
  handleChange();
}

function startLoop() {
  const loop = () => {
    viewport.render(sceneManager.getMeshes());
    requestAnimationFrame(loop);
  };
  loop();
}

setupTabs();
setupToolbar();
setupContextMenu();
setupMobilePanels();
setMode("select");
loadProject();
startLoop();
