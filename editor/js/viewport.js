import { WebGLRenderer, mat4LookAt, mat4Perspective } from "./renderer/webgl-renderer.js";
import { Camera } from "./renderer/camera.js";
import { CameraControls } from "./camera-controls.js";

export class Viewport {
  constructor(canvas, { onFrame }) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer(canvas);
    this.camera = new Camera();
    this.controls = new CameraControls(this.camera, canvas);
    this.onFrame = onFrame;
    this.lastTime = performance.now();
    this.mode = "select";
  }

  setMode(mode) {
    this.mode = mode;
  }

  setView(preset) {
    this.controls.setView(preset);
  }

  frameSelected(target) {
    this.controls.frame(target, 8);
  }

  frameAll() {
    this.controls.frame([0, 0, 0], 18);
  }

  render(meshes) {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const projection = mat4Perspective(this.camera.fov, aspect, this.camera.near, this.camera.far);
    const view = mat4LookAt(this.camera.position, this.camera.target, this.camera.up);

    this.renderer.render({ projection, view, meshes, gizmoMode: this.mode });

    if (this.onFrame) {
      this.onFrame({ delta, renderer: this.renderer });
    }
  }
}
