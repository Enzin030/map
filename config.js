javascript:

/* 初始化樣式 */
[
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css',
  'https://enzin030.github.io/map/map.css'
].forEach(href => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

const scripts = [
  'https://unpkg.com/leaflet/dist/leaflet.js',
  'https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
  'https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js',
  'https://enzin030.github.io/map/map.js'
];

function loadScriptsSequentially(urls, callback) {
  if (!urls.length) return callback();

  const script = document.createElement('script');
  script.src = urls[0];
  script.onload = () => loadScriptsSequentially(urls.slice(1), callback);
  document.body.appendChild(script);
}

loadScriptsSequentially(scripts, () => {
  initMap();
});

/* 初始化地圖 */
function initMap() {
  const centerLat = 24.189008;
  const centerLng = 120.652895;
  const zoomLevel = 15;

  const baseLayers = {
    '通用地圖': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}'),
    '衛星地圖': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}')
  };

  const thumbnails = {
    '通用地圖': 'https://enzin030.github.io/map/img/easymap.jpg',
    '衛星地圖': 'https://enzin030.github.io/map/img/satellite.jpg',
    '縣市界': '<svg xmlns="https://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 512 512"><path fill="#207ca8" d="M320 291.24V80a64 64 0 1 0-128 0v211.24A113.39 113.39 0 0 0 144 384a112 112 0 0 0 224 0a113.39 113.39 0 0 0-48-92.76M256 432a48 48 0 0 1-16-93.26V96h32v242.74A48 48 0 0 1 256 432"/></svg>'
  };

  const themeLayers = {
    '縣市界': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/CITY/default/GoogleMapsCompatible/{z}/{y}/{x}')
  };

  const mapContainer = document.createElement('div');
  mapContainer.id = 'map';
  mapContainer.style.width = '100%';
  mapContainer.style.height = '100%';
  document.body.appendChild(mapContainer);

  const map = L.map('map', {
    zoomControl: false,
    preferCanvas: true
  }).setView([centerLat, centerLng], zoomLevel);

  createLayerButton(map, baseLayers, themeLayers, thumbnails, {
    showLayerButton: true,
    showZoomControl: true
  });
}
