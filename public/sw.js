// Aleman service worker — offline support.
// Strategy:
//   - App shell + Next.js chunks: stale-while-revalidate
//   - Audio (signed Supabase URLs): cache-first, immutable
//   - API: network-first with cache fallback
//   - Navigations: network-first; offline falls back to /offline (or cached page)

const VERSION = "v1";
const SHELL_CACHE = `aleman-shell-${VERSION}`;
const PAGES_CACHE = `aleman-pages-${VERSION}`;
const AUDIO_CACHE = `aleman-audio-${VERSION}`;
const API_CACHE = `aleman-api-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/today",
  "/review",
  "/history",
  "/preferences",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.endsWith(VERSION))
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

function isAudio(url) {
  return /\.mp3(\?|$)/i.test(url) || url.includes("/storage/v1/object") && url.includes("lesson-audio");
}

function isNextStatic(url) {
  return url.includes("/_next/static/");
}

function isApi(url, sameOrigin) {
  return sameOrigin && new URL(url).pathname.startsWith("/api/");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = req.url;
  const sameOrigin = new URL(url).origin === self.location.origin;

  // Audio: cache-first, store opaquely.
  if (isAudio(url)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok || res.type === "opaque") {
            cache.put(req, res.clone());
          }
          return res;
        } catch {
          return hit ?? Response.error();
        }
      }),
    );
    return;
  }

  // Next.js static chunks: stale-while-revalidate.
  if (sameOrigin && isNextStatic(url)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit ?? fetchPromise;
      }),
    );
    return;
  }

  // API: network-first with cache fallback (for read-only GETs).
  if (isApi(url, sameOrigin)) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(req, res.clone());
          }
          return res;
        } catch {
          const cache = await caches.open(API_CACHE);
          const hit = await cache.match(req);
          if (hit) return hit;
          return new Response(JSON.stringify({ error: "offline" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }
      })(),
    );
    return;
  }

  // Navigations: network-first, fall back to cached page or /offline.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cache = await caches.open(PAGES_CACHE);
          const hit = await cache.match(req);
          if (hit) return hit;
          const shell = await caches.open(SHELL_CACHE);
          const fallback = await shell.match("/offline");
          return fallback ?? new Response("Offline", { status: 503 });
        }
      })(),
    );
    return;
  }

  // Default: try network, fall back to cache.
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r ?? Response.error())),
  );
});
