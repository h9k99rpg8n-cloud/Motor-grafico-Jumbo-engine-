const accentColorPicker = document.getElementById("accentColorPicker");
const backgroundColorPicker = document.getElementById("backgroundColorPicker");
const resetAccentColor = document.getElementById("resetAccentColor");
const defaultAccentColor = "#007AFF";
const defaultBackgroundColor = "#050505";

const applyAccentColor = (color) => {
  document.documentElement.style.setProperty("--jumbo-accent", color);
  document.documentElement.style.setProperty(
    "--jumbo-accent-soft",
    `color-mix(in srgb, ${color} 22%, transparent)`,
  );
  document.documentElement.style.setProperty(
    "--jumbo-accent-strong",
    `color-mix(in srgb, ${color} 85%, #000000)`,
  );
};

const applyBackgroundColor = (color) => {
  document.documentElement.style.setProperty("--jumbo-bg", color);
  window.dispatchEvent(
    new CustomEvent("jumbo-bg-change", {
      detail: { color },
    }),
  );
};

const loadSettings = () => {
  const storedAccent = localStorage.getItem("jumboAccentColor") || defaultAccentColor;
  const storedBackground =
    localStorage.getItem("jumboBackgroundColor") || defaultBackgroundColor;
  if (accentColorPicker) {
    accentColorPicker.value = storedAccent;
  }
  if (backgroundColorPicker) {
    backgroundColorPicker.value = storedBackground;
  }
  applyAccentColor(storedAccent);
  applyBackgroundColor(storedBackground);
};

if (accentColorPicker) {
  accentColorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    applyAccentColor(color);
    localStorage.setItem("jumboAccentColor", color);
  });
}

if (backgroundColorPicker) {
  backgroundColorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    applyBackgroundColor(color);
    localStorage.setItem("jumboBackgroundColor", color);
  });
}

if (resetAccentColor) {
  resetAccentColor.addEventListener("click", () => {
    localStorage.setItem("jumboAccentColor", defaultAccentColor);
    applyAccentColor(defaultAccentColor);
    if (accentColorPicker) {
      accentColorPicker.value = defaultAccentColor;
    }
  });
}

window.addEventListener("load", loadSettings);
