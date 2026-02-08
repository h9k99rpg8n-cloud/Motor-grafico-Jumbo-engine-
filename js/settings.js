const Settings = (() => {
  const storageKey = "jumbo-settings";
  const themeToggle = document.getElementById("themeToggle");
  const languageSelect = document.getElementById("languageSelect");

  const translations = {
    es: {
      createProject: "Crear Proyecto",
      projectManagerTitle: "Gestor de Proyectos",
      projectManagerSubtitle:
        "Diseña experiencias cinemáticas y mundos interactivos con un flujo rápido y elegante.",
      myProjects: "Mis Proyectos",
      projectsEmpty: "Aún no tienes proyectos. ¡Crea el primero!",
      cardFlowTitle: "Flujo Ágil",
      cardFlowText: "Organiza tus escenas, assets y físicas con paneles optimizados para iOS.",
      cardRenderTitle: "Renderizado Flexible",
      cardRenderText: "Elige el perfil ideal para cada proyecto sin sacrificar rendimiento.",
      cardCreativeTitle: "Motor Creativo",
      cardCreativeText:
        "Crea cinemáticas inmersivas con herramientas listas para producción.",
      welcomeTitle: "Bienvenido a Jumbo",
      welcomeBody:
        "En este motor podrás desarrollar juegos complejos, cinemáticas y todo lo que tú imaginas.",
      continue: "Continuar",
      newProject: "Nuevo Proyecto",
      projectName: "Nombre del Proyecto",
      projectDescription: "Descripción",
      projectNamePlaceholder: "Jumbo Odyssey",
      projectDescriptionPlaceholder: "Describe la visión del juego",
      renderType: "Tipo de Renderizado",
      renderCompatTitle: "Máxima Compatibilidad",
      renderCompatSubtitle: "Optimizado para iPhone 11 y móviles",
      renderWebTitle: "Web",
      renderWebSubtitle: "Rendimiento universal para todos los dispositivos",
      create: "Crear",
      settingsTitle: "Ajustes",
      appearance: "Apariencia",
      appearanceHint: "Cambia entre modo oscuro y claro.",
      language: "Idioma",
      languageHint: "Selecciona tu idioma preferido.",
      info: "Info",
      infoText: "Jumbo Engine • Alpha 0.3 · UI & UX Lab",
      toastMessage: "Gracias por probar la aplicación",
    },
    en: {
      createProject: "Create Project",
      projectManagerTitle: "Project Manager",
      projectManagerSubtitle:
        "Design cinematic experiences and interactive worlds with a fast, elegant flow.",
      myProjects: "My Projects",
      projectsEmpty: "You don't have projects yet. Create the first one!",
      cardFlowTitle: "Agile Flow",
      cardFlowText: "Organize scenes, assets, and physics with iOS-optimized panels.",
      cardRenderTitle: "Flexible Rendering",
      cardRenderText: "Pick the ideal profile for each project without losing performance.",
      cardCreativeTitle: "Creative Engine",
      cardCreativeText: "Craft immersive cinematics with production-ready tools.",
      welcomeTitle: "Welcome to Jumbo",
      welcomeBody:
        "In this engine you can build complex games, cinematics, and everything you imagine.",
      continue: "Continue",
      newProject: "New Project",
      projectName: "Project Name",
      projectDescription: "Description",
      projectNamePlaceholder: "Jumbo Odyssey",
      projectDescriptionPlaceholder: "Describe the game vision",
      renderType: "Render Type",
      renderCompatTitle: "Maximum Compatibility",
      renderCompatSubtitle: "Optimized for iPhone 11 and mobile devices",
      renderWebTitle: "Web",
      renderWebSubtitle: "Universal performance for all devices",
      create: "Create",
      settingsTitle: "Settings",
      appearance: "Appearance",
      appearanceHint: "Switch between dark and light mode.",
      language: "Language",
      languageHint: "Select your preferred language.",
      info: "Info",
      infoText: "Jumbo Engine • Alpha 0.3 · UI & UX Lab",
      toastMessage: "Thanks for trying the app",
    },
  };

  const getSettings = () => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { theme: "dark", language: "es" };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme || "dark",
        language: parsed.language || "es",
      };
    } catch (error) {
      return { theme: "dark", language: "es" };
    }
  };

  const saveSettings = (settings) => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("theme-light", theme === "light");
  };

  const applyLanguage = (language) => {
    const dictionary = translations[language] || translations.es;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (dictionary[key]) {
        node.textContent = dictionary[key];
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      if (dictionary[key]) {
        node.setAttribute("placeholder", dictionary[key]);
      }
    });
  };

  const init = () => {
    const settings = getSettings();
    applyTheme(settings.theme);
    applyLanguage(settings.language);
    themeToggle.checked = settings.theme === "light";
    languageSelect.value = settings.language;

    themeToggle.addEventListener("change", () => {
      const nextTheme = themeToggle.checked ? "light" : "dark";
      applyTheme(nextTheme);
      saveSettings({ ...settings, theme: nextTheme, language: languageSelect.value });
    });

    languageSelect.addEventListener("change", () => {
      const nextLanguage = languageSelect.value;
      applyLanguage(nextLanguage);
      saveSettings({ ...settings, theme: themeToggle.checked ? "light" : "dark", language: nextLanguage });
    });
  };

  return {
    init,
    getTranslations: () => translations,
    getCurrentLanguage: () => languageSelect.value || "es",
  };
})();

window.Settings = Settings;
