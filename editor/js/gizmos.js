export class GizmosOverlay {
  constructor(container) {
    this.container = container;
  }

  render(mode, axis) {
    this.container.innerHTML = "";
    const modePill = document.createElement("div");
    modePill.className = "gizmo-pill";
    modePill.textContent = `Modo: ${mode}`;
    this.container.appendChild(modePill);

    if (axis) {
      const axisPill = document.createElement("div");
      axisPill.className = "gizmo-pill";
      axisPill.textContent = `Eje: ${axis.toUpperCase()}`;
      this.container.appendChild(axisPill);
    }
  }
}
