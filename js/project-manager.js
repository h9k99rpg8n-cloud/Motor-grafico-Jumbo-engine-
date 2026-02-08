const ProjectManager = (() => {
  const storageKey = "jumbo-projects";
  const listElement = document.getElementById("projectsList");
  const emptyElement = document.getElementById("projectsEmpty");

  const getProjects = () => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveProjects = (projects) => {
    localStorage.setItem(storageKey, JSON.stringify(projects));
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const render = () => {
    const projects = getProjects();
    listElement.innerHTML = "";
    emptyElement.classList.toggle("is-hidden", projects.length > 0);

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const header = document.createElement("div");
      header.className = "project-card__header";

      const title = document.createElement("h3");
      title.textContent = project.name;

      const meta = document.createElement("span");
      meta.className = "project-card__meta";
      meta.textContent = formatDate(project.createdAt);

      header.append(title, meta);

      const description = document.createElement("p");
      description.textContent = project.description || "—";

      const tag = document.createElement("span");
      tag.className = "project-card__tag";
      tag.textContent = project.renderTypeLabel;

      card.append(header, description, tag);
      listElement.appendChild(card);
    });
  };

  const addProject = ({ name, description, renderType, renderTypeLabel }) => {
    const projects = getProjects();
    projects.unshift({
      id: crypto.randomUUID(),
      name,
      description,
      renderType,
      renderTypeLabel,
      createdAt: new Date().toISOString(),
    });
    saveProjects(projects);
    render();
  };

  return {
    render,
    addProject,
  };
})();

window.ProjectManager = ProjectManager;
