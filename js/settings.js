const accentColorPickers = document.querySelectorAll("[data-accent-picker]");
const resetAccentButtons = document.querySelectorAll("[data-accent-reset]");
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
  accentColorPickers.forEach((picker) => {
    picker.value = storedColor;
  });
  applyAccentColor(storedColor);
};

accentColorPickers.forEach((picker) => {
  picker.addEventListener("input", (event) => {
    const color = event.target.value;
    applyAccentColor(color);
    localStorage.setItem("jumboAccentColor", color);
    accentColorPickers.forEach((otherPicker) => {
      if (otherPicker !== picker) {
        otherPicker.value = color;
      }
    });
  });
});

resetAccentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.setItem("jumboAccentColor", defaultAccentColor);
    applyAccentColor(defaultAccentColor);
    accentColorPickers.forEach((picker) => {
      picker.value = defaultAccentColor;
    });
  });
});

window.addEventListener("load", loadAccentColor);
