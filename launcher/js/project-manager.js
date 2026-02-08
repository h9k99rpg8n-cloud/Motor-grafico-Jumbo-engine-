import { deleteProject, getAllProjects, getProject, removeFromRecent, updateRecentList } from "./storage.js";

const defaultThumb = "./assets/thumbnails/template-3d.svg";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function estimateSize(project) {
  const bytes = new TextEncoder().encode(JSON.stringify(project)).length;
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
}

function projectCard(project, layout) {
  const thumb = project.thumbnail || defaultThumb;
  const meta = `
    <div class="meta">
      <strong>${project.name}</strong>
      <span>Modificado: ${formatDate(project.modified)}</span>
      <span>Tamaño: ${estimateSize(project)}</span>
    </div>
    <div class="project-actions">
      <button class="btn primary" data-action="open" data-id="${project.id}">Abrir en editor</button>
      <button class="btn" data-action="rename" data-id="${project.id}">Renombrar</button>
      <button class="btn" data-action="export" data-id="${project.id}">Exportar</button>
      <button class="btn" data-action="delete" data-id="${project.id}">Eliminar</button>
    </div>
  `;

  if (layout === "list") {
    return `
      <div class="project-row">
        <img src="${thumb}" alt="${project.name}" />
        ${meta}
      </div>
    `;
  }

  return `
    <div class="project-card">
      <img src="${thumb}" alt="${project.name}" />
      ${meta}
    </div>
  `;
}

export async function renderProjects(container, layout = "grid") {
  const projects = await getAllProjects();
  if (!projects.length) {
    container.innerHTML = `<p class="empty">Aún no tienes proyectos guardados.</p>`;
    return;
  }

  container.className = layout === "list" ? "project-list" : "project-grid";
  container.innerHTML = projects
    .sort((a, b) => b.modified - a.modified)
    .map((project) => projectCard(project, layout))
    .join("");
}

export async function handleProjectAction(action, id) {
  if (action === "open") {
    updateRecentList(await getProject(id));
    window.location.href = `./editor.html?id=${encodeURIComponent(id)}`;
    return;
  }

  if (action === "rename") {
    const project = await getProject(id);
    const name = window.prompt("Nuevo nombre del proyecto", project.name);
    if (name) {
      project.name = name;
      project.modified = Date.now();
      await saveAndRefresh(project);
    }
    return;
  }

  if (action === "delete") {
    if (window.confirm("¿Eliminar este proyecto?")) {
      await deleteProject(id);
      removeFromRecent(id);
    }
    return;
  }

  if (action === "export") {
    const project = await getProject(id);
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

async function saveAndRefresh(project) {
  const { saveProject } = await import("./storage.js");
  await saveProject(project);
  updateRecentList(project);
}
