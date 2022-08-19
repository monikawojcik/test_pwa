var CACHE_NAME = 'my-site-cache-v4';
var urlsToCache = [
  //'./resources/',
  'resources/sap-ui-core.js',
  './index.html',
  'manifest.json',
  'Component.js',
  'resources/sap/ui/core/library-preload.js',
  'resources/sap/ui/core/themes/sap_belize_plus/library.css',
  'resources/sap/ui/core/themes/base/fonts/SAP-icons.woff2',
  'resources/sap/m/library-preload.js',
  'resources/sap/m/themes/sap_belize_plus/library.css'
];
var resourcesToCache = [];

self.addEventListener('install', function(event) {

    // const cdnBase = 'https://openui5.hana.ondemand.com/resources/';
	// urlsToCache = urlsToCache.concat([
	// 	`${cdnBase}sap-ui-core.js`,
	// 	`${cdnBase}sap/ui/core/library-preload.js`,
	// 	`${cdnBase}sap/ui/core/themes/sap_belize_plus/library.css`,
	// 	`${cdnBase}sap/ui/core/themes/base/fonts/SAP-icons.woff2`,
	// 	`${cdnBase}sap/m/library-preload.js`,
	// 	`${cdnBase}sap/m/themes/sap_belize_plus/library.css`
	// ]);

    console.log(urlsToCache);
    console.log(resourcesToCache);

  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Delete obsolete caches during activate
self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== CACHE_NAME) {
					return caches.delete(key);
				}
			}));
		})
	);
});

  // During runtime, get files from cache or -> fetch, then save to cache
self.addEventListener('fetch', function (event) {
    
	// only process GET requests
	if (event.request.method === 'GET') {
		event.respondWith(
			caches.match(event.request).then(function (response) {
				if (response) {
					return response; // There is a cached version of the resource already
				}
	
				let requestCopy = event.request.clone();
				return fetch(requestCopy).then(function (response) {
					// opaque responses cannot be examined, they will just error
					if (response.type === 'opaque') {
						// don't cache opaque response, you cannot validate it's status/success
						return response;
					// response.ok => response.status == 2xx ? true : false;
					} else if (!response.ok) {
						console.error(response.statusText);
					} else {
						return caches.open(CACHE_NAME).then(function(cache) {
							cache.put(event.request, response.clone());
							return response;
						// if the response fails to cache, catch the error
						}).catch(function(error) {
							console.error(error);
							return error;
						});
					}
				}).catch(function(error) {
					// fetch will fail if server cannot be reached,
					// this means that either the client or server is offline
					console.error(error);
					return caches.match('offline-404.html');
				});
			})
		);
	}
    
});