const welcomeModal = document.getElementById("welcomeModal");
const projectModal = document.getElementById("projectModal");
const welcomeContinue = document.getElementById("welcomeContinue");
const createProjectBtn = document.getElementById("createProjectBtn");
const createProjectInline = document.getElementById("createProjectInline");
const closeProjectModal = document.getElementById("closeProjectModal");
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
  showModal(welcomeModal);
});

welcomeContinue.addEventListener("click", () => {
  hideModal(welcomeModal);
});

createProjectBtn.addEventListener("click", () => {
  showModal(projectModal);
});

if (createProjectInline) {
  createProjectInline.addEventListener("click", () => {
    showModal(projectModal);
  });
}

closeProjectModal.addEventListener("click", () => {
  hideModal(projectModal);
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const projectName = formData.get("projectName");
  const projectDescription = formData.get("projectDescription");
  const renderType = formData.get("renderType");
  const renderTypeLabel =
    renderType === "compat"
      ? "Máxima Compatibilidad"
      : "Web";
  hideModal(projectModal);
  showToast();
  if (typeof window.addProjectToList === "function") {
    window.addProjectToList({
      name: projectName,
      description: projectDescription,
      renderType,
      renderTypeLabel,
      createdAt: Date.now(),
    });
  }
  projectForm.reset();
  setTimeout(() => {
    if (typeof window.initJumboEditor === "function") {
      window.initJumboEditor(projectName);
    }
  }, 1200);
});

[welcomeModal, projectModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal(modal);
    }
  });
});
