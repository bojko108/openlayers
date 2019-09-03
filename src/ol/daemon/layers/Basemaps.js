import XYZ from '../../source/XYZ';
import OSM from '../../source/OSM';
import BingMaps from '../../source/BingMaps';
import Stamen from '../../source/Stamen';
import TileWMS from '../../source/TileWMS';
import TileArcGISRest from '../../source/TileArcGISRest';

/**
 * @typedef {Object} BasemapSource
 * @property {!EnumBasemaps} provider basemap provider
 * @property {String} [apiKey] access key - if required by the probider
 * @property {String} [url] an URL template, which must include `{x}`, `{y}` and `{z}` placeholders
 * @property {String} [mapType] if supported - For `Stamen`: one of `toner`, `terrain` or `watercolor`;
 * For `BingMaps`: `Road` or `Aerial`; For `MapBox`: `mapbox.streets`, `mapbox.satellite`, `mapbox.dark`...
 * @property {String} [culture='en-US'] culture code - only for `BingMaps`
 * @property {String} [attribution]
 * @property {Object} [params] WMS parameters. Use `{LAYERS: 'BGtopoVJ-raster-v3.00'}` - BG topo map from in scale 1:25 000
 * or `{LAYERS: 'BGtopo-126k'}` for BG topo map from in scale 1:126 000 - {@link http://web.uni-plovdiv.bg/vedrin/}
 */

/**
 * Available basemap sources
 * @enum {string}
 */
export const EnumBasemaps = {
  /**
   * Blank map
   */
  NONE: 'none',
  /**
   * Local tile layer, you must specify the URL template
   */
  LOCAL: 'local',
  /**
   * OpenStreetMap {@link http://www.openstreetmap.org}
   */
  OSM: 'osm',
  /**
   * OpenCycleMap {@link http://www.opencyclemap.org}
   */
  OCM: 'ocm',
  /**
   * Bing maps roads {@link https://www.bing.com/maps/}. You must also specify
   * an access key and map type as string - `Road`, `Aerial`...
   */
  BINGMAPS: 'bingmaps',
  /**
   * Stamen maps. You must specify the map type as string - `toner`, `terrain` or `watercolor`
   * {@link http://maps.stamen.com/watercolor/#12/43/24}
   */
  STAMEN: 'stamen',
  /**
   * You must specify the map type: `{LAYERS: 'BGtopoVJ-raster-v3.00'}` - BG topo map from in scale 1:25 000
   * or `{LAYERS: 'BGtopo-126k'}` for BG topo map from in scale 1:126 000 {@link http://web.uni-plovdiv.bg/vedrin/}
   */
  WMS: 'wms',
  /**
   * BGMountains map {@link http://bgmountains.org/}
   */
  BGMOUNTAINS: 'bgmountains',
  /**
   * Tiles in XYZ format
   */
  XYZ: 'xyz',
  /**
   * Tiles from ArcGIS Rest MapService
   */
  ARCGISREST: 'arcgisrest',
  /**
   * OpenTopoMap {@link http://opentopomap.org/}
   */
  TOPOGRAPHIC: 'topographic',
  /**
   * Mapbox  {@link http://mapbox.com}. You must also specify an access key and map type
   * as string - `mapbox.streets`, `mapbox.satellite`, `mapbox.dark`...
   */
  MAPBOX: 'mapbox'
};
/**
 * @classdesc
 * Class used for createing basemap sources
 *
 * Google Maps Tiles:
 * http://mts{s}.google.com/vt/lyrs=y&hl=en&x=${x}&y=${y}&z=${z}
 * h = roads only
 * m = standard roadmap
 * p = terrain
 * r = somehow altered roadmap
 * s = satellite only
 * t = terrain only
 * y = hybrid
 * @api
 */
export default class Basemaps {
  /**
   * Create a blank basemap layer
   * @return {null}
   */
  static get None() {
    return null;
  }
  /**
   * Create new source for tile data with URL set in XYZ format
   * @param {!String} url - an URL template, which must include `{x}`, `{y}` and `{z}` placeholders
   * @return {XYZ}
   */
  static Local(url) {
    return new XYZ({
      url: url,
      attributions: 'local data',
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create new source for tile data in OpenStreetMap format {@link http://www.openstreetmap.org}
   * @return {OSM}
   */
  static get OSM() {
    return new OSM({
      attributions: '<a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>',
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create new source for tile data in OpenCycleMap format {@link http://www.opencyclemap.org}
   * @param {?String} apiKey - access key
   * @return {XYZ}
   */
  static OCM(apiKey = 'a5ce9ce48b7d48238f1c691c4161f29c') {
    return new XYZ({
      url: `https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${apiKey}`,
      attributions: '<a href="https://www.opencyclemap.org" target="_blank">OpenCycleMap</a>',
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create new source with Bing Maps data - {@link https://www.bing.com/maps/}
   * @param {!String} mapType - map type - `Road` or `Aerial`
   * @param {?String} [culture='en-us'] - culture code
   * @param {?String} apiKey - access key
   * @return {BingMaps}
   */
  static BingMaps(mapType, culture = 'en-us', apiKey = 'AkGbxXx6tDWf1swIhPJyoAVp06H0s0gDTYslNWWHZ6RoPqMpB9ld5FY1WutX8UoF') {
    return new BingMaps({
      key: apiKey,
      culture: culture,
      imagerySet: mapType
    });
  }
  /**
   * Create new source for Stamen watercolor tile data - {@link http://maps.stamen.com/watercolor/#12/43/24}
   * @param {!String} mapType - one of `toner`, `terrain` or `watercolor`
   * @return {Stamen}
   */
  static Stamen(mapType) {
    return new Stamen({
      layer: mapType,
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create new source for tile data from a WMS server
   * @param {!String} url
   * @param {import('../../source/TileWMS').Options} params - WMS parameters
   * use `{LAYERS: 'BGtopoVJ-raster-v3.00'}` - BG topo map from in scale 1:25 000
   * or `{LAYERS: 'BGtopo-126k'}` for BG topo map from in scale 1:126 000 - {@link http://web.uni-plovdiv.bg/vedrin/}
   * @return {TileWMS}
   */
  static WMS(url, params, attribution) {
    return new TileWMS({
      url: url, //'http://www.kade.si/cgi-bin/mapserv?',
      params: params, //{ 'LAYERS': mapType, 'TILED': true, 'format': 'image/png' },
      attributions: attribution //'<a href="http://cart.uni-plovdiv.net/" target="_blank">CART Lab</a> / <a href="https://plus.google.com/117738982997877636232?rel=author" target="_blank">Vedrin Jeliazkov</a>'
    });
  }
  /**
   * Create a new BG Mountains source
   * @return {XYZ}
   */
  static get BGMountains() {
    return new XYZ({
      url: 'http://bgmtile.kade.si/{z}/{x}/{y}.png',
      attributions:
        '<a href="http://cart.uni-plovdiv.net/" target="_blank">CART Lab</a> / <a href="http://www.bgmountains.org/" target="_blank">BGM team</a>',
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create a new XYZ source
   * @param {!String} url
   * @param {?String} attribution
   */
  static XYZ(url, attribution) {
    return new XYZ({
      url: url,
      attributions: attribution,
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create a new Tile source from ArcGIS Rest MapService
   * @param {!import('../../source/TileArcGISRest').Options} options
   */
  static ARCGISREST(options) {
    options.crossOrigin = options.crossOrigin || 'anonymous';
    return new TileArcGISRest(options);
  }
  /**
   * Create new source for tile data with URL set in XYZ format
   * - OpenTopoMap {@link http://opentopomap.org/}
   * @return {XYZ}
   */
  static get Topographic() {
    return new XYZ({
      url: 'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      attributions: '<a href="https://opentopomap.org/" target="_blank">OpenTopoMap</a>',
      crossOrigin: 'anonymous'
    });
  }
  /**
   * Create new source for tile data with URL set in XYZ format
   * - MapBox Aerial {@link http://mapbox.com/}
   * @param {?String} mapType - `mapbox.streets`, `mapbox.satellite`, `mapbox.dark`...
   * @param {?String} apiKey - access key
   * @return {XYZ}
   */
  static MapBox(mapType, apiKey = 'pk.eyJ1IjoiYm9qa28xMDgiLCJhIjoiY2l2ajc5NXpmMDA1NzJ0cHAzNjllZW9rcSJ9.3zzjbfbOdfhaXqLHZYkcNQ') {
    return new XYZ({
      url: `https://api.tiles.mapbox.com/v4/${mapType}/{z}/{x}/{y}.png?access_token=${apiKey}`,
      attributions: '<a href="https://www.mapbox.com" target="_blank">MapBox</a>',
      crossOrigin: 'anonymous'
    });
  }
}
