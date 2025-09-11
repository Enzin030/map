    /* 創建底圖 */
    function createBaseLayer(url, maxNativeZoom = 20, maxZoom = 20, minZoom = 6) {
        return L.tileLayer(url, {
            maxNativeZoom,
            maxZoom,
            minZoom
        });
    }

    /* 創建圖層按鈕 */
    function createLayerButton(baseLayers, themeLayers) {
        return L.Control.extend({
            onAdd: function(map) {
                var container = L.DomUtil.create('div', 'layer-button-container');
                
                var button = L.DomUtil.create('button', 'layer-button', container);
                button.innerHTML = '<svg xmlns="https://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="#fff" d="m13.387 3.425l6.365 4.243a1 1 0 0 1 0 1.664l-6.365 4.244a2.5 2.5 0 0 1-2.774 0L4.248 9.332a1 1 0 0 1 0-1.664l6.365-4.243a2.5 2.5 0 0 1 2.774 0m6.639 8.767a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692m0 3.25a2 2 0 0 1-.577.598l-6.05 4.084a2.5 2.5 0 0 1-2.798 0l-6.05-4.084a2 2 0 0 1-.779-2.29l6.841 4.56a2.5 2.5 0 0 0 2.613.098l.16-.098l6.841-4.56a2 2 0 0 1-.201 1.692"/></svg>&nbsp;圖層';
                
                var popup = L.DomUtil.create('div', 'layer-popup', container);
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

                popup.querySelectorAll('.theme-layer').forEach(function(option) {
                    L.DomEvent.on(option, 'click', function(e) {
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
                        if (mainClusterGroup.hasLayer(layer)) {
                            mainClusterGroup.removeLayer(layer);
                            this.classList.remove('selected');
                        } else {
                            mainClusterGroup.addLayer(layer);
                            this.classList.add('selected');
                        }
                        }
                    });
                });
    

                return container;
            }
        });
    }

    /* 創建圖標叢集 */
    function makeSharedCluster() {
        return L.MarkerClusterGroup.extend({
            options: {
                iconCreateFunction: function(cluster) {
                    const count = cluster.getChildCount();
                    const a = [0.7, 0.8, 0.9][+(count > 10) + (count > 20)];
                    const color = `rgba(2, 125, 180, ${a})`;
                    const size = Math.min(40 + count * 2, 60);
                    const html = `<div style="background:${color};border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px">${count}</div>`;
                    return L.divIcon({
                        html: html,
                        className: 'marker-cluster'
                    });
                }
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