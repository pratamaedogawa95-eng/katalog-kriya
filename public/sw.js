// Service worker sederhana: beranda tersimpan untuk dibuka saat offline. Admin dan data tidak pernah di-cache.
const CACHE = "kalakarsa-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/admin") || req.mode !== "navigate") return;
  e.respondWith(
    fetch(req).then((res) => { if (url.pathname === "/") { const salin = res.clone(); caches.open(CACHE).then((c) => c.put("/", salin)); } return res; })
      .catch(() => caches.match("/").then((r) => r || new Response("Sedang offline. Coba lagi nanti.", { status: 503 })))
  );
});
