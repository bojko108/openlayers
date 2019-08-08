/**
 * @module ol/daemon/widgets/Widget
 */
import EventEmitter from '../emitter';
import { unByKey } from '../../Observable';

/**
 * @typedef WidgetConfig
 * @property {String} name
 * @property {Boolean} [active]
 * @property {import('../../Map').default} [map]
 * @property {String} [mapEventType] according to `MapBrowserEventType` or `MapEventType`
 * @property {Number} [hitTolerance] hit-detection tolerance in pixels
 * @property {Boolean} [addToSelection] if `true` selection will be extended
 * and not cleared on new features
 * @property {Function} [handler] - function executed when `options.mapEventType` is triggered
 */

/**
 * @classdesc
 * Base Widget class for craeting new map interactions.
 *
 * @extends {EventEmitter}
 */
export default class Widget extends EventEmitter {
  /**
   * @param {WidgetConfig} options
   */
  constructor(options) {
    super();

    /**
     * @private
     * @type {import('../../events').EventsKey|Array<import('../../events').EventsKey>}
     */
    this._listenerKey = undefined;
    /**
     * @private
     * @type {Function}
     */
    this._handler = options.handler;
    /**
     * @private
     * @type {Boolean}
     */
    this._active = options.active;
    /**
     * @private
     * @type {String}
     */
    this._mapEventType = options.mapEventType;
    /**
     * @private
     * @type {import('../../Map').default}
     */
    this._map = undefined;

    if (options.map) {
      this.map = options.map;
    }
  }

  /**
   * Activate this widget. Before activating the widget you must set `map` property.
   * @param {Boolean} active
   */
  set active(active) {
    if (!this.map) throw '"map" is undefined. Call "widget.setMap()" before activating this widget';
    this._active = active;
  }
  /**
   * Is this widget active
   * @return {Boolean}
   */
  get active() {
    return this._active;
  }

  /**
   * Set widget's map
   * @param {import('../../Map').default} map
   */
  set map(map) {
    this._map = map;
    if (this._mapEventType) {
      this.mapEventType = this._mapEventType;
    }
  }
  /**
   * Get widget's map
   * @return {import('../../Map').default} map
   */
  get map() {
    return this._map;
  }

  /**
   * Set map event type to listen to
   * @param {String} mapEventType - according to `MapBrowserEventType` or `MapEventType`
   */
  set mapEventType(mapEventType) {
    if (this._listenerKey) {
      unByKey(this._listenerKey);
    }

    this._mapEventType = mapEventType;

    this._listenerKey = this._map.on(this.mapEventType, event => {
      if (this.active) {
        this._handler(event);
      }
    });
  }
  /**
   * Get map event type to listen to
   * @return {String} according to `MapBrowserEventType` or `MapEventType`
   */
  get mapEventType() {
    return this._mapEventType;
  }
}
