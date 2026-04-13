
(function() {
  'use strict';

 
  function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

 
    if (typeof L === 'undefined') {
      console.warn('Leaflet library not loaded');
      return;
    }

    try {
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false
      });

 
      window.__leaflet = map;

 
      map.setView([55.7558, 37.6173], 11);

 
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '',
        crossOrigin: 'anonymous'
      }).addTo(map);

 
      map.whenReady(function() {
        const center = [55.7558, 37.6173];
        const point = map.latLngToLayerPoint(center);
        const pointUp = L.point(point.x, point.y - 5); 
        const shifted = map.layerPointToLatLng(pointUp);

        L.circleMarker(shifted, {
          radius: 5,
          color: '#4B68FF',
          fillColor: '#4B68FF',
          fillOpacity: 1,
          interactive: false,
          bubblingMouseEvents: false
        }).addTo(map);
      });
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  }

  
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMap);
    } else {
      initMap();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMap, init };
  }

  init();
})();

