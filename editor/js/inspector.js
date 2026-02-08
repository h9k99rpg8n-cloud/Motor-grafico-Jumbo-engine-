export class Inspector {
  constructor(transformContainer, materialContainer) {
    this.transformContainer = transformContainer;
    this.materialContainer = materialContainer;
  }

  render(node, onChange) {
    this.transformContainer.innerHTML = "";
    this.materialContainer.innerHTML = "";
    if (!node) {
      this.transformContainer.innerHTML = "<p>Selecciona un objeto.</p>";
      this.materialContainer.innerHTML = "<p>Selecciona un objeto.</p>";
      return;
    }

    this.transformContainer.appendChild(this.createVectorField("Position", node.transform.position, (values) => {
      node.transform.position = values;
      onChange?.();
    }));

    this.transformContainer.appendChild(this.createVectorField("Rotation", node.transform.rotation, (values) => {
      node.transform.rotation = values;
      onChange?.();
    }));

    this.transformContainer.appendChild(this.createVectorField("Scale", node.transform.scale, (values) => {
      node.transform.scale = values;
      onChange?.();
    }));

    const reset = document.createElement("button");
    reset.className = "btn";
    reset.textContent = "Reset Transform";
    reset.addEventListener("click", () => {
      node.transform.position = [0, 0, 0];
      node.transform.rotation = [0, 0, 0];
      node.transform.scale = [1, 1, 1];
      this.render(node, onChange);
      onChange?.();
    });
    this.transformContainer.appendChild(reset);

    if (node.material) {
      const colorLabel = document.createElement("label");
      colorLabel.textContent = "Color";
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      const [r, g, b] = node.material.color;
      colorInput.value = rgbToHex(r, g, b);
      colorInput.addEventListener("input", () => {
        const [nr, ng, nb] = hexToRgb(colorInput.value);
        node.material.color = [nr, ng, nb, 1];
        onChange?.();
      });
      colorLabel.appendChild(colorInput);
      this.materialContainer.appendChild(colorLabel);

      const shaderLabel = document.createElement("label");
      shaderLabel.textContent = "Shader";
      const select = document.createElement("select");
      ["basic"].forEach((shader) => {
        const option = document.createElement("option");
        option.value = shader;
        option.textContent = shader;
        select.appendChild(option);
      });
      select.value = node.material.shader || "basic";
      select.addEventListener("change", () => {
        node.material.shader = select.value;
        onChange?.();
      });
      shaderLabel.appendChild(select);
      this.materialContainer.appendChild(shaderLabel);
    } else {
      this.materialContainer.innerHTML = "<p>Este nodo no tiene material.</p>";
    }
  }

  createVectorField(label, values, onChange) {
    const wrapper = document.createElement("div");
    wrapper.className = "field-row";
    const title = document.createElement("span");
    title.textContent = label;
    wrapper.appendChild(title);
    ["X", "Y", "Z"].forEach((axis, index) => {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.1";
      input.value = values[index];
      input.addEventListener("change", () => {
        const next = [...values];
        next[index] = parseFloat(input.value);
        onChange(next);
      });
      wrapper.appendChild(input);
    });
    return wrapper;
  }
}

function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value) {
  const hex = Math.round(value * 255).toString(16).padStart(2, "0");
  return hex;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return [r, g, b];
}
