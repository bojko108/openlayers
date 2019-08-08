/**
 * @module ol/daemon/widgets/BookmarksWidget
 */
import Widget from './Widget';
import MapEventType from '../../MapEventType';

/**
 * @typedef MapViewType
 * @property {Number} zoom
 * @property {Array<Number>} center
 * @property {Number} rotation
 */

/**
 * @classdesc
 *
 * @extends {Widget}
 */
export default class BookmarksWidget extends Widget {
  /**
   * Creates a new Bookmarks Widget
   * @param {import('./Widget').WidgetConfig} options
   */
  constructor(options) {
    /**
     * @param {import('../../MapEvent').default} event
     */
    options.handler = event => this.__handleMapEvent(event);
    options.mapEventType = MapEventType.MOVEEND;
    super(options);

    /**
     * true if the view is changed by the user, false if changed by this widget
     * @private
     * @type {Boolean}
     */
    this._moved = true;

    /**
     * List of previous map views
     * @private
     * @type {Array<MapViewType>}
     */
    this._views = [];
    /**
     * Current map view index, default is -1
     * @private
     * @type {Number}
     */
    this._curViewIndex = -1;
  }

  /**
   * Activates Bookmarks Widget.
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivates Bookmarks Widget.
   */
  deactivate() {
    this.active = false;
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
  }

  /**
   * If the user can navigate forward between the views
   * @type {Boolean}
   */
  get canGoForward() {
    return this._views.length > 1 && this._curViewIndex < this._views.length - 1;
  }
  /**
   * If the user can navigate backward between the views
   * @type {Boolean}
   */
  get canGoBackward() {
    return this._views.length > 1 && this._curViewIndex > 0;
  }

  /**
   * Go to previous map extent
   */
  previousExtent() {
    if (this._views[this._curViewIndex - 1]) {
      this.map.getView().setZoom(this._views[this._curViewIndex - 1].zoom);
      this.map.getView().setCenter(this._views[this._curViewIndex - 1].center);
      this.map.getView().setRotation(this._views[this._curViewIndex - 1].rotation);
      this._curViewIndex--;
      this._moved = false;
    }
  }
  /**
   * Go to next map extent
   */
  nextExtent() {
    if (this._views[this._curViewIndex + 1]) {
      this.map.getView().setZoom(this._views[this._curViewIndex + 1].zoom);
      this.map.getView().setCenter(this._views[this._curViewIndex + 1].center);
      this.map.getView().setRotation(this._views[this._curViewIndex + 1].rotation);
      this._curViewIndex++;
      this._moved = false;
    }
  }
  /**
   * Go to initial map extent
   */
  initialExtent() {
    if (this._views[0]) {
      this.map.getView().setZoom(this._views[0].zoom);
      this.map.getView().setCenter(this._views[0].center);
      this.map.getView().setRotation(this._views[0].rotation);
      this._curViewIndex = 0;
      this._moved = false;
    }
  }

  /**
   * This method is called when `mapEventType` is triggered
   * @private
   * @param {import('../../MapEvent').default} event
   */
  __handleMapEvent(event) {
    if (this._moved) {
      // trim next views when the user moves the map
      this._views = this._views.slice(0, this._curViewIndex + 1);
      // save current map extent
      this._views.push({
        zoom: event.map.getView().getZoom(),
        center: event.map.getView().getCenter(),
        rotation: event.map.getView().getRotation()
      });
      this._curViewIndex++;
    }
    this._moved = true;
  }
}
