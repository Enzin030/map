const activeClusterThemes = new Set();
const enabledBaseLayers = new Set();
const enabledThemeLayers = new Set();

function getEnabledBaseLayerNames() {
    return Object.keys(baseLayers || {}).filter(name => enabledBaseLayers.has(name));
}

function getEnabledThemeLayerNames() {
    return Object.keys(themeLayers || {}).filter(name => enabledThemeLayers.has(name));
}

function getActiveBaseLayerName() {
    return Object.keys(baseLayers || {}).find(name => map?.hasLayer(baseLayers[name]));
}

function isThemeLayerActive(layerName) {
    const layer = themeLayers?.[layerName];
    if (!layer) return false;
    if (layer instanceof L.TileLayer) return map.hasLayer(layer);
    return activeClusterThemes.has(layerName);
}

        function createLayerButton(baseLayers, themeLayers) {
            return L.Control.extend({
                onAdd: function (map) {
                var container = L.DomUtil.create('div', 'layer-button-container');
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                var button = L.DomUtil.create('button', 'layer-button', container);
                button.innerHTML = '<svg xmlns="https://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="#fff" d="m13.387 3.425l6.365 4.243a1 1 0 0 1 0 1.664l-6.365 4.244a2.5 2.5 0 0 1-2.774 0L4.248 9.332a1 1 0 0 1 0-1.664l6.365-4.243a2.5 2.5 0 0 1 2.774 0m6.639 8.767a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692m0 3.25a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692"/></svg>&nbsp;圖層';

                var popup = L.DomUtil.create('div', 'layer-popup', container);
                popup.style.display = 'none';

                var popupContent = `
                    <div class="popup-content">
                    <div class="popup-title">底圖</div>
                    <div class="layer-options-container">`;
                getEnabledBaseLayerNames().forEach(function (layerName) {
                    var content = thumbnails[layerName];
                    let thumbHtml = '';
                    if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('data:image'))) {
                    thumbHtml = `<img src="${content}" alt="${layerName}" class="thumbnail-img">`;
                    } else {
                    thumbHtml = `<div class="thumbnail-svg">${content}</div>`;
                    }
                    popupContent += `
                    <div class="layer-option base-layer" data-layer="${layerName}">
                        <div class="thumbnail-container">${thumbHtml}</div>
                        <span>${layerName}</span>
                    </div>`;
                });
                popupContent += `
                    </div>
                    </div>`;

                popupContent += `
                    <div class="popup-content">
                    <div class="popup-title">主題圖</div>
                    <div class="layer-options-container">`;
                getEnabledThemeLayerNames().forEach(function (layerName) {
                    var content = thumbnails[layerName];
                    let thumbHtml = '';
                    if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('data:image'))) {
                    thumbHtml = `<img src="${content}" alt="${layerName}" class="thumbnail-img">`;
                    } else {
                    thumbHtml = `<div class="thumbnail-svg">${content}</div>`;
                    }
                    popupContent += `
                    <div class="layer-option theme-layer" data-layer="${layerName}">
                        <div class="thumbnail-container">${thumbHtml}</div>
                        <span>${layerName}</span>
                    </div>`;
                });
                popupContent += `
                    </div>
                    </div>`;

                popup.innerHTML = popupContent;

                var firstBaseLayerName = getEnabledBaseLayerNames()[0];
                if (firstBaseLayerName) {
                    baseLayers[firstBaseLayerName].addTo(map);
                    var selectedBase = popup.querySelector(`.base-layer[data-layer="${firstBaseLayerName}"]`);
                    if (selectedBase) selectedBase.classList.add('selected');
                }

                L.DomEvent.on(button, 'click', function (e) {
                    L.DomEvent.stop(e);
                    popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
                });

                popup.querySelectorAll('.base-layer').forEach(function (option) {
                    L.DomEvent.on(option, 'click', function (e) {
                    L.DomEvent.stop(e);
                    const layerName = this.getAttribute('data-layer');
                    setBaseLayer(layerName);
                    });
                });

                popup.querySelectorAll('.theme-layer').forEach(function (option) {
                    L.DomEvent.on(option, 'click', function (e) {
                    L.DomEvent.stop(e);
                    const layerName = this.getAttribute('data-layer');
                    toggleThemeLayer(layerName);
                    });
                });

                return container;
                }
            });
        }

        function updateLayerButtonContent(baseLayers, themeLayers) {
            const buttonContainer = layerControl.getContainer();
            const popup = buttonContainer.querySelector('.layer-popup');

            const activeBaseLayerName = getActiveBaseLayerName();
            const activeThemeLayerNames = getEnabledThemeLayerNames().filter(name => isThemeLayerActive(name));
            popup.innerHTML = '';

            let popupContent = `
                <div class="popup-content">
                <div class="popup-title">底圖</div>
                <div class="layer-options-container">`;

            getEnabledBaseLayerNames().forEach(function (layerName) {
                const content = thumbnails[layerName];
                let thumbHtml = '';
                if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('data:image'))) {
                thumbHtml = `<img src="${content}" alt="${layerName}" class="thumbnail-img">`;
                } else {
                thumbHtml = `<div class="thumbnail-svg">${content}</div>`;
                }
                const selectedClass = (layerName === activeBaseLayerName) ? 'selected' : '';
                popupContent += `
                <div class="layer-option base-layer ${selectedClass}" data-layer="${layerName}">
                    <div class="thumbnail-container">${thumbHtml}</div>
                    <span>${layerName}</span>
                </div>`;
            });

            popupContent += `
                </div>
                </div>`;

            popupContent += `
                <div class="popup-content">
                <div class="popup-title">主題圖</div>
                <div class="layer-options-container">`;

            getEnabledThemeLayerNames().forEach(function (layerName) {
                const content = thumbnails[layerName];
                let thumbHtml = '';
                if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('data:image'))) {
                thumbHtml = `<img src="${content}" alt="${layerName}" class="thumbnail-img">`;
                } else {
                thumbHtml = `<div class="thumbnail-svg">${content}</div>`;
                }
                const selectedClass = activeThemeLayerNames.includes(layerName) ? 'selected' : '';
                popupContent += `
                <div class="layer-option theme-layer ${selectedClass}" data-layer="${layerName}">
                    <div class="thumbnail-container">${thumbHtml}</div>
                    <span>${layerName}</span>
                </div>`;
            });

            popupContent += `
                </div>
                </div>`;

            popup.innerHTML = popupContent;

            popup.querySelectorAll('.base-layer').forEach(function (option) {
                L.DomEvent.on(option, 'click', function (e) {
                L.DomEvent.stop(e);
                const layerName = this.getAttribute('data-layer');
                setBaseLayer(layerName);
                });
            });

            popup.querySelectorAll('.theme-layer').forEach(function (option) {
                L.DomEvent.on(option, 'click', function (e) {
                L.DomEvent.stop(e);
                const layerName = this.getAttribute('data-layer');
                toggleThemeLayer(layerName);
                });
            });
        }

        function getActiveThemeLayerNames() {
            return Object.keys(themeLayers).filter(name => isThemeLayerActive(name));
        }

        function ensureActiveBaseLayer() {
            const activeBase = getActiveBaseLayerName();
            if (activeBase && enabledBaseLayers.has(activeBase)) return;
            const nextBase = getEnabledBaseLayerNames()[0];
            if (nextBase) {
                setBaseLayer(nextBase, { silent: true });
            }
        }

        function syncLayerUI() {
            ensureActiveBaseLayer();
            if (typeof layerControl !== "undefined") {
                updateLayerButtonContent(baseLayers, themeLayers);
            }
            renderPresetLists();
        }

        function setBaseLayer(layerName, options = {}) {
            const layer = baseLayers[layerName];
            if (!layer) return;

            Object.values(baseLayers).forEach(l => {
                if (map.hasLayer(l)) map.removeLayer(l);
            });
            layer.addTo(map);
            if (!options.silent) {
                syncLayerUI();
            }
        }

        function toggleThemeLayer(layerName) {
            setThemeLayerActive(layerName, !isThemeLayerActive(layerName));
        }

        function setThemeLayerActive(layerName, shouldEnable) {
            const layer = themeLayers[layerName];
            if (!layer) return;

            if (layer instanceof L.TileLayer) {
                if (shouldEnable) {
                    if (!map.hasLayer(layer)) layer.addTo(map);
                    layer.bringToFront();
                } else if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            } else if (mainClusterGroup) {
                if (shouldEnable) {
                    if (typeof layer.getLayers === 'function') {
                        mainClusterGroup.addLayers(layer.getLayers());
                    } else {
                        mainClusterGroup.addLayer(layer);
                    }
                    activeClusterThemes.add(layerName);
                } else {
                    if (typeof layer.getLayers === 'function') {
                        mainClusterGroup.removeLayers(layer.getLayers());
                    } else {
                        mainClusterGroup.removeLayer(layer);
                    }
                    activeClusterThemes.delete(layerName);
                }
            } else {
                if (shouldEnable) {
                    if (typeof layer.addTo === 'function') layer.addTo(map);
                } else if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            }

            syncLayerUI();
        }

        function renderPresetLists() {
            const baseList = document.getElementById("presetBaseList");
            if (baseList) {
                const activeBase = getActiveBaseLayerName();
                baseList.innerHTML = Object.keys(baseLayers).map((name) => {
                    const checked = enabledBaseLayers.has(name) ? 'checked' : '';
                    const activeClass = name === activeBase ? 'is-active' : '';
                    return `
                        <label class="preset-option ${activeClass}">
                            <input type="checkbox" name="preset-base" value="${name}" ${checked} />
                            <span>${name}</span>
                        </label>`;
                }).join('');

                baseList.querySelectorAll('input[name="preset-base"]').forEach(input => {
                    input.addEventListener('change', (event) => {
                        const name = event.target.value;
                        if (!event.target.checked && enabledBaseLayers.size === 1) {
                            event.target.checked = true;
                            return;
                        }
                        if (event.target.checked) {
                            enabledBaseLayers.add(name);
                        } else {
                            enabledBaseLayers.delete(name);
                            if (getActiveBaseLayerName() === name) {
                                const nextBase = getEnabledBaseLayerNames()[0];
                                if (nextBase) {
                                    setBaseLayer(nextBase, { silent: true });
                                }
                            }
                        }
                        syncLayerUI();
                    });
                });
            }

            const themeList = document.getElementById("presetThemeList");
            if (themeList) {
                themeList.innerHTML = Object.keys(themeLayers).map((name) => {
                    const checked = enabledThemeLayers.has(name) ? 'checked' : '';
                    const activeClass = isThemeLayerActive(name) ? 'is-active' : '';
                    return `
                        <label class="preset-option ${activeClass}">
                            <input type="checkbox" name="preset-theme" value="${name}" ${checked} />
                            <span>${name}</span>
                        </label>`;
                }).join('');

                themeList.querySelectorAll('input[name="preset-theme"]').forEach(input => {
                    input.addEventListener('change', (event) => {
                        const name = event.target.value;
                        if (event.target.checked) {
                            enabledThemeLayers.add(name);
                            syncLayerUI();
                        } else {
                            enabledThemeLayers.delete(name);
                            setThemeLayerActive(name, false);
                        }
                    });
                });
            }
        }

        function addBaseLayer() {
            const name = document.getElementById("layerName").value.trim();
            const img = document.getElementById("thumbnailUrl").value.trim();
            const url = document.getElementById("tileUrl").value.trim();

            if (baseLayers[name]) {
                alert("已存在相同名稱的底圖");
                return;
            }

            baseLayers[name] = L.tileLayer(url);
            thumbnails[name] = img;
            enabledBaseLayers.add(name);

            syncLayerUI();

            document.getElementById("layerName").value = "";
            document.getElementById("thumbnailUrl").value = "";
            document.getElementById("tileUrl").value = "";
        }

        function addThemeLayer() {
            const name = document.getElementById("themeLayerName").value.trim();
            const img = document.getElementById("themeThumbnailUrl").value.trim();
            const type = document.getElementById("themeLayerType")?.value || "tile";

            if (themeLayers[name]) {
                alert("已存在相同名稱的主題圖層");
                return;
            }

            if (type === "tile") {
                const url = document.getElementById("themeTileUrl").value.trim();
                themeLayers[name] = L.tileLayer(url);
                thumbnails[name] = img;
                enabledThemeLayers.add(name);
                syncLayerUI();

            } else if (type === "marker") {
                const fileInput = document.getElementById("markerJsonFile");
                const file = fileInput.files[0];
                const underTextValue = document.querySelector('input[name="underText"]:checked').value;
                const showUnderText = underTextValue === "true";

                if (!file) {
                    alert("請上傳 JSON 檔案");
                    return;
                }

                const reader = new FileReader();

                reader.onload = function (e) {
                    try {
                    let raw = e.target.result;
                    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
                    raw = raw.trim();

                    const data = JSON.parse(raw);

                    const bad = [];
                    for (const [k, arr] of Object.entries(data)) {
                        const ok = Array.isArray(arr) && arr.length === 2 && arr.every(n => typeof n === 'number' && Number.isFinite(n));
                        if (!ok) { bad.push(k); continue; }
                        const [a, b] = arr;
                        if (Math.abs(a) <= 90 && Math.abs(b) <= 180) data[k] = [b, a];
                    }
                    if (bad.length) {
                        throw new Error(`以下鍵的座標不是 [lng, lat] 數字陣列：${bad.slice(0,8).join('、')}${bad.length>8?'…':''}`);
                    }

                    const geoJson = coordsToGeoJSON(data);
                    themeLayers[name] = createMarkers(geoJson, showUnderText, img);

                    markerLayerConfigs[name] = {
                        type: "marker",
                        color: "",
                        geoJson: data,
                        showUnderText
                    };
                    thumbnails[name] = img;
                    enabledThemeLayers.add(name);

                    syncLayerUI();
                    } catch (err) {
                    alert(`讀檔或資料格式有問題：${err.message}`);
                    console.error(err);
                    }
                };

                reader.onerror = () => {
                    alert("檔案讀取失敗");
                };

                reader.readAsText(file, 'utf-8');
            } else if (type === "random") {
                const count = parseInt(document.getElementById("randomCount").value.trim());
                const centerLat = parseFloat(document.getElementById("centerLat1").value.trim());
                const centerLng = parseFloat(document.getElementById("centerLng1").value.trim());
                const radiusKm = parseFloat(document.getElementById("randomRadius").value.trim());

                if (isNaN(count) || count <= 0 || isNaN(centerLat) || isNaN(centerLng) || isNaN(radiusKm) || radiusKm <= 0) {
                    alert("請輸入有效的數值（點位數量、中心點與半徑）");
                    return;
                }

                const randomPoints = {};
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * 2 * Math.PI;
                    const distanceKm = Math.random() * radiusKm;

                    const R = 6371;
                    const deltaLat = (distanceKm / R) * Math.cos(angle);
                    const deltaLng = (distanceKm / (R * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);

                    const lat = centerLat + deltaLat * (180 / Math.PI);
                    const lng = centerLng + deltaLng * (180 / Math.PI);

                    randomPoints[`${name} ${i + 1}`] = [lng, lat];
                }

                const geoJson = coordsToGeoJSON(randomPoints);
                themeLayers[name] = createMarkers(geoJson, false, img);

                markerLayerConfigs[name] = {
                    type: "random",
                    geoJson: randomPoints,
                    count,
                    center: { lat: centerLat, lng: centerLng },
                    radiusKm
                };
                thumbnails[name] = img;
                enabledThemeLayers.add(name);
                syncLayerUI();
            }

            console.log(themeLayers);
            document.getElementById("themeLayerName").value = "";
            document.getElementById("themeTileUrl").value = "";
            document.getElementById("themeThumbnailUrl").value = "";
            document.getElementById("markerJsonFile").value = "";
            document.getElementById("markerColor").value = "";
            document.getElementById("randomCount").value = "";
            document.getElementById("randomMarkerColor").value = "";
        }


        function createMarkers(geoJSON, underText, iconHTML) {
            const icon = L.divIcon({
                className: 'custom-icon',
                html: iconHTML,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            const featureGroup = L.featureGroup();

            geoJSON.features.forEach(f => {
                const [lng, lat] = f.geometry.coordinates;
                const marker = L.marker([lat, lng], { icon });
                if (underText) {
                marker.bindTooltip(f.properties.name, { permanent: true, direction: "bottom", opacity: 0.9 });
                }
                marker.bindPopup(`<b>${f.properties.name}</b>`);
                featureGroup.addLayer(marker);
            });

            return featureGroup;
        }


        function coordsToGeoJSON(coordsObj) {
            return {
                type: "FeatureCollection",
                features: Object.entries(coordsObj).map(([name, coordinates]) => ({
                type: "Feature",
                properties: { name },
                geometry: {
                    type: "Point",
                    coordinates
                }
                }))
            };
        }

        function updateMapView() {
            const lat = parseFloat(centerLatInput.value);
            const lng = parseFloat(centerLngInput.value);
            const zoom = parseFloat(zoomLevelInput.value);

            if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
                map.setView([lat, lng], zoom);
            }
        }
        

        const centerLatInput = document.getElementById("centerLat");
        const centerLngInput = document.getElementById("centerLng");
        const zoomLevelInput = document.getElementById("zoomLevel");

        const centerLat = parseFloat(centerLatInput.value);
        const centerLng = parseFloat(centerLngInput.value);
        const zoomLevel = parseFloat(zoomLevelInput.value);

        const markerLayerConfigs = {};

        const map = L.map("map", {
            center: [centerLat, centerLng],
            zoom: zoomLevel,
            zoomControl: false,
            maxZoom: 18
        });

        const mainClusterGroup = L.markerClusterGroup({
            iconCreateFunction: cluster => {
                const count = cluster.getChildCount();
                const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                const color = 'rgba(2, 125, 180, ' + a + ')';
                const size = Math.min(40 + count * 2, 60);
                return L.divIcon({
                    className: 'custom-cluster',
                    html: '<div style="background:' + color + ';border-radius:50%;width:' + size + 'px;height:' + size + 'px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">' + count + '</div>',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2]
                });
            }
        });

        map.addLayer(mainClusterGroup);
        
        const baseLayers = {
            '天眼地圖': L.tileLayer('https://map.skyeyes.tw/easymap6/{z}/{x}/z{z}x{x}y{y}.png'),
            '通用地圖': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}'),
            '衛星地圖': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}')
        };
        
        const themeLayers = {
            '縣市界': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/CITY/default/GoogleMapsCompatible/{z}/{y}/{x}'),
            '鄉鎮市區界': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/TOWN/default/GoogleMapsCompatible/{z}/{y}/{x}'),
            '村里界': L.tileLayer('https://wmts.nlsc.gov.tw/wmts/Village/default/GoogleMapsCompatible/{z}/{y}/{x}'),
        };

        Object.keys(baseLayers).forEach(name => enabledBaseLayers.add(name));
        Object.keys(themeLayers).forEach(name => enabledThemeLayers.add(name));
        
        const thumbnails = window.layerThumbnails || {};

        var layerButton = createLayerButton(baseLayers, themeLayers);
        var layerControl = new layerButton({ position: 'topright' });
        layerControl.addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);
        renderPresetLists();

        centerLatInput.addEventListener("input", updateMapView);
        centerLngInput.addEventListener("input", updateMapView);
        zoomLevelInput.addEventListener("input", updateMapView);

const tabs = document.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".tab-content");
    
        tabs.forEach(btn => {
            btn.addEventListener("click", () => {
                tabs.forEach(tab => tab.setAttribute("data-active", "false"));
                contents.forEach(content => content.classList.add("hidden"));
        
                btn.setAttribute("data-active", "true");
                const target = btn.getAttribute("data-tab");
                document.getElementById(`tab-${target}`).classList.remove("hidden");
            });
        });


        document.getElementById("themeLayerType").addEventListener("change", function () {
            const type = this.value;
            document.getElementById("tileFields").classList.toggle("hidden", type !== "tile");
            document.getElementById("markerFields").classList.toggle("hidden", type !== "marker");
            document.getElementById("randomFields").classList.toggle("hidden", type !== "random");
        });

        document.addEventListener("DOMContentLoaded", () => {
            if (typeof map !== "undefined") {
                const center = map.getCenter();
                document.getElementById("centerLng1").value = center.lng.toFixed(6);
                document.getElementById("centerLat1").value = center.lat.toFixed(6);
            }
        });

        function generateLayerScript(base, theme, thumbs, markerConfig = {}) {
            let geoJsonVars = '';
            
            const keyToVarName = (key) => {
                const ascii = key.replace(/[^\w]/g, '_');
                const hex = [...key].map(c => c.charCodeAt(0).toString(16)).join('');
                return `geo_${ascii || 'x'}_${hex}`;
            };

            const createLayer = (data, isThumbnail = false) => {
                return Object.entries(data)
                    .map(([key, value]) => {
                        if (isThumbnail) {
                            return `'${key}': '${value}'`;
                        }

                        if (value instanceof L.TileLayer) {
                            return `'${key}': L.tileLayer('${value._url}')`;
                        }

                        if (markerConfig[key]) {
                            const { geoJson, showUnderText } = markerConfig[key];
                            const varName = keyToVarName(key);
                            const serialized = JSON.stringify(geoJson);
                            geoJsonVars += `const ${varName} = ${serialized};\n`;

                            return `'${key}': createMarkers(coordsToGeoJSON(${varName}), ${showUnderText}, thumbnails['${key}'])`;
                        }

                        return '';
                    })
                    .filter(Boolean)
                    .join(',\n\t\t');
            };

            const themeLayerCode = createLayer(theme);

            return `
        ${geoJsonVars}
        const baseLayers = {
        ${createLayer(base)}
        };

        const thumbnails = {
        ${createLayer(thumbs, true)}
        };

        const themeLayers = {
        ${createLayer(theme)}
        };
            `;
        }

        document.getElementById('downloadConfigBtn').addEventListener('click', () => {
        const layerScript = generateLayerScript(baseLayers, themeLayers, thumbnails, markerLayerConfigs).replace(/`/g, '');
        const configStr = `
javascript:
(function(){
    var links=['https://unpkg.com/leaflet/dist/leaflet.css','https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.css','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css','https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css','https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css','https://enzin030.github.io/map/map.css'];
    links.forEach(function(href){var link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);});
    var scripts=['https://unpkg.com/leaflet/dist/leaflet.js','https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.js','https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js','https://enzin030.github.io/map/map.js'];
    function loadScriptsSequentially(urls,cb){if(!urls.length){cb();return;}var s=document.createElement('script');s.src=urls[0];s.onload=function(){loadScriptsSequentially(urls.slice(1),cb);};document.body.appendChild(s);}
    loadScriptsSequentially(scripts,function(){initMap();});
    function initMap(){
        var centerLat=${centerLat};
        var centerLng=${centerLng};
        var zoomLevel=${zoomLevel};
        ${layerScript}
        var mapContainer=document.createElement('div');mapContainer.id='map';mapContainer.style.width='100%';mapContainer.style.height='100%';document.body.appendChild(mapContainer);
        var map=L.map('map',{zoomControl:false,preferCanvas:true,maxZoom:18}).setView([centerLat,centerLng],zoomLevel);

        const mainClusterGroup = L.markerClusterGroup({
            iconCreateFunction: cluster => {
                const count = cluster.getChildCount();
                const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                const color = 'rgba(2, 125, 180, ' + a + ')';
                const size = Math.min(40 + count * 2, 60);
                return L.divIcon({
                    className: 'custom-cluster',
                    html: '<div style="background:' + color + ';border-radius:50%;width:' + size + 'px;height:' + size + 'px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">' + count + '</div>',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2]
                });
            }
        });

        map.addLayer(mainClusterGroup);
        createLayerButton(map, baseLayers, themeLayers, thumbnails, { clusterGroup: mainClusterGroup });
    }
})();`;
        const blob = new Blob([configStr], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        a.click();
        URL.revokeObjectURL(url);
        alert('設定已成功生成並下載為 config.js！');
        });

        document.getElementById('copyConfigBtn').addEventListener('click', () => {
        const layerScript = generateLayerScript(baseLayers, themeLayers, thumbnails, markerLayerConfigs).replace(/`/g, '');
        const configStr = `
javascript:
(function(){
    var links=['https://unpkg.com/leaflet/dist/leaflet.css','https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.css','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css','https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css','https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css','https://enzin030.github.io/map/map.css'];
    links.forEach(function(href){var link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);});
    var scripts=['https://unpkg.com/leaflet/dist/leaflet.js','https://unpkg.com/leaflet.awesome-markers/dist/leaflet.awesome-markers.js','https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js','https://enzin030.github.io/map/map.js'];
    function loadScriptsSequentially(urls,cb){if(!urls.length){cb();return;}var s=document.createElement('script');s.src=urls[0];s.onload=function(){loadScriptsSequentially(urls.slice(1),cb);};document.body.appendChild(s);}
    loadScriptsSequentially(scripts,function(){initMap();});
    function initMap(){
        var centerLat=${centerLat};
        var centerLng=${centerLng};
        var zoomLevel=${zoomLevel};
        ${layerScript}
        var mapContainer=document.createElement('div');mapContainer.id='map';mapContainer.style.width='100%';mapContainer.style.height='100%';document.body.appendChild(mapContainer);
        var map=L.map('map',{zoomControl:false,preferCanvas:true,maxZoom:18}).setView([centerLat,centerLng],zoomLevel);

        const mainClusterGroup = L.markerClusterGroup({
            iconCreateFunction: cluster => {
                const count = cluster.getChildCount();
                const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                const color = 'rgba(2, 125, 180, ' + a + ')';
                const size = Math.min(40 + count * 2, 60);
                return L.divIcon({
                    className: 'custom-cluster',
                    html: '<div style="background:' + color + ';border-radius:50%;width:' + size + 'px;height:' + size + 'px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">' + count + '</div>',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2]
                });
            }
        });

        map.addLayer(mainClusterGroup);
        createLayerButton(map, baseLayers, themeLayers, thumbnails, { clusterGroup: mainClusterGroup });
    }
})();`;
        navigator.clipboard.writeText(configStr).then(function(){alert('初始化地圖程式碼已複製到剪貼簿！');}).catch(function(err){alert('複製失敗：'+err);});
        });
