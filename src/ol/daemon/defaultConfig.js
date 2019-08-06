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
 * @property {Object} [controls] map controls
 * @property {Boolean} [controls.rotate=true] rotate control
 * @property {Boolean} [controls.zoom=true] zoom control
 * @property {Boolean} [controls.attribution=false] attribution control
 * @property {Boolean} [controls.scale=true] scale control
 * @property {Boolean} [controls.mousePosition=false] mouse position control
 * @property {Object} [interactions] map interactions
 * @property {Boolean} [interactions.altShiftDragRotate] altShiftDragRotate interaction
 * @property {Boolean} [interactions.doubleClickZoom=true] doubleClickZoom interaction
 * @property {Boolean} [interactions.dragPan=true] dragPan interaction
 * @property {Boolean} [interactions.pinchRotate] pinchRotate interaction
 * @property {Boolean} [interactions.pinchZoom=true] pinchZoom interaction
 * @property {Boolean} [interactions.keyboard=true] keyboard interaction
 * @property {Boolean} [interactions.mouseWheelZoom=true] mouseWheelZoom interaction
 * @property {Boolean} [interactions.shiftDragZoom=true] shiftDragZoom interaction
 * @property {Boolean} [controls.scale=true] scale control
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
  controls: {
    rotate: true,
    zoom: true,
    attribution: false,
    scale: true,
    mousePosition: false
  },
  interactions: {
    altShiftDragRotate: true,
    doubleClickZoom: true,
    dragPan: true,
    pinchRotate: true,
    pinchZoom: true,
    keyboard: true,
    mouseWheelZoom: true,
    shiftDragZoom: true
  },
  layers: [],
  basemaps: [{ metadata: { name: 'osm', provider: 'osm' } }]
};

export const defaultAppConfig = {
  baseUrl: null,
  map: defaultMapConfig,
  widgets: [],
  controls: []
};
