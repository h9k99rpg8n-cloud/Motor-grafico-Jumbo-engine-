const accentColorPicker = document.getElementById("accentColorPicker");
const resetAccentColor = document.getElementById("resetAccentColor");
const defaultAccentColor = "#007AFF";

const applyAccentColor = (color) => {
  document.documentElement.style.setProperty("--jumbo-accent-color", color);
  document.documentElement.style.setProperty(
    "--jumbo-accent-soft",
    `color-mix(in srgb, ${color} 22%, transparent)`,
  );
  document.documentElement.style.setProperty(
    "--jumbo-accent-strong",
    `color-mix(in srgb, ${color} 85%, #000000)`,
  );
};

const loadAccentColor = () => {
  const storedColor = localStorage.getItem("jumboAccentColor") || defaultAccentColor;
  if (accentColorPicker) {
    accentColorPicker.value = storedColor;
  }
  applyAccentColor(storedColor);
};

if (accentColorPicker) {
  accentColorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    applyAccentColor(color);
    localStorage.setItem("jumboAccentColor", color);
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

window.addEventListener("load", loadAccentColor);
