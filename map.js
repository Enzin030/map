    const activeClusterThemes = new Set();
    
    /* 創建圖層按鈕 */
    function createLayerButton(map, baseLayers, themeLayers, thumbnails, options = {}) {
        const {
            showLayerButton = true,
            showZoomControl = true,
            defaultBase = null,                 
            defaultThemes: _defaultThemes = [], 
            activeClusterThemes: injectedActiveSet = null
        } = options;

        const mainClusterGroup = options.clusterGroup;
        const activeClusterThemes =
            injectedActiveSet || (window._activeClusterThemes ||= new Set());

        if (showLayerButton) {
            const LayerButton = L.Control.extend({
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
                Object.keys(baseLayers).forEach(function (layerName) {
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
                Object.keys(themeLayers).forEach(function (layerName) {
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

                var baseNames = Object.keys(baseLayers);
                var initialBase = (defaultBase && baseLayers[defaultBase]) ? defaultBase : baseNames[0];
                if (initialBase) {
                Object.values(baseLayers).forEach(layer => { if (map.hasLayer(layer)) map.removeLayer(layer); });
                baseLayers[initialBase].addTo(map);
                var selectedBase = popup.querySelector(`.base-layer[data-layer="${initialBase}"]`);
                if (selectedBase) selectedBase.classList.add('selected');
                }

                const wantThemes = Array.isArray(_defaultThemes) ? _defaultThemes : [];
                wantThemes.forEach(name => {
                const lyr = themeLayers[name];
                if (!lyr) return;

                if (lyr instanceof L.TileLayer) {
                    if (!map.hasLayer(lyr)) lyr.addTo(map);
                    lyr.bringToFront();
                } else {
                    if (!activeClusterThemes.has(name)) {
                    if (typeof lyr.getLayers === 'function') {
                        if (mainClusterGroup) mainClusterGroup.addLayers(lyr.getLayers());
                        else map.addLayer(lyr);
                    } else {
                        if (mainClusterGroup) mainClusterGroup.addLayer(lyr);
                        else map.addLayer(lyr);
                    }
                    activeClusterThemes.add(name);
                    }
                }
                const item = popup.querySelector(`.theme-layer[data-layer="${name}"]`);
                if (item) item.classList.add('selected');
                });

                L.DomEvent.on(button, 'click', function (e) {
                L.DomEvent.stop(e);
                popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
                });

                popup.querySelectorAll('.base-layer').forEach(function (option) {
                L.DomEvent.on(option, 'click', function (e) {
                    L.DomEvent.stop(e);
                    const layerName = this.getAttribute('data-layer');
                    Object.values(baseLayers).forEach(function (layer) {
                    if (map.hasLayer(layer)) map.removeLayer(layer);
                    });
                    baseLayers[layerName].addTo(map);
                    popup.querySelectorAll('.base-layer').forEach(el => el.classList.remove('selected'));
                    this.classList.add('selected');
                });
                });

                popup.querySelectorAll('.theme-layer').forEach(function (option) {
                L.DomEvent.on(option, 'click', function (e) {
                    L.DomEvent.stop(e);
                    const layerName = this.getAttribute('data-layer');
                    const layer = themeLayers[layerName];

                    if (layer instanceof L.TileLayer) {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                        this.classList.remove('selected');
                    } else {
                        layer.addTo(map);
                        layer.bringToFront();
                        this.classList.add('selected');
                    }
                    } else {
                    if (activeClusterThemes.has(layerName)) {
                        if (typeof layer.getLayers === 'function') {
                        mainClusterGroup ? mainClusterGroup.removeLayers(layer.getLayers()) : map.removeLayer(layer);
                        } else {
                        mainClusterGroup ? mainClusterGroup.removeLayer(layer) : map.removeLayer(layer);
                        }
                        activeClusterThemes.delete(layerName);
                        this.classList.remove('selected');
                    } else {
                        if (typeof layer.getLayers === 'function') {
                        mainClusterGroup ? mainClusterGroup.addLayers(layer.getLayers()) : map.addLayer(layer);
                        } else {
                        mainClusterGroup ? mainClusterGroup.addLayer(layer) : map.addLayer(layer);
                        }
                        activeClusterThemes.add(layerName);
                        this.classList.add('selected');
                    }
                    }
                });
                });

                return container;
            }
            });
            const layerButton = new LayerButton({ position: 'topright' });
            layerButton.addTo(map);
        }

        if (showZoomControl) {
            L.control.zoom({ position: 'topright' }).addTo(map);
        }
    }

    /* 創建圖標叢集 */
    function createSharedClusterGroup() {
        return L.markerClusterGroup({
            iconCreateFunction: cluster => {
                const count = cluster.getChildCount();
                const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                const color = `rgba(2, 125, 180, ${a})`;
                const size = Math.min(40 + count * 2, 60);

                return L.divIcon({
                className: 'custom-cluster', 
                html: `<div style="
                    background:${color};
                    border-radius:50%;
                    width:${size}px;height:${size}px;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:14px;
                ">${count}</div>`,
                iconSize: [size, size], 
                iconAnchor: [size / 2, size / 2] 
                });
            }
        });
    }

    /* 創建圖標圖層 */
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
            
            if (underText) marker.bindTooltip(f.properties.name, { permanent: true, direction: "bottom", opacity: 0.9 });
            marker.bindPopup(`<b>${f.properties.name}</b>`);
            
            featureGroup.addLayer(marker);
        });
        
        return featureGroup;
    }

    /* 打包GeoJson */
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