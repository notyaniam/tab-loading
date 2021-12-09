// current cache name
const cacheName = "v1.0.2";

// declare assets to cache for offline running
const cacheAssets = [
  "./",
  "./css/style.css",
  "./js/main.js",
  "./js/container.js",
  "./images/mf_logo192.png",
];

// calling install event if the browser supports it
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      // opening custom cache
      .open(cacheName)
      // adding the cache assets array and returning
      .then((cache) => {
        return cache.addAll(cacheAssets);
      })
      .catch((err) => console.log(err))
  );
});

// deleting existing caches and activating current
self.addEventListener("activate", (e) => {
  e.waitUntil(
    // getting an array of all existing keys
    caches.keys().then((cacheNames) => {
      console.log(cacheNames);
      return Promise.all(
        cacheNames.map((cache) => {
          // looping through all cache and deleting unnecessary
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// fetching assets from the cache storage
self.addEventListener("fetch", (e) => {
  // if online fetch, if error get from local cache
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
