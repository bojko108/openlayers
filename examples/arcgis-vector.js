import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import ArcGISDynamicMapServiceLayer from '../src/ol/layer/ArcGISDynamicMapServiceLayer.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import { Fill, Stroke, Style, Text } from '../src/ol/style.js';

import { initializePredefinedProjections } from '../src/ol/app';

// this method initializes all predefined projections
initializePredefinedProjections();

const esriVectorLayer = new ArcGISDynamicMapServiceLayer({
  metadata: {
    name: 'GDO.P_EL_STAN',
    title: 'Подстанции',
    layerUrl: 'http://lgapp:6080/arcgis/rest/services/MIS/MapServer/0',
    objectIdField: 'OBJECTID'
  }
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    esriVectorLayer
  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:9802',
    center: [2614005.847876104, 5290903.878278374],
    zoom: 8
  })
});

const highlightStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#f00',
      width: 3
    })
  })
});

const featureOverlay = new VectorLayer({
  metadata: { name: 'overlay' },
  source: new VectorSource(),
  map: map,
  style: function(feature) {
    highlightStyle.getText().setText(feature.get('LABEL'));
    return highlightStyle;
  }
});

let highlight;
const displayFeatureInfo = function(pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.getId() + ': ' + feature.get('LABEL');
  } else {
    info.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});
