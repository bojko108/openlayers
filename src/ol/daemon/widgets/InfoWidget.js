/**
 * @module ol/daemon/widgets/UserLocationWidget
 */
import Widget from "./Widget";
import Feature from "../../Feature";
import { createFeatureStyle } from "../styles";
import Point from "../../geom/Point";
import Overlay from "../../Overlay";

/**
 * @typedef InfoOptions
 * @property {Boolean} [autoPan] - if true the map is panned so the info window
 * is entirely visible in current viewport
 * @property {Number} [animationDuration=250] - animation duration in miliseconds
 * @see http://openlayers.org/en/latest/apidoc/ol.Overlay.html
 */

/**
 * @type {InfoOptions}
 */
const defaultOptions = {
  animationDuration: 250,
  autoPan: true
};

export default class InfoWidget extends Widget {
  /**
   *
   * @param {InfoOptions} options
   */
  constructor(options) {
    // @ts-ignore
    super(options);

    options = Object.assign({}, defaultOptions, options);

    /**
     * info window container
     * @private
     * @type {HTMLElement}
     */
    this._container = document.createElement("div");
    this._container.className = "ol-popup";

    /**
     * close button
     * @private
     * @type {HTMLElement}
     */
    this._closer = document.createElement("a");
    this._closer.className = "ol-popup-closer";
    // @ts-ignore
    this._closer.href = "#";

    this._container.appendChild(this._closer);

    this._closer.onclick = e => {
      this.hide();
      //this._container.style.display = 'none';
      //this._closer.blur();
      e.preventDefault();
    };

    /**
     * info window content
     * @private
     * @type {HTMLElement}
     */
    this._content = document.createElement("div");
    this._content.className = "ol-popup-content";

    this._container.appendChild(this._content);

    // Enable scrolling of content div on touch devices
    this._enableTouchScroll(this._content);

    /**
     * info window overlay
     * @public
     * @type {Overlay}
     * @see http://openlayers.org/en/latest/apidoc/ol.Overlay.html
     */
    this.overlay = new Overlay({
      element: this._container,
      autoPan: options.autoPan,
      autoPanAnimation: { duration: options.animationDuration }
    });
  }

  /**
   * Activates UserLocation Widget.
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivates UserLocation Widget.
   */
  deactivate() {
    this.active = false;
  }

  /**
   * determine if the info window is opened
   * @public
   * @type {Boolean}
   */
  get isOpened() {
    return this._container.style.display === "block";
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
    this.map.addOverlay(this.overlay);
  }

  /**
   * show the info window
   * @public
   * @param {import("../../coordinate").Coordinate} coord - info window position in map coordinates
   * @param {!String|HTMLElement} html - info window content - it can be string or
   * template string with HTML markup
   * @param {Boolean} [autoHide=false] - hide close button or not, default is false
   * (can be used to show the info window on hover feature only)
   * @return {undefined}
   * @example
   * // show an info window
   * info.show(position, content)
   *
   * // show info window when hover over a feature: set autoHide to 'true' so the
   * // info window can closed when the mouse is no longer hovering the feature
   * info.show(position, text, true)
   */
  show(coord, html, autoHide = false) {
    if (!this._active) return;

    if (html instanceof HTMLElement) {
      this._content.innerHTML = "";
      this._content.appendChild(html);
    } else {
      this._content.innerHTML = html;
    }

    this._container.getElementsByClassName(
      "ol-popup-closer"
      // @ts-ignore
    )[0].style.display = autoHide ? "none" : "inline";

    this._container.style.display = "block";
    this._content.scrollTop = 0;
    this.overlay.setPosition(coord);
    this.overlay.setElement(this._container);
  }
  /**
   * hide info window
   * @public
   */
  hide() {
    this._container.style.display = "none";
  }
  /**
   * determine if the curent browser supports touch events
   * @private
   * @return {Boolean}
   */
  _isTouchDevice() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Enable scrolling of content div on touch devices
   * @private
   * @param {!HTMLElement} element
   */
  _enableTouchScroll(element) {
    if (this._isTouchDevice()) {
      let scrollStartPos = 0;
      element.addEventListener(
        "touchstart",
        function(event) {
          scrollStartPos = this.scrollTop + event.touches[0].pageY;
        },
        false
      );
      element.addEventListener(
        "touchmove",
        function(event) {
          this.scrollTop = scrollStartPos - event.touches[0].pageY;
        },
        false
      );
    }
  }
}
