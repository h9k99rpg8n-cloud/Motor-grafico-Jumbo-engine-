export class Mesh {
  constructor({ id, name, geometry, transform, material, visible = true, locked = false }) {
    this.id = id;
    this.type = "Mesh";
    this.name = name || geometry;
    this.geometry = geometry;
    this.transform = transform;
    this.material = material;
    this.visible = visible;
    this.locked = locked;
  }
}
