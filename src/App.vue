<template>
  <div ref="map" class="leaflet-map"></div>
</template>

<style>
.leaflet-map {
  height: 100vh;
}
</style>

<script>
import { map, canvas, geoJSON } from 'leaflet';
import api from '@/api/api';

export default {
  data() {
    return {
      map: null,
      mapLayer: null,
      selected: null,
      data: null,
    }
  },

  async mounted() {
    this.map = map(this.$refs.map, {
      renderer: canvas(),
    }).setView([51.505, -0.09], 3);

    const { data } = await api.get();
    this.data = data;
    this.updateMapLayer();
  },

  methods: {
    updateMapLayer() {
      const oldMapLayer = this.mapLayer;
      if (oldMapLayer) {
        oldMapLayer.remove();
      }
      this.mapLayer = geoJSON(this.data, {
        style: this.getStyle,
        onEachFeature: this.onEachFeature,
        markersInheritOptions: true,
        filter: this.filterFeatures,
      }).addTo(this.map);

    },

    getColor(d) {
      return d > 1000 ? '#800026' :
          d > 500  ? '#BD0026' :
              d > 200  ? '#E31A1C' :
                  d > 100  ? '#FC4E2A' :
                      d > 50   ? '#FD8D3C' :
                          d > 20   ? '#FEB24C' :
                              d > 10   ? '#FED976' :
                                  '#FFEDA0';
    },

    getStyle(feature) {
      return {
        fillColor: this.getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    },

    onEachFeature(feature, layer) {
      layer.on({
        mouseover: this.onLayerMouseOver,
        mouseout: this.onLayerMouseOut,
        click: this.onFeatureClick,
      });
    },

    filterFeatures(feature) {
      return this.selected
        ? feature.properties.FID.startsWith(this.selected.FID)  && this.selected.LEVL_CODE + 1 === feature.properties.LEVL_CODE
        : feature.properties.LEVL_CODE === 0;
    },

    highlightFeature(layer) {
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

      layer.bringToFront();
    },

    resetFeatureHighlight(layer) {
      this.mapLayer.resetStyle(layer);
    },

    zoomFeature(layer) {
      this.map.fitBounds(layer.getBounds());
    },

    onLayerMouseOver(e) {
      this.highlightFeature(e.target);
    },

    onLayerMouseOut(e) {
      this.resetFeatureHighlight(e.target);
    },

    onFeatureClick(e) {
      this.selectRegion(e.target.feature);
      this.zoomFeature(e.target);
      this.updateMapLayer();
    },

    selectRegion(feature) {
      console.log(feature.properties)
      this.selected = feature.properties;
    },
  }

};
</script>
