const projectsList = document.getElementById("projectsList");
const projectsEmpty = document.getElementById("projectsEmpty");
const projectsCount = document.getElementById("projectsCount");
const myProjectsBtn = document.getElementById("myProjectsBtn");

const getStoredProjects = () => {
  const raw = localStorage.getItem("jumbo_projects");
  if (!raw) {
    localStorage.setItem("jumbo_projects", JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.setItem("jumbo_projects", JSON.stringify([]));
    return [];
  }
};

const saveProject = (project) => {
  const projects = getStoredProjects();
  projects.unshift(project);
  localStorage.setItem("jumbo_projects", JSON.stringify(projects));
};

const renderProjectsList = () => {
  const projects = getStoredProjects();
  if (!projectsList || !projectsEmpty || !projectsCount) {
    return;
  }

  projectsList.innerHTML = "";
  projectsCount.textContent = `${projects.length}`;

  if (projects.length === 0) {
    projectsEmpty.style.display = "block";
    return;
  }

  projectsEmpty.style.display = "none";
  projects.forEach((project) => {
    const item = document.createElement("li");
    item.className = "projects__item";
    const title = document.createElement("strong");
    title.textContent = project.name || "Proyecto";
    const meta = document.createElement("span");
    meta.textContent = project.description || "Sin descripción";
    item.append(title, meta);
    projectsList.appendChild(item);
  });

  if (myProjectsBtn) {
    myProjectsBtn.classList.add("pulse");
    if (!myProjectsBtn.querySelector(".button-indicator")) {
      const indicator = document.createElement("span");
      indicator.className = "button-indicator";
      myProjectsBtn.appendChild(indicator);
    }
    setTimeout(() => {
      myProjectsBtn.classList.remove("pulse");
    }, 1500);
  }
};

if (myProjectsBtn) {
  myProjectsBtn.addEventListener("click", () => {
    const projectsSection = document.querySelector(".projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

window.renderProjectsList = renderProjectsList;
window.saveProject = saveProject;

window.addEventListener("load", () => {
  renderProjectsList();
});
