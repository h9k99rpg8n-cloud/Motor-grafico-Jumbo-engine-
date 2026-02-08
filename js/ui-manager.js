const welcomeModal = document.getElementById("welcomeModal");
const projectModal = document.getElementById("projectModal");
const settingsPanel = document.getElementById("settingsPanel");
const welcomeContinue = document.getElementById("welcomeContinue");
const createProjectBtn = document.getElementById("createProjectBtn");
const createProjectSecondary = document.getElementById("createProjectSecondary");
const closeProjectModal = document.getElementById("closeProjectModal");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const projectForm = document.getElementById("projectForm");
const toast = document.getElementById("toast");

const showModal = (modal) => {
  modal.classList.add("is-visible");
};

const hideModal = (modal) => {
  modal.classList.remove("is-visible");
};

const showToast = () => {
  toast.classList.add("is-visible");
  setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
};

window.addEventListener("load", () => {
  Settings.init();
  ProjectManager.render();
  showModal(welcomeModal);
});

welcomeContinue.addEventListener("click", () => {
  hideModal(welcomeModal);
});

[createProjectBtn, createProjectSecondary].forEach((button) => {
  button.addEventListener("click", () => {
    showModal(projectModal);
  });
});

closeProjectModal.addEventListener("click", () => {
  hideModal(projectModal);
});

settingsBtn.addEventListener("click", () => {
  showModal(settingsPanel);
});

closeSettings.addEventListener("click", () => {
  hideModal(settingsPanel);
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(projectForm);
  const renderType = formData.get("renderType");
  const renderLabels = {
    compat: document.querySelector("[data-i18n='renderCompatTitle']").textContent,
    web: document.querySelector("[data-i18n='renderWebTitle']").textContent,
  };

  ProjectManager.addProject({
    name: formData.get("projectName"),
    description: formData.get("projectDescription"),
    renderType,
    renderTypeLabel: renderLabels[renderType],
  });

  hideModal(projectModal);
  showToast();
  projectForm.reset();
});

[welcomeModal, projectModal, settingsPanel].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal(modal);
    }
  });
});
