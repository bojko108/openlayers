/**
 * @module ol/layer/Group
 */
import { getUid } from '../util.js';
import Collection from '../Collection.js';
import CollectionEventType from '../CollectionEventType.js';
import { getChangeEventType } from '../Object.js';
import ObjectEventType from '../ObjectEventType.js';
import { assert } from '../asserts.js';
import { listen, unlistenByKey } from '../events.js';
import EventType from '../events/EventType.js';
import { getIntersection } from '../extent.js';
import BaseLayer from './Base.js';
import { assign, clear } from '../obj.js';
import SourceState from '../source/State.js';

/**
 * @typedef {Object} Options
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {Array<import("./Base.js").default>|import("../Collection.js").default<import("./Base.js").default>} [layers] Child layers.
 * @property {import('../daemon/layers/info/defaultOptions').LayerInfoOptions} [metadata] - layer info
 */

/**
 * @enum {string}
 * @private
 */
const Property = {
  LAYERS: 'layers'
};

/**
 * @classdesc
 * A {@link module:ol/Collection~Collection} of layers that are handled together.
 *
 * A generic `change` event is triggered when the group/Collection changes.
 *
 * @api
 */
class LayerGroup extends BaseLayer {
  /**
   * @param {Options=} opt_options Layer options.
   */
  constructor(opt_options) {
    const options = opt_options || {};
    const baseOptions = /** @type {Options} */ (assign({}, options));
    delete baseOptions.layers;

    let layers = options.layers;

    if (baseOptions.metadata) {
      baseOptions.metadata.type = 'group';
    }

    super(baseOptions);

    /**
     * @private
     * @type {Array<import("../events.js").EventsKey>}
     */
    this.layersListenerKeys_ = [];

    /**
     * @private
     * @type {Object<string, Array<import("../events.js").EventsKey>>}
     */
    this.listenerKeys_ = {};

    listen(this, getChangeEventType(Property.LAYERS), this.handleLayersChanged_, this);

    if (layers) {
      if (Array.isArray(layers)) {
        layers = new Collection(layers.slice(), { unique: true });
      } else {
        assert(typeof /** @type {?} */ (layers).getArray === 'function', 43); // Expected `layers` to be an array or a `Collection`
      }
    } else {
      layers = new Collection(undefined, { unique: true });
    }

    this.setLayers(layers);
  }

  /**
   * @private
   */
  handleLayerChange_() {
    this.changed();
  }

  /**
   * @private
   */
  handleLayersChanged_() {
    this.layersListenerKeys_.forEach(unlistenByKey);
    this.layersListenerKeys_.length = 0;

    const layers = this.getLayers();
    this.layersListenerKeys_.push(
      listen(layers, CollectionEventType.ADD, this.handleLayersAdd_, this),
      listen(layers, CollectionEventType.REMOVE, this.handleLayersRemove_, this)
    );

    for (const id in this.listenerKeys_) {
      this.listenerKeys_[id].forEach(unlistenByKey);
    }
    clear(this.listenerKeys_);

    const layersArray = layers.getArray();
    for (let i = 0, ii = layersArray.length; i < ii; i++) {
      const layer = layersArray[i];
      this.listenerKeys_[getUid(layer)] = [
        listen(layer, ObjectEventType.PROPERTYCHANGE, this.handleLayerChange_, this),
        listen(layer, EventType.CHANGE, this.handleLayerChange_, this)
      ];
    }

    this.changed();
  }

  /**
   * @param {import("../Collection.js").CollectionEvent} collectionEvent CollectionEvent.
   * @private
   */
  handleLayersAdd_(collectionEvent) {
    const layer = /** @type {import("./Base.js").default} */ (collectionEvent.element);
    this.listenerKeys_[getUid(layer)] = [
      listen(layer, ObjectEventType.PROPERTYCHANGE, this.handleLayerChange_, this),
      listen(layer, EventType.CHANGE, this.handleLayerChange_, this)
    ];
    this.changed();
  }

  /**
   * @param {import("../Collection.js").CollectionEvent} collectionEvent CollectionEvent.
   * @private
   */
  handleLayersRemove_(collectionEvent) {
    const layer = /** @type {import("./Base.js").default} */ (collectionEvent.element);
    const key = getUid(layer);
    this.listenerKeys_[key].forEach(unlistenByKey);
    delete this.listenerKeys_[key];
    this.changed();
  }

  /**
   * Returns the {@link module:ol/Collection collection} of {@link module:ol/layer/Layer~Layer layers}
   * in this group.
   * @return {!import("../Collection.js").default<import("./Base.js").default>} Collection of
   *   {@link module:ol/layer/Base layers} that are part of this group.
   * @observable
   * @api
   */
  getLayers() {
    return /** @type {!import("../Collection.js").default<import("./Base.js").default>} */ (this.get(Property.LAYERS));
  }

  /**
   * Set the {@link module:ol/Collection collection} of {@link module:ol/layer/Layer~Layer layers}
   * in this group.
   * @param {!import("../Collection.js").default<import("./Base.js").default>} layers Collection of
   *   {@link module:ol/layer/Base layers} that are part of this group.
   * @observable
   * @api
   */
  setLayers(layers) {
    this.set(Property.LAYERS, layers);
  }

  /**
   * @inheritDoc
   */
  getLayersArray(opt_array) {
    const array = opt_array !== undefined ? opt_array : [];
    this.getLayers().forEach(function(layer) {
      layer.getLayersArray(array);
    });
    return array;
  }

  /**
   * @inheritDoc
   */
  getLayerStatesArray(opt_states) {
    const states = opt_states !== undefined ? opt_states : [];

    const pos = states.length;

    this.getLayers().forEach(function(layer) {
      layer.getLayerStatesArray(states);
    });

    const ownLayerState = this.getLayerState();
    for (let i = pos, ii = states.length; i < ii; i++) {
      const layerState = states[i];
      layerState.opacity *= ownLayerState.opacity;
      layerState.visible = layerState.visible && ownLayerState.visible;
      layerState.maxResolution = Math.min(layerState.maxResolution, ownLayerState.maxResolution);
      layerState.minResolution = Math.max(layerState.minResolution, ownLayerState.minResolution);
      if (ownLayerState.extent !== undefined) {
        if (layerState.extent !== undefined) {
          layerState.extent = getIntersection(layerState.extent, ownLayerState.extent);
        } else {
          layerState.extent = ownLayerState.extent;
        }
      }
    }

    return states;
  }

  /**
   * @inheritDoc
   */
  getSourceState() {
    return SourceState.READY;
  }
}

export default LayerGroup;
