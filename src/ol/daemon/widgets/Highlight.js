/**
 * @module ol/daemon/widgets/HighlightWidget
 */
import Widget from './Widget';
import MapBrowserEventType from '../../MapBrowserEventType';

/**
 * @classdesc
 * Highlight widget can be used to highlight features on the map.
 *
 * @extends {Widget}
 */
export default class HighlightWidget extends Widget {
  /**
   * Creates a new Highlight Widget
   * @param {Object} options
   */
  constructor(options = {}) {
    /**
     * @param {import('../../MapBrowserEventType')} event
     */
    // @ts-ignore
    options.handler = event => this.__handleMapEvent(event);
    options.mapEventType = options.mapEventType || MapBrowserEventType.POINTERMOVE;
    super(options);

    /**
     * hit-detection tolerance in pixelss
     * @type {Number}
     */
    this._hitTolerance = 5;

    this._highlighted = [];
  }

  /**
   * Activates Highlight Widget.
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivates Highlight Widget.
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
   * This method is called when `mapEventType` is triggered
   * @private
   * @param {import('../../MapBrowserEvent').default} event
   */
  __handleMapEvent(event) {
    let features = [];
    this.map.forEachFeatureAtPixel(
      event.pixel,
      feature => {
        features.push(feature);
      },
      {
        layerFilter: layer => layer.layerInfo.selectable,
        hitTolerance: this._hitTolerance
      }
    );

    this._highlighted.forEach(feature => feature.setHighlighted(false));
    this._highlighted = features;
    this._highlighted.forEach(feature => feature.setHighlighted(true));

    if (this._highlighted.length > 0) {
      event.stopPropagation();
    }
  }
}
