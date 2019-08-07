/**
 * @module ol/daemon/widgets/Widget
 */
import MapBrowserEventType from '../../MapBrowserEventType';
import EventEmitter from '../emitter';
import { unByKey } from '../../Observable';

/**
 * @typedef WidgetConfig
 * @property {String} name
 * @property {Boolean} [active]
 * @property {import('../../Map').default} [map]
 * @property {Number} [hitTolerance]
 * @property {Boolean} [addToSelection]
 */

/**
 * @classdesc
 * Base Widget class for craeting new map interactions.
 *
 * @extends {EventEmitter}
 */
export default class Widget extends EventEmitter {
  /**
   * @param {Object} options
   * @param {Boolean} [options.active] is the widget active by default or not
   * @param {String} [options.mapEventType='singleclick'] according to `MapBrowserEventType`
   * @param {import('../../Map').default} [options.map]
   * @param {Function} options.handler - function executed when `options.mapEventType` is triggered
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
    this._mapEventType = options.mapEventType || MapBrowserEventType.SINGLECLICK;
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
    this.mapEventType = this._mapEventType;
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
   * @param {String} mapEventType - according to `MapBrowserEventType`
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
   * @return {String} according to `MapBrowserEventType`
   */
  get mapEventType() {
    return this._mapEventType;
  }
}
