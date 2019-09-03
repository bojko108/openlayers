import Basemaps, { EnumBasemaps } from './Basemaps';
import TileSource from '../../source/Tile';
import TileLayer from '../../layer/Tile';
import VectorLayer from '../../layer/Vector';
import { EnumLayerType } from './info/LayerInfo';
import LayerGroup from '../../layer/Group';
import ArcGISDynamicMapServiceLayer from '../../layer/ArcGISDynamicMapServiceLayer';
import VectorSource from '../../source/Vector';
import DaemonVectorLayer from '../../layer/DaemonVectorLayer';

export { addDomain, getDomain, hasDomain, Domain, Field } from './fields';

/**
 *
 * @param {import('./Basemaps').BasemapSource} options
 * @return {TileSource}
 */
export const createBasemapSource = options => {
  switch (options.provider) {
    case EnumBasemaps.BGMOUNTAINS:
      return Basemaps.BGMountains;
    case EnumBasemaps.BINGMAPS:
      return Basemaps.BingMaps(options.mapType, options.culture, options.apiKey);
    case EnumBasemaps.LOCAL:
      return Basemaps.Local(options.url);
    case EnumBasemaps.MAPBOX:
      return Basemaps.MapBox(options.mapType, options.apiKey);
    case EnumBasemaps.NONE:
      return Basemaps.None;
    case EnumBasemaps.OCM:
      return Basemaps.OCM(options.apiKey);
    case EnumBasemaps.OSM:
      return Basemaps.OSM;
    case EnumBasemaps.STAMEN:
      return Basemaps.Stamen(options.mapType);
    case EnumBasemaps.TOPOGRAPHIC:
      return Basemaps.Topographic;
    case EnumBasemaps.WMS:
      return Basemaps.WMS(options.url, options.params, options.attribution);
    case EnumBasemaps.XYZ:
      return Basemaps.XYZ(options.url, options.attribution);
    case EnumBasemaps.ARCGISREST:
      return Basemaps.ARCGISREST(options);
  }
};

/**
 * Creates a new basemap layer
 *
 * @param {import('../../layer/BaseTile').Options|Object} options
 * @return {TileLayer}
 */
export const createBasemapLayer = options => {
  const source = createBasemapSource(options.metadata);
  options.source = source;
  return new TileLayer(options);
};

/**
 * Creates a new operational layer - vector layer
 *
 * @param {import('../../layer/BaseVector').Options|Object} options
 * @return {LayerGroup|ArcGISDynamicMapServiceLayer|DaemonVectorLayer|VectorLayer}
 */
export const createOperationalLayer = options => {
  if (options.metadata) {
    switch (options.metadata.type) {
      case EnumLayerType.GROUP:
        options.layers = options.layers.map(layer => createOperationalLayer(layer));
        return new LayerGroup(options);
      case EnumLayerType.ARCGIS:
        return new ArcGISDynamicMapServiceLayer(options);
      case EnumLayerType.DAEMON:
        return new DaemonVectorLayer(options);
      default:
        options.source = new VectorSource(options.source);
        return new VectorLayer(options);
    }
  } else {
    options.source = new VectorSource(options.source);
    return new VectorLayer(options);
  }
};
