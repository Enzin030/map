    /* 創建底圖 */
    function createBaseLayer(url, maxNativeZoom = 20, maxZoom = 20, minZoom = 6) {
        return L.tileLayer(url, {
        maxNativeZoom,
        maxZoom,
        minZoom
        });
    }

    /* 創建圖層按鈕 */
    function createLayerButton(map, baseLayers, themeLayers, thumbnails, options = {}) {
        const {
            showLayerButton = true,
            showZoomControl = true
        } = options;

        if (showLayerButton) {
            const LayerButton = L.Control.extend({
                onAdd: function(map) {
                    const container = L.DomUtil.create('div', 'layer-button-container');

                    const button = L.DomUtil.create('button', 'layer-button', container);
                    button.innerHTML = `
                        <svg xmlns="https://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                        <path fill="#fff" d="m13.387 3.425l6.365 4.243a1 1 0 0 1 0 1.664l-6.365 4.244a2.5 2.5 0 0 1-2.774 0L4.248 9.332a1 1 0 0 1 0-1.664l6.365-4.243a2.5 2.5 0 0 1 2.774 0m6.639 8.767a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692m0 3.25a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692"/>
                        </svg>&nbsp;圖層
                    `;
                    const popup = L.DomUtil.create('div', 'layer-popup', container);
                    popup.style.display = 'none';

                    function buildLayerSection(title, layers, isSvg) {
                        let html = `<div class="popup-content"><div class="popup-title">${title}</div><div class="layer-options-container">`;
                        Object.keys(layers).forEach(layerName => {
                            html += `
                            <div class="layer-option ${isSvg ? 'theme-layer' : 'base-layer'}" data-layer="${layerName}">
                                <div class="thumbnail-container">
                                    ${isSvg ? thumbnails[layerName] : `<img src="${thumbnails[layerName]}" alt="${layerName}">`}
                                </div>
                                <span>${layerName}</span>
                            </div>`;
                        });
                        html += `</div></div>`;
                        return html;
                    }

                    popup.innerHTML = buildLayerSection('底圖', baseLayers, false) + buildLayerSection('主題圖', themeLayers, true);

                    const firstBaseLayerName = Object.keys(baseLayers)[0];
                    if (firstBaseLayerName) {
                        baseLayers[firstBaseLayerName].addTo(map);
                        const selectedBase = popup.querySelector(`.base-layer[data-layer="${firstBaseLayerName}"]`);
                        if (selectedBase) selectedBase.classList.add('selected');
                    }

                    L.DomEvent.on(button, 'click', e => {
                        L.DomEvent.stop(e);
                        popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
                    });

                    popup.addEventListener('click', e => {
                        const target = e.target.closest('.layer-option');
                        if (!target) return;

                        L.DomEvent.stop(e);
                        const layerName = target.getAttribute('data-layer');

                        if (target.classList.contains('base-layer')) {
                            Object.values(baseLayers).forEach(layer => {
                                if (map.hasLayer(layer)) map.removeLayer(layer);
                            });
                            baseLayers[layerName].addTo(map);
                            popup.querySelectorAll('.base-layer').forEach(el => el.classList.remove('selected'));
                            target.classList.add('selected');
                        } else if (target.classList.contains('theme-layer')) {
                            const layer = themeLayers[layerName];
                            if (map.hasLayer(layer)) {
                                map.removeLayer(layer);
                                target.classList.remove('selected');
                            } else {
                                layer.addTo(map);
                                if (layer instanceof L.TileLayer) layer.bringToFront();
                                target.classList.add('selected');
                            }
                        }
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

    /* 創建圖標圖層 */
    function createMarkers(markerColor, geoJSON, underText, iconHTML) {
        const icon = L.divIcon({
            className: 'custom-icon',
            html: iconHTML,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const clusterGroup = L.markerClusterGroup({
            iconCreateFunction: cluster => {
                const count = cluster.getChildCount();
                const rgbMatch = markerColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                const [r, g, b] = rgbMatch ? rgbMatch.slice(1, 4) : [0, 0, 0];
                const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                const color = `rgba(${r}, ${g}, ${b}, ${a})`;
                const size = Math.min(40 + count * 2, 60);

                return L.divIcon({
                    html: `<div style="background:${color};border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px">${count}</div>`,
                    className: 'marker-cluster'
                });
            }
        });

        geoJSON.features.forEach(f => {
            const [lng, lat] = f.geometry.coordinates;
            const marker = L.marker([lat, lng], { icon });

            if (underText) marker.bindTooltip(f.properties.name, { permanent: true, direction: "bottom", opacity: 0.9 });
            marker.bindPopup(`<b>${f.properties.name}</b>`);
            clusterGroup.addLayer(marker);
        });

        return clusterGroup;
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