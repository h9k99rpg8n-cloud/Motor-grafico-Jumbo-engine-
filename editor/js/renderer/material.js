export class Material {
  constructor({ color = [0.8, 0.8, 0.8, 1], shader = "basic" } = {}) {
    this.color = color;
    this.shader = shader;
  }
}
