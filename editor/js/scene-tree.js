const ICONS = {
  Mesh: "🧊",
  Light: "💡",
  Camera: "📷",
};

export class SceneTree {
  constructor(container, sceneManager, { onSelect, onChange }) {
    this.container = container;
    this.sceneManager = sceneManager;
    this.onSelect = onSelect;
    this.onChange = onChange;
    this.draggingId = null;
  }

  render() {
    const nodes = this.sceneManager.nodes;
    this.container.innerHTML = "";
    nodes.forEach((node) => {
      const li = document.createElement("li");
      li.dataset.id = node.id;
      li.draggable = true;
      if (this.sceneManager.selectedId === node.id) {
        li.classList.add("selected");
      }

      const info = document.createElement("div");
      info.className = "node-info";
      info.innerHTML = `<span>${ICONS[node.type] || "📦"}</span>`;

      const nameInput = document.createElement("input");
      nameInput.value = node.name;
      nameInput.addEventListener("change", () => {
        node.name = nameInput.value;
        this.onChange?.();
      });
      info.appendChild(nameInput);

      const actions = document.createElement("div");
      actions.className = "node-actions";
      const eye = document.createElement("button");
      eye.className = "btn small";
      eye.textContent = node.visible === false ? "🙈" : "👁";
      eye.addEventListener("click", (event) => {
        event.stopPropagation();
        node.visible = !node.visible;
        this.render();
        this.onChange?.();
      });

      const lock = document.createElement("button");
      lock.className = "btn small";
      lock.textContent = node.locked ? "🔒" : "🔓";
      lock.addEventListener("click", (event) => {
        event.stopPropagation();
        node.locked = !node.locked;
        this.render();
        this.onChange?.();
      });

      actions.appendChild(eye);
      actions.appendChild(lock);

      li.appendChild(info);
      li.appendChild(actions);

      li.addEventListener("click", () => {
        this.sceneManager.selectNode(node.id);
        this.onSelect?.(node);
        this.render();
      });

      li.addEventListener("dragstart", () => {
        this.draggingId = node.id;
      });

      li.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      li.addEventListener("drop", (event) => {
        event.preventDefault();
        const targetId = node.id;
        if (this.draggingId && this.draggingId !== targetId) {
          const dragged = nodes.find((item) => item.id === this.draggingId);
          if (dragged) {
            dragged.parent = targetId;
            this.onChange?.();
          }
        }
        this.draggingId = null;
      });

      this.container.appendChild(li);
    });
  }
}
