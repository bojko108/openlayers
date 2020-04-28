/**
 * @module ol/Feature
 */
import BaseObject, { getChangeEventType } from "./Object.js";
import EventType from "./events/EventType.js";
import { assert } from "./asserts.js";
import { listen, unlistenByKey } from "./events.js";
import { getVectorContext } from "./render.js";
import { easeOut } from "./easing.js";

import { createFeatureStyle, calculateCenterPointOfExtent } from "./daemon";
import flashingOptions from "./daemon/helpers/flashingOptions.js";

/**
 * Indicates feature states - used when styling the feature before drawing it on the map. If `hidden = true`
 * other states are not checked when styling the feature. A feature can have both `selected` and `highlighted`
 * turned on at the same time.
 * @typedef FeatureState
 * @property {Boolean} [selected] - is the feature in selected state. When in this state the feature
 * will have an additional select style - {@link defaultSelectStyle}.
 * @property {Boolean} [highlighted] - is the feature in highlighted state. When in this state the feature
 * will have an additional highlight style - {@link defaultHighlightStyle}.
 * @property {Boolean} [hidden] - is the feature in hidden state. When in this state, the feature will
 * have style = `null` and wont be visible on the map.
 */

/**
 * @typedef FeatureAttribute
 * @property {String} name
 * @property {String} alias
 * @property {Boolean} visible
 * @property {Boolean} editable
 * @property {String} type - should be with own typedef
 * @property {Boolean} hasDomain
 * @property {import('./daemon/layers/fields/Domain').default} domain
 * @property {any} value
 * @property {String|Number} code - probably code shouldn't be returned at all
 */

/**
 * @typedef {typeof Feature|typeof import("./render/Feature.js").default} FeatureClass
 */

/**
 * @typedef {Feature|import("./render/Feature.js").default} FeatureLike
 */

/**
 * @classdesc
 * A vector object for geographic features with a geometry and other
 * attribute properties, similar to the features in vector file formats like
 * GeoJSON.
 *
 * Features can be styled individually with `setStyle`; otherwise they use the
 * style of their vector layer.
 *
 * Note that attribute properties are set as {@link module:ol/Object} properties on
 * the feature object, so they are observable, and have get/set accessors.
 *
 * Typically, a feature has a single geometry property. You can set the
 * geometry using the `setGeometry` method and get it with `getGeometry`.
 * It is possible to store more than one geometry on a feature using attribute
 * properties. By default, the geometry used for rendering is identified by
 * the property name `geometry`. If you want to use another geometry property
 * for rendering, use the `setGeometryName` method to change the attribute
 * property associated with the geometry for the feature.  For example:
 *
 * ```js
 *
 * import Feature from 'ol/Feature';
 * import Polygon from 'ol/geom/Polygon';
 * import Point from 'ol/geom/Point';
 *
 * var feature = new Feature({
 *   geometry: new Polygon(polyCoords),
 *   labelPoint: new Point(labelCoords),
 *   name: 'My Polygon'
 * });
 *
 * // get the polygon geometry
 * var poly = feature.getGeometry();
 *
 * // Render the feature as a point using the coordinates from labelPoint
 * feature.setGeometryName('labelPoint');
 *
 * // get the point geometry
 * var point = feature.getGeometry();
 * ```
 *
 * @api
 * @template {import("./geom/Geometry.js").default} Geometry
 */
class Feature extends BaseObject {
  /**
   * @param {Geometry|Object<string, *>=} opt_geometryOrProperties
   *     You may pass a Geometry object directly, or an object literal containing
   *     properties. If you pass an object literal, you may include a Geometry
   *     associated with a `geometry` key.
   */
  constructor(opt_geometryOrProperties) {
    super();

    /**
     * @private
     * @type {number|string|undefined}
     */
    this.id_ = undefined;

    /**
     * @private
     * @type {import('./layer/Vector').default}
     */
    this._layer = undefined;

    /**
     * @type {FeatureState}
     */
    this._state = {
      selected: false,
      highlighted: false,
      hidden: false,
    };

    /**
     * @type {string}
     * @private
     */
    this.geometryName_ = "geometry";

    /**
     * User provided style.
     * @private
     * @type {import("./style/Style.js").StyleLike}
     */
    this.style_ = null;

    /**
     * @private
     * @type {import("./style/Style.js").StyleFunction|undefined}
     */
    this.styleFunction_ = undefined;

    /**
     * @private
     * @type {?import("./events.js").EventsKey}
     */
    this.geometryChangeKey_ = null;

    this.addEventListener(
      getChangeEventType(this.geometryName_),
      this.handleGeometryChanged_
    );

    if (opt_geometryOrProperties) {
      if (
        typeof (
          /** @type {?} */ (opt_geometryOrProperties).getSimplifiedGeometry
        ) === "function"
      ) {
        const geometry = /** @type {Geometry} */ (opt_geometryOrProperties);
        this.setGeometry(geometry);
      } else {
        /** @type {Object<string, *>} */
        const properties = opt_geometryOrProperties;
        this.setProperties(properties);
      }
    }
  }
  /**
   * @param {import('./layer/Vector').default} layer
   */
  setLayer(layer) {
    this._layer = layer;
  }

  /**
   * layer this feature belongs to
   * @type {import('./layer/Vector').default}
   */
  get layer() {
    return this._layer;
  }

  /**
   * Indicates feature states - used when styling the feature before drawing it on the map. If `hidden = true`
   * other states are not checked when styling the feature. A feature can have both `selected` and `highlighted`
   * turned on at the same time.
   * @type {FeatureState}
   */
  get state() {
    return this._state;
  }

  /**
   * Select this feature. After calling this function, `state.selected` will be `true`.
   * @param {!Boolean} selected - is the feature selected or not
   */
  setSelected(selected) {
    this._state.selected = selected;
    this.changed();
  }
  /**
   * Highlight this feature. After calling this function, `state.highlighted` will be `true`.
   * @param {!Boolean} highlighted - is the feature highlighted or not
   */
  setHighlighted(highlighted) {
    this._state.highlighted = highlighted;
    this.changed();
  }
  /**
   * Hide this feature. After calling this function, `state.hidden` will be `true`.
   * @param {!Boolean} hidden - is the feature hidden or not
   */
  setHidden(hidden) {
    this._state.hidden = hidden;
    this.changed();
  }
  /**
   * Reset feature state. After calling this function, all feature states will be `false`.
   */
  resetState() {
    this._state = {
      selected: false,
      highlighted: false,
      hidden: false,
    };
    this.changed();
  }

  /**
   * Clone this feature. If the original feature has a geometry it
   * is also cloned. The feature id is not set in the clone.
   * @return {Feature} The clone.
   * @api
   */
  clone() {
    const clone = new Feature(this.getProperties());
    clone.setGeometryName(this.getGeometryName());
    const geometry = this.getGeometry();
    if (geometry) {
      clone.setGeometry(geometry.clone());
    }
    const style = this.getStyle();
    if (style) {
      clone.setStyle(style);
    }
    return clone;
  }

  /**
   * Get the feature's default geometry.  A feature may have any number of named
   * geometries.  The "default" geometry (the one that is rendered by default) is
   * set when calling {@link module:ol/Feature~Feature#setGeometry}.
   * @return {Geometry|undefined} The default geometry for the feature.
   * @api
   * @observable
   */
  getGeometry() {
    return /** @type {Geometry|undefined} */ (this.get(this.geometryName_));
  }

  /**
   * Get the feature identifier.  This is a stable identifier for the feature and
   * is either set when reading data from a remote source or set explicitly by
   * calling {@link module:ol/Feature~Feature#setId}.
   * @return {number|string|undefined} Id.
   * @api
   */
  getId() {
    return this.id_;
  }

  /**
   * Get the name of the feature's default geometry.  By default, the default
   * geometry is named `geometry`.
   * @return {string} Get the property name associated with the default geometry
   *     for this feature.
   * @api
   */
  getGeometryName() {
    return this.geometryName_;
  }

  /**
   * Get the feature's style. Will return what was provided to the
   * {@link module:ol/Feature~Feature#setStyle} method.
   * @return {import("./style/Style.js").StyleLike} The feature style.
   * @api
   */
  getStyle() {
    return this.style_;
  }

  /**
   * Get the feature's style function.
   * @return {import("./style/Style.js").StyleFunction|undefined} Return a function
   * representing the current style of this feature.
   * @api
   */
  getStyleFunction() {
    return this.styleFunction_;
  }

  /**
   * @private
   */
  handleGeometryChange_() {
    this.changed();
  }

  /**
   * @private
   */
  handleGeometryChanged_() {
    if (this.geometryChangeKey_) {
      unlistenByKey(this.geometryChangeKey_);
      this.geometryChangeKey_ = null;
    }
    const geometry = this.getGeometry();
    if (geometry) {
      this.geometryChangeKey_ = listen(
        geometry,
        EventType.CHANGE,
        this.handleGeometryChange_,
        this
      );
    }
    this.changed();
  }

  /**
   * Set the default geometry for the feature.  This will update the property
   * with the name returned by {@link module:ol/Feature~Feature#getGeometryName}.
   * @param {Geometry|undefined} geometry The new geometry.
   * @api
   * @observable
   */
  setGeometry(geometry) {
    this.set(this.geometryName_, geometry);
  }

  /**
   * Set the style for the feature.  This can be a single style object, an array
   * of styles, or a function that takes a resolution and returns an array of
   * styles. If it is `null` the feature has no style (a `null` style).
   * @param {import("./style/Style.js").StyleLike} style Style for this feature.
   * @api
   * @fires module:ol/events/Event~BaseEvent#event:change
   */
  setStyle(style) {
    this.style_ = style;
    this.styleFunction_ = !style ? undefined : createStyleFunction(style);
    this.changed();
  }

  /**
   * Set the feature id.  The feature id is considered stable and may be used when
   * requesting features or comparing identifiers returned from a remote source.
   * The feature id can be used with the
   * {@link module:ol/source/Vector~VectorSource#getFeatureById} method.
   * @param {number|string|undefined} id The feature id.
   * @api
   * @fires module:ol/events/Event~BaseEvent#event:change
   */
  setId(id) {
    this.id_ = id;
    this.changed();
  }

  /**
   * Set the property name to be used when getting the feature's default geometry.
   * When calling {@link module:ol/Feature~Feature#getGeometry}, the value of the property with
   * this name will be returned.
   * @param {string} name The property name of the default geometry.
   * @api
   */
  setGeometryName(name) {
    this.removeEventListener(
      getChangeEventType(this.geometryName_),
      this.handleGeometryChanged_
    );
    this.geometryName_ = name;
    this.addEventListener(
      getChangeEventType(this.geometryName_),
      this.handleGeometryChanged_
    );
    this.handleGeometryChanged_();
  }

  /**
   * Get feature attributes. If the layer has metadata {@link LayerInfo} attribute values will be
   * formatted with additional information.
   * @param {Boolean} [returnNames] - return field names instead of aliases
   * @param {Boolean} [returnDomainCodes] - return domain codes instead of values
   * @param {Boolean} [doNotReturnDomain] - don't return the entire domain
   * @return {Array<FeatureAttribute|Object>}
   */
  getAttributes(returnNames, returnDomainCodes, doNotReturnDomain) {
    const layerInfo = this.layer.layerInfo;
    const props = this.getProperties();
    let result = [];

    if (layerInfo) {
      result = layerInfo.fields.map((field) => ({
        name: field.name,
        alias: returnNames ? field.name : field.alias,
        visible: field.visible,
        editable: field.editable,
        type: field.type,
        hasDomain: field.hasDomain,
        domain: doNotReturnDomain
          ? undefined
          : field.hasDomain
          ? field.domain
          : undefined,
        value: returnDomainCodes
          ? props[field.name]
          : field.hasDomain
          ? field.domain.getValue(props[field.name])
          : props[field.name],
        // probably code shouldn't be returned at all
        code: field.hasDomain ? props[field.name] : undefined,
      }));
    } else {
      for (let name in props) {
        if (name === "geometry") continue;
        result.push({
          name,
          alias: name,
          value: props[name],
        });
      }
    }

    return result;
  }

  /**
   * Zoom to this feature
   * @param {Number} [zoomLevel=17]
   * @param {import('./View').FitOptions} [options={}] - additional parameters like padding, duration...
   */
  zoomTo(zoomLevel = 17, options = {}) {
    const extent = this.getGeometry().getExtent();
    if (extent[2] <= extent[0] || extent[3] <= extent[1]) {
      // in case of a point object
      this.layer.map.center = [extent[0], extent[1]];
      this.layer.map.zoom = zoomLevel;
    } else {
      this.layer.map.getView().fit(extent, options);
    }
  }

  /**
   * Move to this feature
   */
  panTo() {
    const extent = this.getGeometry().getExtent();
    this.layer.map.center = calculateCenterPointOfExtent(extent);
  }

  /**
   * Flash this feature
   * @param {import('./daemon/helpers/flashingOptions').default} [options] - options for flash animation
   */
  flash(options) {
    options = Object.assign({}, flashingOptions, options);
    const layer = this.layer,
      start = new Date().getTime(),
      flashedFeature = this.clone(),
      startFlashing = () => {
        layer.on("postrender", animate);
        layer.addFeature(flashedFeature);
        this.layer.map.render();
      },
      stopFlashing = () => {
        layer.removeFeature(flashedFeature);
        layer.un("postrender", animate);
      },
      animate = (event) => {
        const vectorContext = getVectorContext(event),
          frameState = event.frameState,
          flashGeom = flashedFeature.getGeometry().clone(),
          elapsed = frameState.time - start,
          elapsedRatio = elapsed / options.duration,
          newRadius =
            easeOut(elapsedRatio) * options.radius + options.radius / 2,
          opacity = easeOut(1 - elapsedRatio),
          color = `rgba(${options.red},${options.green},${options.blue},${opacity})`,
          style = createFeatureStyle({
            stroke: {
              color,
              width: easeOut(elapsedRatio) * (options.radius * 2),
            },
            fill: { color },
            circle: {
              radius: newRadius,
              stroke: {
                color,
                width: easeOut(elapsedRatio) * (options.radius * 2),
              },
            },
          });

        if (elapsed > options.duration || !this.layer) {
          stopFlashing();
          return;
        } else {
          vectorContext.setStyle(style);
          vectorContext.drawGeometry(flashGeom);

          this.layer.map.render();
        }
      };

    startFlashing();
  }

  // /**
  //  *
  //  * @param {import('./daemon/layers/relationships').default} relationship
  //  */
  // getRelatedFeatures(relationship) {
  //   const layer = this.layer.map.getLayerBy('layerId', relationship.relatedTableId);
  //   if (!layer) {
  //     throw `Layer with id: ${relationship.relatedTableId} was not found!`;
  //   }
  //   const fid = this.getId().toString();
  //   const id = fid.substring(fid.lastIndexOf('.') + 1);
  //   // @ts-ignore
  //   layer.search({ where: `STAN_OID = ${id}` }).then(features => {
  //     console.log(features);
  //   });
  // }
}

/**
 * Convert the provided object into a feature style function.  Functions passed
 * through unchanged.  Arrays of Style or single style objects wrapped
 * in a new feature style function.
 * @param {!import("./style/Style.js").StyleFunction|!Array<import("./style/Style.js").default>|!import("./style/Style.js").default} obj
 *     A feature style function, a single style, or an array of styles.
 * @return {import("./style/Style.js").StyleFunction} A style function.
 */
export function createStyleFunction(obj) {
  if (typeof obj === "function") {
    return obj;
  } else {
    /**
     * @type {Array<import("./style/Style.js").default>}
     */
    let styles;
    if (Array.isArray(obj)) {
      styles = obj;
    } else {
      assert(typeof (/** @type {?} */ (obj).getZIndex) === "function", 41); // Expected an `import("./style/Style.js").Style` or an array of `import("./style/Style.js").Style`
      const style = /** @type {import("./style/Style.js").default} */ (obj);
      styles = [style];
    }
    return function () {
      return styles;
    };
  }
}
export default Feature;
