export class Light {
  constructor({ id, name, lightType = "directional", color = [1, 1, 1], intensity = 1, transform }) {
    this.id = id;
    this.type = "Light";
    this.name = name || "Light";
    this.lightType = lightType;
    this.color = color;
    this.intensity = intensity;
    this.transform = transform;
  }
}
