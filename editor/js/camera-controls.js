export class CameraControls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.yaw = 45;
    this.pitch = 30;
    this.distance = 18;
    this.target = [0, 0, 0];
    this.isDragging = false;
    this.isPanning = false;
    this.lastPosition = { x: 0, y: 0 };
    this.touchState = null;
    this.attachEvents();
    this.updateCamera();
  }

  attachEvents() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.isDragging = event.button === 0;
      this.isPanning = event.button === 2;
      this.lastPosition = { x: event.clientX, y: event.clientY };
      this.canvas.setPointerCapture(event.pointerId);
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.isDragging && !this.isPanning) return;
      const dx = event.clientX - this.lastPosition.x;
      const dy = event.clientY - this.lastPosition.y;
      this.lastPosition = { x: event.clientX, y: event.clientY };

      if (this.isDragging) {
        this.yaw += dx * 0.3;
        this.pitch = clamp(this.pitch + dy * 0.3, -89, 89);
      } else if (this.isPanning) {
        this.pan(dx, dy);
      }
      this.updateCamera();
    });

    this.canvas.addEventListener("pointerup", (event) => {
      this.isDragging = false;
      this.isPanning = false;
      this.canvas.releasePointerCapture(event.pointerId);
    });

    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.distance = clamp(this.distance + event.deltaY * 0.01, 2, 200);
      this.updateCamera();
    }, { passive: false });

    this.canvas.addEventListener("touchstart", (event) => this.handleTouchStart(event), { passive: false });
    this.canvas.addEventListener("touchmove", (event) => this.handleTouchMove(event), { passive: false });
    this.canvas.addEventListener("touchend", () => { this.touchState = null; }, { passive: false });
  }

  handleTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchState = { type: "rotate", x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      const [a, b] = event.touches;
      this.touchState = {
        type: "zoom-pan",
        distance: distance(a, b),
        center: midpoint(a, b),
      };
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    if (!this.touchState) return;
    if (this.touchState.type === "rotate" && event.touches.length === 1) {
      const touch = event.touches[0];
      const dx = touch.clientX - this.touchState.x;
      const dy = touch.clientY - this.touchState.y;
      this.touchState.x = touch.clientX;
      this.touchState.y = touch.clientY;
      this.yaw += dx * 0.3;
      this.pitch = clamp(this.pitch + dy * 0.3, -89, 89);
      this.updateCamera();
    }

    if (this.touchState.type === "zoom-pan" && event.touches.length === 2) {
      const [a, b] = event.touches;
      const newDistance = distance(a, b);
      const zoomDelta = this.touchState.distance - newDistance;
      this.distance = clamp(this.distance + zoomDelta * 0.02, 2, 200);
      const newCenter = midpoint(a, b);
      const dx = newCenter.x - this.touchState.center.x;
      const dy = newCenter.y - this.touchState.center.y;
      this.pan(dx, dy);
      this.touchState.distance = newDistance;
      this.touchState.center = newCenter;
      this.updateCamera();
    }
  }

  pan(dx, dy) {
    const panSpeed = this.distance * 0.002;
    this.target[0] -= dx * panSpeed;
    this.target[1] += dy * panSpeed;
  }

  updateCamera() {
    const radYaw = (this.yaw * Math.PI) / 180;
    const radPitch = (this.pitch * Math.PI) / 180;
    const x = this.target[0] + this.distance * Math.cos(radPitch) * Math.sin(radYaw);
    const y = this.target[1] + this.distance * Math.sin(radPitch);
    const z = this.target[2] + this.distance * Math.cos(radPitch) * Math.cos(radYaw);
    this.camera.position = [x, y, z];
    this.camera.target = [...this.target];
  }

  setView(preset) {
    const views = {
      front: [0, 0, 1],
      back: [0, 0, -1],
      top: [0, 1, 0],
      bottom: [0, -1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0],
      perspective: [1, 1, 1],
    };
    const dir = views[preset] || views.perspective;
    this.distance = 18;
    this.target = [0, 0, 0];
    this.yaw = Math.atan2(dir[0], dir[2]) * (180 / Math.PI);
    this.pitch = Math.asin(dir[1]) * (180 / Math.PI);
    this.updateCamera();
  }

  frame(target = [0, 0, 0], distance = 12) {
    this.target = [...target];
    this.distance = distance;
    this.updateCamera();
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function midpoint(a, b) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}
