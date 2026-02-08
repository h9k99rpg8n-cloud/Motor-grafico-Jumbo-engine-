const CACHE_NAME = "jumbo-launcher-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./editor.html",
  "./css/launcher.css",
  "./css/dialogs.css",
  "./js/launcher.js",
  "./js/project-manager.js",
  "./js/storage.js",
  "./js/templates.js",
  "./manifest.json",
  "./assets/icons/jumbo-icon.svg",
  "./assets/thumbnails/template-3d.svg",
  "./assets/thumbnails/template-2d.svg",
  "./assets/thumbnails/template-demo.svg",
  "../editor/editor.html",
  "../editor/css/editor.css",
  "../editor/css/viewport.css",
  "../editor/css/panels.css",
  "../editor/css/toolbar.css",
  "../editor/css/gizmos.css",
  "../editor/js/editor-main.js",
  "../editor/js/viewport.js",
  "../editor/js/camera-controls.js",
  "../editor/js/scene-manager.js",
  "../editor/js/scene-tree.js",
  "../editor/js/inspector.js",
  "../editor/js/gizmos.js",
  "../editor/js/input-handler.js",
  "../editor/js/project-loader.js",
  "../editor/js/renderer/webgl-renderer.js",
  "../editor/js/renderer/mesh.js",
  "../editor/js/renderer/material.js",
  "../editor/js/renderer/light.js",
  "../editor/js/renderer/camera.js",
  "../editor/shaders/basic.vert.glsl",
  "../editor/shaders/basic.frag.glsl"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
