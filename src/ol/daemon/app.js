import { defaults as defaultControls, ScaleLine, MousePosition } from '../control.js';
import { defaults as defaultInteractions } from '../interaction.js';
import Map from '../Map';
import View from '../View';
import { transform } from '../proj.js';

import { initializeBackend } from './backend';
import { defaultMapConfig } from './defaultConfig.js';
import { initializePredefinedProjections } from './projections';
import { createBasemapLayer, createOperationalLayer } from './layers';

/**
 * @type {Map}
 */
let map = undefined;

/**
 * @type {import('../proj/Projection').default}
 */
let mapProjection = undefined;

export const getMapProjection = () => {
  return mapProjection;
};

/**
 * @param {Map} createdMap
 */
export const setMap = createdMap => {
  map = createdMap;
  mapProjection = map.getProjection();

  if (window && process.env.NODE_ENV !== 'production') {
    console.log('map created');
    // @ts-ignore
    window.mapp = map;
  }
};

/**
 * @return {Map}
 */
export const getMap = () => {
  return map;
};

/**
 * Creates a new Map by specifying layers, controls and more options.
 * @param {import('./defaultConfig').MapConfig} mapConfig
 * @return {Map}
 */
export const createMap = (mapConfig, backendUrl) => {
  try {
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

    mapProjection = view.getProjection();

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

// /**
//  *
//  * @param {!String} configUrl
//  */
// export const createAppWithRemoteConfig = async configUrl => {
//   try {
//     const responce = await fetch(configUrl);
//     const config = await responce.json();
//     if (!config) {
//       throw `Error loading config from url: ${configUrl}`;
//     }
//     const app = await createApp(config);
//     return app;
//   } catch ({ message }) {
//     throw `Error while reading config from: ${configUrl}. ${message}`;
//   }
// };

// /**
//  * @param {import('./defaultConfig').AppConfig} appConfig
//  * @return {Promise<Map>}
//  */
// const createApp = async appConfig => {
//   try {
//     appConfig = Object.assign({}, defaultAppConfig, appConfig);
//     backend.initialize();
//     const map = await createMap(appConfig.map);
//     return map;
//   } catch ({ message }) {
//     throw `Error while creating app with config. ${message}`;
//   }
// };

// export { backend, map, initializeMap, createAppWithRemoteConfig, createApp, createMap };
