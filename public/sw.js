// Minimal service worker — yuklenebilirlik (installability) + cevrimdisi onbellek.
// Network-first: cevrimiciyken guncel; cevrimdisiyken son onbellekten servis eder.
const CACHE = "numune-analiz-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || Promise.reject(new Error("offline")))),
  );
});
