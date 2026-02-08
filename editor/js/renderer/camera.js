export class Camera {
  constructor() {
    this.fov = 60;
    this.near = 0.1;
    this.far = 1000;
    this.position = [10, 10, 10];
    this.target = [0, 0, 0];
    this.up = [0, 1, 0];
    this.transform = {
      position: [...this.position],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
  }
}
