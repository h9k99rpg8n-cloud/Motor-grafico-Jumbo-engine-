const projectsList = document.getElementById("projectsList");
const projectsEmpty = document.getElementById("projectsEmpty");
const settingsModal = document.getElementById("settingsModal");
const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");
const languageSelect = document.getElementById("languageSelect");
const themeToggle = document.getElementById("themeToggle");

const PROJECTS_KEY = "jumboProjects";
const THEME_KEY = "jumboTheme";
const LANGUAGE_KEY = "jumboLanguage";

const getProjects = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveProjects = (projects) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const renderProjects = () => {
  if (!projectsList) {
    return;
  }

  const projects = getProjects();
  projectsList.innerHTML = "";

  if (!projects.length) {
    projectsEmpty.classList.remove("is-hidden");
    return;
  }

  projectsEmpty.classList.add("is-hidden");

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.name || "Proyecto sin nombre";

    const description = document.createElement("p");
    description.textContent = project.description || "Sin descripción";

    const meta = document.createElement("span");
    meta.textContent = project.renderTypeLabel || "Renderizado";

    card.append(title, description, meta);
    projectsList.appendChild(card);
  });
};

const addProject = (project) => {
  const projects = getProjects();
  projects.unshift(project);
  saveProjects(projects);
  renderProjects();
};

const openModal = (modal) => {
  if (modal) {
    modal.classList.add("is-visible");
  }
};

const closeModal = (modal) => {
  if (modal) {
    modal.classList.remove("is-visible");
  }
};

const applyTheme = (theme) => {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  if (themeToggle) {
    themeToggle.checked = isLight;
  }
  localStorage.setItem(THEME_KEY, theme);
};

const loadPreferences = () => {
  const storedTheme = localStorage.getItem(THEME_KEY) || "dark";
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY) || "es";

  applyTheme(storedTheme);

  if (languageSelect) {
    languageSelect.value = storedLanguage;
  }
};

if (openSettings) {
  openSettings.addEventListener("click", () => openModal(settingsModal));
}

if (closeSettings) {
  closeSettings.addEventListener("click", () => closeModal(settingsModal));
}

if (settingsModal) {
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeModal(settingsModal);
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("change", (event) => {
    applyTheme(event.target.checked ? "light" : "dark");
  });
}

if (languageSelect) {
  languageSelect.addEventListener("change", (event) => {
    localStorage.setItem(LANGUAGE_KEY, event.target.value);
  });
}

window.addProjectToList = addProject;
window.renderProjectsList = renderProjects;

window.addEventListener("load", () => {
  loadPreferences();
  renderProjects();
});
