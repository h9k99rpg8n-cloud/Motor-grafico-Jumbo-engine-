const welcomeModal = document.getElementById("welcomeModal");
const projectModal = document.getElementById("projectModal");
const welcomeContinue = document.getElementById("welcomeContinue");
const whatsNewModal = document.getElementById("whatsNewModal");
const skipWhatsNew = document.getElementById("skipWhatsNew");
const updateNewsModal = document.getElementById("updateNewsModal");
const acknowledgeUpdate = document.getElementById("acknowledgeUpdate");
const createProjectBtn = document.getElementById("createProjectBtn");
const closeProjectModal = document.getElementById("closeProjectModal");
const projectForm = document.getElementById("projectForm");
const toast = document.getElementById("toast");
const whatsNewKey = "jumboWhatsNewSeen";
const updateNewsKey = "jumboUpdateNewsSeen";

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
  if (updateNewsModal && !sessionStorage.getItem(updateNewsKey)) {
    showModal(updateNewsModal);
    sessionStorage.setItem(updateNewsKey, "true");
  }
});

welcomeContinue.addEventListener("click", () => {
  hideModal(welcomeModal);
  if (whatsNewModal && !sessionStorage.getItem(whatsNewKey)) {
    showModal(whatsNewModal);
    sessionStorage.setItem(whatsNewKey, "true");
  }
});

if (skipWhatsNew) {
  skipWhatsNew.addEventListener("click", () => {
    hideModal(whatsNewModal);
  });
}

if (acknowledgeUpdate) {
  acknowledgeUpdate.addEventListener("click", () => {
    hideModal(updateNewsModal);
  });
}

createProjectBtn.addEventListener("click", () => {
  showModal(projectModal);
});

closeProjectModal.addEventListener("click", () => {
  hideModal(projectModal);
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const projectName = formData.get("projectName");
  const projectDescription = formData.get("projectDescription");
  if (typeof window.saveProject === "function") {
    window.saveProject({
      name: projectName,
      description: projectDescription,
      createdAt: new Date().toISOString(),
    });
  }
  hideModal(projectModal);
  showToast();
  projectForm.reset();
  if (typeof window.renderProjectsList === "function") {
    window.renderProjectsList();
  }
  setTimeout(() => {
    if (typeof window.initJumboEditor === "function") {
      window.initJumboEditor(projectName);
    }
  }, 1200);
});

[welcomeModal, whatsNewModal, updateNewsModal, projectModal]
  .filter(Boolean)
  .forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal(modal);
    }
  });
});
