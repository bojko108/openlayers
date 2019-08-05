/**
 * @typedef {Object} AppConfig
 * @property {string} [baseUrl] URL address to the map config file
 * @property {MapConfig} [map]
 * @property {Array<Object>} [widgets]
 * @property {Array<Object>} [controls]
 */

/**
 * @typedef {Object} MapConfig
 * @property {string} [target] id of the HTMLElement containing the map
 * @property {import('../proj.js').ProjectionLike} [projection] map projection
 * @property {Number} [latitude=42.630284,24.9185543] latitude of the map's center in geographic coordinates
 * @property {Number} [longitude=24.9185543] longitude of the map's center in geographic coordinates
 * @property {Number} [zoom=7] map's zoom level
 * @property {Number} [rotation=0] map's rotation
 * @property {Array<Object>} [layers=[]] list of layers to be added to the map
 * @property {Array<Object>} [basemaps=[{ metadata: { name: 'osm', provider: 'osm' } }]] list of basemaps to be added to the map
 */

export const defaultMapConfig = {
  target: 'map',
  projection: 'EPSG:3857',
  latitude: 42.630284,
  longitude: 24.9185543,
  zoom: 7,
  rotation: 0,
  layers: [],
  basemaps: [{ metadata: { name: 'osm', provider: 'osm' } }]
};

export const defaultAppConfig = {
  baseUrl: null,
  map: defaultMapConfig,
  widgets: [],
  controls: []
};
