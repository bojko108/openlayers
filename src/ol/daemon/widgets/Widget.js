import MapBrowserEventType from '../../MapBrowserEventType';
import EventEmitter from '../emitter';

export default class Widget extends EventEmitter {
  constructor(options) {
    super();
    this._handler = options.handler;
    this._active = options.active;
    this._mapEventType = options.mapEventType || MapBrowserEventType.SINGLECLICK;
    this._map = undefined;

    if (options.map) {
      this.map = options.map;
    }
  }

  /**
   * Activate this widget
   * @param {Boolean} active
   */
  set active(active) {
    if (!this.map) throw '"map" is undefined. Call "widget.setMap()" before activating this widget';
    this._active = active;
  }
  /**
   * Is the widget active
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
    this._map.on(this.mapEventType, event => {
      if (this.active) {
        this._handler(event);
      }
    });
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
   * @param {MapBrowserEventType} mapEventType
   */
  set mapEventType(mapEventType) {
    this._mapEventType = mapEventType;
  }
  /**
   * Get map event type to listen to
   * @return {MapBrowserEventType}
   */
  get mapEventType() {
    return this._mapEventType;
  }
}
