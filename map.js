    /* 創建底圖 */
    function createBaseLayer(url, maxNativeZoom = 20, maxZoom = 20, minZoom = 6) {
        return L.tileLayer(url, {
            maxNativeZoom,
            maxZoom,
            minZoom
        });
    }

    /* 創建圖層按鈕 */
    function createLayerButton(map, baseLayers, themeLayers, thumbnails, opts = {}) {
        const LayerButton = L.Control.extend({
            options: { position: opts.position || 'topright' },
            onAdd: function () {
            const container = L.DomUtil.create('div', 'layer-button-container');
            const button = L.DomUtil.create('button', 'layer-button', container);
            button.innerHTML = '...你的SVG...';

            const popup = L.DomUtil.create('div', 'layer-popup', container);
            popup.style.display = 'none';
                
            var popupContent = `
                <div class="popup-content">
                    <div class="popup-title">底圖</div>
                    <div class="layer-options-container">`;
            Object.keys(baseLayers).forEach(function(layerName) {
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
            Object.keys(themeLayers).forEach(function(layerName) {
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

            var firstBaseLayerName = Object.keys(baseLayers)[0];
            if (firstBaseLayerName) {
                baseLayers[firstBaseLayerName].addTo(map);

                var selectedBase = popup.querySelector(`.base-layer[data-layer="${firstBaseLayerName}"]`);
                if (selectedBase) {
                    selectedBase.classList.add('selected');
                }
            }

            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.stop(e);
                popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
            });

            popup.querySelectorAll('.base-layer').forEach(function(option) {
                L.DomEvent.on(option, 'click', function(e) {
                    L.DomEvent.stop(e);
                    const layerName = this.getAttribute('data-layer');
                    Object.values(baseLayers).forEach(function(layer) {
                        if (map.hasLayer(layer)) {
                            map.removeLayer(layer);
                        }
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
                    layer.addTo(map).bringToFront();
                    this.classList.add('selected');
                    }
                } else {
                    if (cluster.hasLayer(layer)) {
                    cluster.removeLayer(layer);
                    this.classList.remove('selected');
                    } else {
                    cluster.addLayer(layer);
                    this.classList.add('selected');
                    }
                }
                });
            });

            return container;
            }
        });
        return new LayerButton();
    }
    
    /* 創建圖標圖層 */
    function createMarkers(markerColor, geoJSON, underText, iconHTML) {
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