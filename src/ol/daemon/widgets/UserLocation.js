/**
 * @module ol/daemon/widgets/UserLocationWidget
 */
import Widget from "./Widget";
import Feature from "../../Feature";
import { createFeatureStyle } from "../styles";
import Point from "../../geom/Point";
import { transform } from "../../proj";

/**
 * @typedef UserLocationOptions
 * @property {PositionOptions} [positionOptions] - options for geolocation
 * @property {String} [myLocationTitle='My location'] - button title
 * @property {String} [zoomToTitle='Zoom to'] - button title
 * @property {import('../styles/defaultStyle').StyleType} [style] - icon style
 * @property {import('../helpers/flashingOptions').default} [flash] - flashing options
 */

/**
 * @typedef PositionOptions
 * @property {Boolean} [enableHighAccuracy=true] - indicates the application
 * would like to receive the best possible results.
 * @property {Number} [timeout=15000] - maximum length of time in milliseconds
 * for returning result.
 * @property {Number} [maximumAge=0] - maximum age in milliseconds of possible
 * cached position.
 */

/**
 * @type {UserLocationOptions}
 */
const defaultOptions = {
  positionOptions: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  },
  myLocationTitle: "My Location",
  zoomToTitle: "Zoom to",
  style: {
    circle: {
      radius: 10,
      fill: { color: "#FFFF00" },
      stroke: {
        color: "#1589FF",
        width: 5
      }
    }
  },
  flash: {
    duration: 1000,
    radius: 5,
    red: 0,
    green: 255,
    blue: 0
  }
};

export default class UserLocationWidget extends Widget {
  /**
   *
   * @param {UserLocationOptions} options
   */
  constructor(options) {
    // @ts-ignore
    super(options);

    /**
     * is the control active
     * @private
     * @type {Boolean}
     */
    this._watching = false;
    /**
     * geolocation watcher
     * @private
     * @type {Number}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
     */
    this._watchId = null;
    this._flash = Object.assign({}, defaultOptions.flash, options.flash);
    /**
     * user location's map marker
     * @private
     * @type {Feature}
     */
    this._userLocation = new Feature();
    this._userLocation.setGeometry(new Point([0, 0]));
    this._userLocation.setStyle(
      createFeatureStyle(Object.assign({}, defaultOptions.style, options.style))
    );
    /**
     * position options
     * @private
     * @type {PositionOptions}
     */
    this._positionOptions = Object.assign(
      {},
      defaultOptions,
      options.positionOptions
    );
  }

  /**
   * Activates UserLocation Widget.
   */
  activate() {
    if (navigator.geolocation) {
      if (this._watching) {
        this._clearWatch();
      } else {
        this._addWatch();
      }

      this.active = true;
    }
  }

  /**
   * Deactivates UserLocation Widget.
   */
  deactivate() {
    this._clearWatch();
    this.active = false;
  }

  /**
   * is the control currently active
   * @public
   * @readonly
   * @type {Boolean}
   */
  get watching() {
    return this._watching;
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
  }

  _addWatch() {
    // @ts-ignore
    this.map.defaultLayer.addFeature(this._userLocation);

    this._watchId = navigator.geolocation.watchPosition(
      location => {
        this._showPosition(location);
      },
      error => {
        console.error("(" + error.code + "): " + error.message);
      },
      this._positionOptions
    );

    this._timeout = setInterval(() => {
      this._flashLocation();
    }, 2000);
    this._watching = true;
  }

  _clearWatch() {
    // @ts-ignore
    this.map.defaultLayer.removeFeature(this._userLocation);
    navigator.geolocation.clearWatch(this._watchId);

    clearTimeout(this._timeout);
    this._watching = false;
  }

  /**
   * update user location on the map - {@link UserLocationClass._userLocation}
   * @private
   * @param {Object.<String,*>} location
   */
  _showPosition(location) {
    const pnt = transform(
      [location.coords.longitude, location.coords.latitude],
      "EPSG:4326",
      this.map.projection
    );

    this._userLocation.setGeometry(new Point(pnt));
    if (this._flash) this._flashLocation();

    this.emit("locationchanged", this._userLocation, location);
  }

  /**
   * flash user locaiton on the map
   * @private
   */
  _flashLocation() {
    this._userLocation.flash(this._flash);
  }
}
