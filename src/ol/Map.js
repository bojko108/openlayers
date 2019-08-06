/**
 * @module ol/Map
 */
import PluggableMap from "./PluggableMap.js";
import { defaults as defaultControls } from "./control.js";
import { defaults as defaultInteractions } from "./interaction.js";
import { assign } from "./obj.js";
import CompositeMapRenderer from "./renderer/Composite.js";

import { toDegrees, toRadians } from "./math";
import { METERS_PER_UNIT, get as getProjection, transform, transformExtent, Projection } from "./proj.js";
import View from "./View.js";
import { easeOut } from "./easing.js";
import { getVectorContext } from "./render.js";
import { fromExtent } from "./geom/Polygon.js";
import Feature from "./Feature.js";
import LayerProperty from "./layer/Property.js";

import { setMap, createOperationalLayer, createFeatureStyle, calculateFeaturesExtent, calculateCenterPointOfExtent, splitAtIndex } from "./daemon";
import ArcGISDynamicMapServiceLayer from "./layer/ArcGISDynamicMapServiceLayer.js";
import flashingOptions from "./daemon/helpers/flashingOptions.js";

/**
 * @classdesc
 * The map is the core component of OpenLayers. For a map to render, a view,
 * one or more layers, and a target container are needed:
 *
 *     import Map from 'ol/Map';
 *     import View from 'ol/View';
 *     import TileLayer from 'ol/layer/Tile';
 *     import OSM from 'ol/source/OSM';
 *
 *     var map = new Map({
 *       view: new View({
 *         center: [0, 0],
 *         zoom: 1
 *       }),
 *       layers: [
 *         new TileLayer({
 *           source: new OSM()
 *         })
 *       ],
 *       target: 'map'
 *     });
 *
 * The above snippet creates a map using a {@link module:ol/layer/Tile} to
 * display {@link module:ol/source/OSM~OSM} OSM data and render it to a DOM
 * element with the id `map`.
 *
 * The constructor places a viewport container (with CSS class name
 * `ol-viewport`) in the target element (see `getViewport()`), and then two
 * further elements within the viewport: one with CSS class name
 * `ol-overlaycontainer-stopevent` for controls and some overlays, and one with
 * CSS class name `ol-overlaycontainer` for other overlays (see the `stopEvent`
 * option of {@link module:ol/Overlay~Overlay} for the difference). The map
 * itself is placed in a further element within the viewport.
 *
 * Layers are stored as a {@link module:ol/Collection~Collection} in
 * layerGroups. A top-level group is provided by the library. This is what is
 * accessed by `getLayerGroup` and `setLayerGroup`. Layers entered in the
 * options are added to this group, and `addLayer` and `removeLayer` change the
 * layer collection in the group. `getLayers` is a convenience function for
 * `getLayerGroup().getLayers()`. Note that {@link module:ol/layer/Group~Group}
 * is a subclass of {@link module:ol/layer/Base}, so layers entered in the
 * options or added with `addLayer` can be groups, which can contain further
 * groups, and so on.
 *
 * @api
 */
class Map extends PluggableMap {
  /**
   * @param {import("./PluggableMap.js").MapOptions} options Map options.
   */
  constructor(options) {
    options = assign({}, options);
    if (!options.controls) {
      options.controls = defaultControls();
    }
    if (!options.interactions) {
      options.interactions = defaultInteractions();
    }

    super(options);

    this._defaultLayer = createOperationalLayer({
      metadata: { name: "defaultLayer" }
    });
    this._defaultLayer.setMap(this);

    // set map for each layer
    // @ts-ignore
    if (options.layers && options.layers.length > 0) {
      // @ts-ignore
      for (let i = 0; i < options.layers.length; i++) {
        options.layers[i].set(LayerProperty.MAP, this);
      }
    }

    setMap(this);
  }

  createRenderer() {
    return new CompositeMapRenderer(this);
  }

  get defaultLayer() {
    return this._defaultLayer;
  }

  /**
   * Get current map center point - in format [y,x], projection is according to {@link Map.projection}.
   * To get the center in different projection you can use {@link Map.getCenter}.
   * @type {import('./coordinate').Coordinate}
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#getCenter
   */
  get center() {
    return this.getView().getCenter();
  }
  /**
   * set new map center point
   * @param {!import('./coordinate').Coordinate} center - coordinates must be provided in map's projection - {@link Map.projection}
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#setCenter
   * @example
   * map.center = transform([longitude, latitude], 'EPSG:4326', map.projection);
   */
  set center(center) {
    this.getView().animate({ center, duration: 250 });
  }
  /**
   * get current map zoom level
   * @type {Number}
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#getZoom
   */
  get zoom() {
    return this.getView().getZoom();
  }
  /**
   * set new zoom level
   * @param {!Number} zoom - zoom level
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#setZoom
   * @example
   * map.zoom = 12
   */
  set zoom(zoom) {
    this.getView().animate({ zoom, duration: 250 });
  }
  /**
   * get map current rotation angle in degrees
   * @type {Number}
   */
  get rotation() {
    return toDegrees(this.getView().getRotation());
  }
  /**
   * set map rotation angle - value is in degrees
   * @type {!Number}
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#setRotation
   */
  set rotation(angle) {
    this.getView().animate({ rotation: toRadians(angle), duration: 250 });
  }
  /**
   * set new map view: center, zoom level and rotation
   * @param {Object} value - new parameters for the map view
   * @param {Number} [value.zoom] - zoom level
   * @param {Number} [value.rotation] - rotation in degrees
   * @param {import('./coordinate').Coordinate} [value.center] - map center
   * @example
   * map.positionAt({
   *    zoom: 12,
   *    rotation: 0,
   *    center: transform([longitude, latitude], 'EPSG:4326', map.projection)
   * })
   */
  positionAt({ zoom, rotation, center }) {
    this.getView().animate({ zoom, center, rotation: toRadians(rotation) });
  }

  /**
   * zoom in
   */
  zoomIn() {
    this.getView().animate({ zoom: this.zoom + 1, duration: 250 });
  }

  /**
   * zoom out
   */
  zoomOut() {
    this.getView().animate({ zoom: this.zoom - 1, duration: 250 });
  }

  /**
   * reference to map projection code
   * @public
   * @type {String}
   * @see http://openlayers.org/en/latest/apidoc/ol.proj.Projection.html
   */
  get projection() {
    return this.getView()
      .getProjection()
      .getCode();
  }
  /**
   * get current map projection
   * @return {import('./proj/Projection').default}
   */
  getProjection() {
    return this.getView().getProjection();
  }
  /**
   * set new map projection
   * @param {import('./proj/Projection').default|import('./proj').ProjectionLike} projection
   */
  setProjection(projection) {
    if (projection instanceof Projection === false) {
      projection = getProjection(projection);
    }

    if (!projection) return;

    let oldView = this.getView();

    // @ts-ignore
    this.layers.forEach(layer => layer.__mapProjectionChanged());

    this.setView(
      new View({
        projection: projection,
        center: transform(oldView.getCenter(), oldView.getProjection(), projection),
        zoom: oldView.getZoom(),
        rotation: oldView.getRotation(),
        minResolution: oldView.getMinResolution(),
        maxResolution: oldView.getMaxResolution()
      })
    );
  }

  /**
   * reference to loaded basemaps
   * @type {Array<import('./layer/Tile').default|import('./layer/Base').default>}
   */
  get basemaps() {
    return this.getBasemapLayers();
  }
  /**
   * reference to loaded vector layers
   * @type {Array<import('./layer/Vector').default|import('./layer/Base').default>}
   */
  get layers() {
    return this.getVectorLayers();
  }

  /**
   * get all selectable layers - {@link LayerInfo.selectable}
   * @type {Array.<import('./layer/Base').default>}
   */
  get selectableLayers() {
    return this.getLayersBy("selectable", true);
  }
  /**
   * reference to all searchable layers - {@link LayerInfo.searchable}
   * @type {Array.<import('./layer/Base').default>}
   */
  get searchableLayers() {
    return this.getLayersBy("searchable", true);
  }
  /**
   * reference to all snappable layers - {@link LayerInfo.snappable}
   * @type {Array.<import('./layer/Base').default>}
   */
  get snappableLayers() {
    return this.getLayersBy("snappable", true);
  }
  /**
   * reference to all editable layers - {@link LayerInfo.editable}
   * @type {Array<import('./layer/Base').default>}
   */
  get editableLayers() {
    return this.getLayersBy("editable", true);
  }

  /**
   * Set the version for all loaded ArcGIS Dynamic MapService Layers - all features are removed and
   * will be loaded again from the specified version
   * @param {!String} versionName - The name of the version to display.
   */
  setGDBVersion(versionName) {
    this.layers.forEach(layer => {
      if (layer instanceof ArcGISDynamicMapServiceLayer) {
        layer.setGDBVersion(versionName);
      }
    });
  }

  /**
   * get all loaded basemaps
   * @return {Array<import('./layer/Tile').default|import('./layer/Base').default>}
   */
  getBasemapLayers() {
    let layers = this.getLayers()
      .getArray()
      .slice()
      .reverse();

    return layers.filter(layer => {
      return layer.layerInfo.type === "basemap";
    });
  }
  /**
   * get all loaded vector layers
   * @return {Array<import('./layer/Vector').default|import('./layer/Base').default>}
   */
  getVectorLayers() {
    let layers = this.getLayers()
      .getArray()
      .slice()
      .reverse();

    return layers.filter(layer => {
      return layer.layerInfo.type === "vector";
    });
  }

  /**
   * Get layer by name.
   *
   * @param {!String} name - layer name
   * @return {import('./layer/Base').default}
   * @example
   * // get layer with name = 'places'
   * map.getLayer('places')
   */
  getLayer(name) {
    return this.getLayersBy("name", name)[0];
  }

  /**
   * Get layer by property value
   * @param {!String} parameter - layer property name
   * @param {!any} value - value to search for
   * @return {import('./layer/Base').default}
   * @example
   * // get layer with title = 'Some title'
   * map.getLayerBy('title', 'Some title')
   */
  getLayerBy(parameter, value) {
    if (arguments.length === 1) {
      value = parameter;
      parameter = "name";
    }
    return this.getLayersBy(parameter, value)[0];
  }
  /**
   * Get layers by property value
   * @param {!String} parameter - layer property name
   * @param {!any} value - value to search for
   * @return {Array<import('./layer/Base').default>}
   * @example
   * // get all editable layers
   * map.getLayersBy('editable', true).forEach(editableLayer => {
   *    console.log(editableLayer)
   * })
   * // get all visible layers
   * map.getLayersBy('visible', true).forEach(visibleLayer => {
   *    console.log(visibleLayer)
   * })
   */
  getLayersBy(parameter, value) {
    let layers = this.getLayers().getArray(),
      result = [];

    for (let i = 0; i < layers.length; i++) {
      if (layers[i].hasLayerInfo) {
        if (layers[i].layerInfo[parameter] === value) {
          result.push(layers[i]);
        }
        if (layers[i].layerInfo.type === "group") {
          // @ts-ignore
          for (let k = 0; k < layers[i].getLayers().getArray().length; k++) {
            // @ts-ignore
            if (
              // @ts-ignore
              layers[i].getLayers().getArray()[k].layerInfo[parameter] === value
            ) {
              // @ts-ignore
              result.push(layers[i].getLayers().getArray()[k]);
            }
          }
        }
      } else {
        if (layers[i].get(parameter) === value) {
          result.push(layers[i]);
        }
        if (layers[i].get("type") === "group") {
          // @ts-ignore
          for (let k = 0; k < layers[i].getLayers().getArray().length; k++) {
            if (
              layers[i]
                // @ts-ignore
                .getLayers()
                .getArray()
                [k].get(parameter) === value
            ) {
              // @ts-ignore
              result.push(layers[i].getLayers().getArray()[k]);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get current map center coordinates
   * @param {import('./proj').ProjectionLike} [destination='EPSG:4326'] - return the result in that projection
   * @return {import('./coordinate').Coordinate}
   */
  getCenter(destination = "EPSG:4326") {
    const extent = this.getVisibleExtent(destination);
    return calculateCenterPointOfExtent(extent);
  }
  /**
   * Get current map extent in particular projection
   * @param {import('./proj').ProjectionLike} [destination='EPSG:4326'] - project the result in that projection
   * @return {import('./extent').Extent}
   */
  getVisibleExtent(destination = "EPSG:4326") {
    const extent = transformExtent(this.getView().calculateExtent(this.getSize()), this.projection, destination);
    return extent;
  }

  /**
   * Set map scale
   * @param {!Number} scale
   * @example
   * // set map scale to 1:25 000
   * map.setScale(25000)
   */
  setScale(scale) {
    const resolution = this.getResolutionFromScale(scale);
    this.getView().setResolution(resolution);
  }
  /**
   * Get current map scale
   * @param {Boolean} [round] - to round the result or not
   * @return {Number}
   */
  getScale(round) {
    const resolution = this.getResolution();
    return this.getScaleFromResolution(resolution, round);
  }
  /**
   * Get current map resolution
   * @return {Number}
   * @see http://openlayers.org/en/latest/apidoc/ol.View.html#getResolution
   */
  getResolution() {
    return this.getView().getResolution();
  }
  /**
   * Get map scale for particular resolution
   * @public
   * @param {!Number} resolution
   * @param {Boolean} [round] - to round the result or not
   * @return {Number}
   */
  getScaleFromResolution(resolution, round) {
    const mpu = METERS_PER_UNIT[this.getProjection().getUnits()],
      result = resolution * mpu * 39.37 * (25.4 / 0.28);
    return round === true ? Math.round(result) : result;
  }
  /**
   * Get map resolution for particular scale
   * @public
   * @param {!Number} scale - map scale
   * @return {Number}
   */
  getResolutionFromScale(scale) {
    let mpu = METERS_PER_UNIT[this.getProjection().getUnits()];
    return scale / (mpu * 39.37 * (25.4 / 0.28));
  }

  /**
   * Zoom to an array of features by FID
   * @param {!Array<string>} fids
   * @param {Object.<String,*>} [options={}] - additional parameters like padding, duration...
   */
  async zoomToFID(fids, options = {}) {
    let features = [];
    for (let i = 0; i < fids.length; i++) {
      const [layerName] = splitAtIndex(fids[i], fids[i].lastIndexOf("."));
      const layer = this.getLayer(layerName);
      // @ts-ignore
      features.push(await layer.getFeatureById(fid[i]));
    }
    this.zoomTo(features, options);
  }
  /**
   * Zoom to an array of features
   * @param {!Array<import('./Feature').default>} features
   * @param {import('./View').FitOptions} [options={}] - additional parameters like padding, duration...
   */
  zoomTo(features, options = {}) {
    const extent = calculateFeaturesExtent(features);
    this.zoomToExtent(extent, options);
  }
  /**
   * Zoom to an extent
   * @param {!import('./extent').Extent} extent
   * @param {import('./View').FitOptions} [options={}] - additional parameters like padding, duration...
   * @param {Number} [zoomLevel=17]
   */
  zoomToExtent(extent, options = {}, zoomLevel = 17) {
    if (extent[2] <= extent[0] || extent[3] <= extent[1]) {
      // in case of a point object
      this.center = [extent[0], extent[1]];
      this.zoom = zoomLevel;
    } else {
      this.getView().fit(extent, options);
    }
  }

  /**
   * Move to an array of features by FID
   * @param {!Array<String>} fids
   */
  async panToFID(fids) {
    let features = [];
    for (let i = 0; i < fids.length; i++) {
      const [layerName] = splitAtIndex(fids[i], fids[i].lastIndexOf("."));
      const layer = this.getLayer(layerName);
      // @ts-ignore
      features.push(await layer.getFeatureById(fid[i]));
    }
    this.panTo(features);
  }
  /**
   * Move to and array of features
   * @param {!Array<import('./Feature').default>} features
   */
  panTo(features) {
    const extent = calculateFeaturesExtent(features);
    this.panToExtent(extent);
  }
  /**
   * Move to an extent
   * @param {!import('./extent').Extent} extent
   */
  panToExtent(extent) {
    this.center = calculateCenterPointOfExtent(extent);
  }

  /**
   * Flash an array of feature by FID
   * @param {!Array<String>} fids
   * @param {import('./daemon/helpers/flashingOptions').FlashingOptions} [options] - options for flash animation - color, duration and size
   */
  async flashFID(fids, options) {
    let features = [];
    for (let i = 0; i < fids.length; i++) {
      const [layerName] = splitAtIndex(fids[i], fids[i].lastIndexOf("."));
      const layer = this.getLayer(layerName);
      // @ts-ignore
      features.push(await layer.getFeatureById(fid[i]));
    }
    this.flash(features, options);
  }
  /**
   * Flash an array of features on the map
   * @param {!Array<import('./Feature').default>} features - features to flash
   * @param {import('./daemon/helpers/flashingOptions').FlashingOptions} [options] - options for flash animation - color, duration and size
   */
  flash(features, options) {
    options = Object.assign({}, flashingOptions, options);
    const layer = this.defaultLayer,
      start = new Date().getTime(),
      flashedFeatures = features.map(f => f.clone()),
      startFlashing = () => {
        layer.on("postrender", animate);
        layer.addFeatures(flashedFeatures);
        this.render();
      },
      stopFlashing = () => {
        layer.removeFeatures(flashedFeatures);
        layer.un("postrender", animate);
      },
      animate = event => {
        const vectorContext = getVectorContext(event),
          frameState = event.frameState,
          elapsed = frameState.time - start,
          elapsedRatio = elapsed / options.duration,
          newRadius = easeOut(elapsedRatio) * options.radius + options.radius / 2,
          opacity = easeOut(1 - elapsedRatio),
          color = `rgba(${options.red},${options.green},${options.blue},${opacity})`,
          style = createFeatureStyle({
            stroke: {
              color,
              width: easeOut(elapsedRatio) * (options.radius * 2)
            },
            fill: { color },
            circle: {
              radius: newRadius,
              stroke: {
                color,
                width: easeOut(elapsedRatio) * (options.radius * 2)
              }
            }
          });

        if (elapsed > options.duration) {
          stopFlashing();
          return;
        } else {
          vectorContext.setStyle(style);
          for (let i = 0; i < flashedFeatures.length; i++) {
            vectorContext.drawGeometry(flashedFeatures[i].getGeometry().clone());
          }
          this.render();
        }
      };

    startFlashing();
  }
  /**
   * Flash an array of features on the map
   * @param {!import('./extent').Extent} extent
   * @param {import('./daemon/helpers/flashingOptions').FlashingOptions} [options] - options for flash animation - color, duration and size
   */
  flashExtent(extent, options = {}) {
    options = Object.assign({}, flashingOptions, options);
    const layer = this.defaultLayer,
      start = new Date().getTime(),
      flashedFeature = new Feature({ geometry: fromExtent(extent) }),
      startFlashing = () => {
        layer.on("postrender", animate);
        layer.addFeature(flashedFeature);
        this.render();
      },
      stopFlashing = () => {
        layer.removeFeature(flashedFeature);
        layer.un("postrender", animate);
      },
      animate = event => {
        const vectorContext = getVectorContext(event),
          frameState = event.frameState,
          elapsed = frameState.time - start,
          elapsedRatio = elapsed / options.duration,
          newRadius = easeOut(elapsedRatio) * options.radius + options.radius / 2,
          opacity = easeOut(1 - elapsedRatio),
          color = `rgba(${options.red},${options.green},${options.blue},${opacity})`,
          style = createFeatureStyle({
            stroke: {
              color,
              width: easeOut(elapsedRatio) * (options.radius * 2)
            },
            fill: { color },
            circle: {
              radius: newRadius,
              stroke: {
                color,
                width: easeOut(elapsedRatio) * (options.radius * 2)
              }
            }
          });
        if (elapsed > options.duration) {
          stopFlashing();
          return;
        } else {
          vectorContext.setStyle(style);
          vectorContext.drawGeometry(flashedFeature.getGeometry().clone());
          this.render();
        }
      };

    startFlashing();
  }
}

export default Map;
