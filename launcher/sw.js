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
  "./assets/thumbnails/template-demo.svg"
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
