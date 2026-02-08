export const templates = [
  {
    id: "3d-empty",
    name: "Proyecto 3D vacío",
    description: "Escena base con cámara, luz direccional y entorno vacío.",
    thumbnail: "./assets/thumbnails/template-3d.svg",
  },
  {
    id: "2d-empty",
    name: "Proyecto 2D vacío",
    description: "Viewport 2D con cámara ortográfica y canvas limpio.",
    thumbnail: "./assets/thumbnails/template-2d.svg",
  },
  {
    id: "demo-scene",
    name: "Proyecto con escena demo",
    description: "Escena de ejemplo con geometría, UI básica y scripts.",
    thumbnail: "./assets/thumbnails/template-demo.svg",
  },
];

export const renderers = [
  { id: "webgl2", name: "WebGL 2.0" },
  { id: "webgl1", name: "WebGL 1.0 (fallback)" },
];
