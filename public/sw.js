/** MBKRU PWA service worker — shell precache, build-tied static assets, offline navigation. */

const SHELL_ROUTES = [
  "/",
  "/offline",
  "/about",
  "/contact",
  "/methodology",
  "/citizens-voice",
  "/faq",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const LEGACY_SHELL_CACHE = "mbkru-shell-v2";
const LEGACY_STATIC_CACHE = "mbkru-static-v2";

/** @type {{ buildId: string; urls: string[] } | null} */
let deployMeta = null;

async function loadDeployMeta() {
  if (deployMeta) return deployMeta;
  try {
    const res = await fetch("/sw-precache.json", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json.buildId === "string" && Array.isArray(json.urls)) {
      deployMeta = json;
      return deployMeta;
    }
  } catch {
    /* first visit or dev — fall back to shell routes only */
  }
  return null;
}

async function cacheNames() {
  const meta = await loadDeployMeta();
  if (meta?.buildId) {
    return {
      shell: `mbkru-shell-${meta.buildId}`,
      static: `mbkru-static-${meta.buildId}`,
    };
  }
  return { shell: LEGACY_SHELL_CACHE, static: LEGACY_STATIC_CACHE };
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.endsWith(".woff2")
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const names = await cacheNames();
      const meta = await loadDeployMeta();
      const cache = await caches.open(names.shell);
      const toPrecache = [...SHELL_ROUTES];
      if (meta?.urls?.length) {
        for (const url of meta.urls) toPrecache.push(url);
      }
      await cache.addAll(toPrecache);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await cacheNames();
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              k !== names.shell &&
              k !== names.static &&
              (k.startsWith("mbkru-shell-") ||
                k.startsWith("mbkru-static-") ||
                k === LEGACY_SHELL_CACHE ||
                k === LEGACY_STATIC_CACHE),
          )
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url)) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const names = await cacheNames();
        const cache = await caches.open(names.static);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })(),
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            cacheNames().then((n) => caches.open(n.shell).then((cache) => cache.put(event.request, copy)));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;
          const offline = await caches.match("/offline");
          if (offline) return offline;
          const home = await caches.match("/");
          return (
            home ??
            new Response("You are offline. Reconnect to use MBKRU.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r ?? new Response("", { status: 504 }))),
  );
});

export {};
