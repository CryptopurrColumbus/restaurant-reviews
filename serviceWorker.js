var CACHE_NAMES = ['restaurant-images', 'static-files'];
var urlsToCache = {
    'restaurant-images': [
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
    ],
    'static-files': [
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/data/restaurants.json',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'restaurant.html',
        'index.html',
    ]
}

/*
    Install the service worker, define what all needs to be cached
*/
self.addEventListener('install', function(event) {
    event.waitUntil(
      Promise.all(
        CACHE_NAMES.map(function(cacheName) {
            return caches.open(cacheName)
            .then(function(cache) {
                return cache.addAll(urlsToCache[cacheName]);
            })
        })
      ))
});

/*
    Intercept the request and serve from cache if found,
    else go through the request and cache the result
*/
fetchFromServer = (request) => {
  fetch(request).then(
    function(response) {
      if(!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      var responseClone = response.clone()
      setCacheAfterFetch(request, responseClone)
      return response;
    }
  )
}


setCacheAfterFetch = (request, response) => {
    var requestUrl = new URL(request.url);
    var requestPath = requestUrl.pathname;
    var _cacheName = '';
    if (requestPath.startsWith('/img')) {
        _cacheName = 'restaurant-images'
      } else if (requestPath.startsWith('/js') || requestPath.startsWith('/css') || requestPath.startsWith('/restaurant.html') || requestPath.startsWith('/')) {
          _cacheName = 'static-files'
    } 
    if (_cacheName) {
        caches.open(_cacheName)
        .then(function(cache) {
            cache.put(request, response);
        });
    }
}


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        return fetchFromServer(event.request)
      })
    );
});
