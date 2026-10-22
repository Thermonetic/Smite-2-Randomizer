// Cache version generated from app assets and service worker code.
const BUILD_VERSION = "76d4d43498814553";
const APP_ROOT = new URL("./", self.location.href);
const CACHE_PREFIX = `smite2-randomizer:${APP_ROOT.pathname}:`;
const CACHE_NAME = CACHE_PREFIX + BUILD_VERSION;

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const response = await fetch(new URL("offline-assets.json", APP_ROOT), {
            cache: "no-store"
        });
        if (!response.ok) throw new Error("Could not load offline asset list");
        const manifest = await response.json();
        if (manifest.version !== BUILD_VERSION) {
            throw new Error("Offline files and service worker versions differ");
        }
        const cache = await caches.open(CACHE_NAME);
        // Installation succeeds only when every listed file is available.
        await cache.addAll(manifest.assets.map((path) => new Request(
            new URL(path, APP_ROOT), { cache: "reload" }
        )));
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET" || url.origin !== APP_ROOT.origin ||
        !url.pathname.startsWith(APP_ROOT.pathname)) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Both the installed app's ./ URL and index.html use the same shell.
        if (event.request.mode === "navigate" &&
            (url.pathname === APP_ROOT.pathname ||
                url.pathname === new URL("index.html", APP_ROOT).pathname)) {
            const shell = await cache.match(new URL("index.html", APP_ROOT));
            if (shell) return shell;
        }
        const cached = await cache.match(event.request);
        return cached || fetch(event.request);
    })());
});
