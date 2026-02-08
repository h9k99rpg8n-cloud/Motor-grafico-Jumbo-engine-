import { Mesh } from "./renderer/mesh.js";
import { Light } from "./renderer/light.js";
import { Camera } from "./renderer/camera.js";
import { Material } from "./renderer/material.js";

export class SceneManager {
  constructor() {
    this.nodes = [];
    this.selectedId = null;
  }

  initFromTemplate(template, sceneData) {
    if (sceneData?.nodes?.length) {
      this.nodes = sceneData.nodes.map((node) => this.createNode(node));
      return;
    }

    if (template === "2d-empty") {
      this.nodes = [
        createCameraNode("camera-main", "Camera2D"),
      ];
      return;
    }

    if (template === "demo-scene") {
      this.nodes = [
        new Mesh({
          id: "mesh-cube",
          name: "Cube",
          geometry: "cube",
          transform: baseTransform([0, 0.5, 0]),
          material: new Material({ color: [0.8, 0.3, 0.3, 1] }),
        }),
        new Mesh({
          id: "mesh-sphere",
          name: "Sphere",
          geometry: "sphere",
          transform: baseTransform([2, 0.5, 0]),
          material: new Material({ color: [0.3, 0.7, 0.9, 1] }),
        }),
        new Mesh({
          id: "mesh-cylinder",
          name: "Cylinder",
          geometry: "cylinder",
          transform: baseTransform([-2, 0.5, 0]),
          material: new Material({ color: [0.6, 0.8, 0.4, 1] }),
        }),
        new Light({ id: "light-main", name: "DirectionalLight", transform: baseTransform([5, 10, 5]) }),
        createCameraNode("camera-main", "MainCamera"),
      ];
      return;
    }

    this.nodes = [
      new Mesh({
        id: "mesh-cube",
        name: "Cube",
        geometry: "cube",
        transform: baseTransform([0, 0.5, 0]),
        material: new Material(),
      }),
      new Light({ id: "light-main", name: "DirectionalLight", transform: baseTransform([5, 10, 5]) }),
      createCameraNode("camera-main", "MainCamera"),
    ];
  }

  createNode(node) {
    if (node.type === "Mesh") {
      return new Mesh({
        ...node,
        material: new Material(node.material),
      });
    }
    if (node.type === "Light") {
      return new Light(node);
    }
    if (node.type === "Camera") {
      return Object.assign(createCameraNode(node.id, node.name), node);
    }
    return node;
  }

  getMeshes() {
    return this.nodes.filter((node) => node.type === "Mesh");
  }

  selectNode(id) {
    this.selectedId = id;
  }

  getSelected() {
    return this.nodes.find((node) => node.id === this.selectedId);
  }

  addMesh() {
    const id = `mesh-${Date.now()}`;
    const mesh = new Mesh({
      id,
      name: "NuevoMesh",
      geometry: "cube",
      transform: baseTransform([0, 0.5, 0]),
      material: new Material(),
    });
    this.nodes.push(mesh);
    this.selectedId = id;
  }

  removeSelected() {
    if (!this.selectedId) return;
    this.nodes = this.nodes.filter((node) => node.id !== this.selectedId);
    this.selectedId = null;
  }

  duplicateSelected() {
    const selected = this.getSelected();
    if (!selected) return;
    const id = `${selected.id}-copy-${Date.now()}`;
    const clone = JSON.parse(JSON.stringify(selected));
    clone.id = id;
    clone.name = `${selected.name} Copy`;
    this.nodes.push(this.createNode(clone));
    this.selectedId = id;
  }

  toSceneData() {
    return {
      nodes: this.nodes.map((node) => ({
        ...node,
        material: node.material,
      })),
    };
  }
}

function baseTransform(position = [0, 0, 0]) {
  return {
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

function createCameraNode(id, name) {
  const camera = new Camera();
  camera.id = id;
  camera.type = "Camera";
  camera.name = name;
  camera.transform.position = [...camera.position];
  return camera;
}
