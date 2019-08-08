import { defaults as defaultControls, ScaleLine, MousePosition } from '../control.js';
import { defaults as defaultInteractions } from '../interaction.js';
import Map from '../Map';
import View from '../View';
import { transform } from '../proj.js';

import { initializeBackend } from './backend';
import { defaultAppConfig, defaultMapConfig } from './defaultConfig.js';
import { initializePredefinedProjections } from './projections';
import { createBasemapLayer, createOperationalLayer } from './layers';
import { createWidgets } from './widgets/index.js';
import { setMapProjection } from './map.js';
import { createDefaultSelectStyle, createDefaultHighlightStyle } from './styles/defaultStyle';

/**
 * Creates a new Map by specifying layers, controls and more options.
 * @param {import('./defaultConfig').MapConfig} mapConfig
 * @return {Map}
 */
export const createMap = (mapConfig, backendUrl) => {
  try {
    createDefaultSelectStyle();
    createDefaultHighlightStyle();

    initializePredefinedProjections();
    if (backendUrl) {
      initializeBackend(backendUrl);
    }

    const config = Object.assign({}, defaultMapConfig, mapConfig);

    const center = transform([config.longitude, config.latitude], 'EPSG:4326', config.projection);
    const view = new View({
      projection: config.projection,
      rotation: config.rotation,
      zoom: config.zoom,
      center
    });

    setMapProjection(view.getProjection());

    let layers = [];
    layers.push(...config.basemaps.map(options => createBasemapLayer(options)));
    layers.push(...config.layers.map(options => createOperationalLayer(options)));

    const interactions = defaultInteractions(config.interactions);
    const controls = defaultControls(config.controls);

    if (config.controls.scale) {
      controls.extend([new ScaleLine()]);
    }
    if (config.controls.mousePosition) {
      controls.extend([new MousePosition()]);
    }

    return new Map({
      view,
      layers,
      controls,
      interactions,
      target: config.target
    });
  } catch (e) {
    console.log(`Error while creating map. ${e.message}`);
    throw e;
  }
};

/**
 * Creates a new app.
 * @param {import('./defaultConfig').AppConfig} appConfig
 * @return {Object}
 */
export const createApp = appConfig => {
  try {
    const config = Object.assign({}, defaultAppConfig, appConfig);
    const map = createMap(config.map, config.backendUrl);
    createWidgets(
      config.widgets.map(w => {
        w.map = map;
        return w;
      })
    );
    return { map };
  } catch (e) {
    console.log(`Error while creating app. ${e.message}`);
    throw e;
  }
};
