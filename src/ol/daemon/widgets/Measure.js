/**
 * @module ol/daemon/widgets/MeasureWidget
 */
import Widget from './Widget';
import MapBrowserEventType from '../../MapBrowserEventType';
import Draw from '../../interaction/Draw';
import Snap from '../../interaction/Snap';
import { createFeatureStyle, createLabelStyle } from '../styles';
import Style from '../../style/Style';
import Collection from '../../Collection';
import VectorSource from '../../source/Vector';
import { EnumGeometryType } from './Editor';
import { createOperationalLayer } from '../layers';

/**
 * Constants for measure event types.
 * @enum {String}
 */
export const MeasureEventType = {
  /**
   * Emitted when a new feature is created
   */
  DISTANCE: 'distance',
  /**
   * Emitted when a new feature is updated
   */
  AREA: 'area',
  /**
   * Emitted when a new feature is deleted
   */
  POINT: 'point'
};

/**
 * @classdesc
 * Measure widget can be used to measure lengths, areas or distances on the map.
 *
 * @extends {Widget}
 */
export default class MeasureWidget extends Widget {
  /**
   * Creates a new Measure Widget
   * @param {import('./Widget').WidgetConfig} options
   */
  constructor(options) {
    super(options);

    /**
     * snap interaction
     * @private
     * @type {Snap}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.Snap.html
     */
    this._snap = null;
    /**
     * draw interaction
     * @private
     * @type {Draw}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.Draw.html
     */
    this._draw = null;

    this._measureStyle = createFeatureStyle({
      fill: { color: '#ff4136' },
      stroke: { color: '#ff4136', width: 4, lineDash: [10, 10] },
      circle: { radius: 4, fill: { color: '#ff4136' }, stroke: { color: '#ff4136', width: 3 } }
    });

    this._backgroundLine = createFeatureStyle({
      stroke: { color: '#ffffff', width: 6 }
    });
    this._featureStyle = createFeatureStyle({
      fill: { color: '#0074d9' },
      stroke: { color: '#0074d9', width: 4, lineDash: [10, 10] },
      circle: { radius: 4, fill: { color: '#7fdbff' }, stroke: { color: '#0074d9', width: 2 } }
    });

    this._labelStyle = new Style({
      text: createLabelStyle({
        text: '',
        textBaseline: 'middle',
        placement: 'point',
        font: '15px sans-serif',
        fill: { color: '#000000' },
        stroke: { color: '#ffffff', width: 5 }
      })
    });

    /**
     * @type {import('../../layer/Vector').default}
     */
    // @ts-ignore
    this._measureLayer = createOperationalLayer({
      metadata: { name: 'measureLayer' }
    });
    this._measureLayer.setStyle([this._backgroundLine, this._featureStyle, this._labelStyle]);

    if (options.map) {
      // @ts-ignore
      this._measureLayer.setMap(this.map);
    }
  }

  /**
   * Measure distance
   */
  distance(units, snapping) {
    this.active = true;

    if (this._draw) {
      this._deactivateDraw();
    }

    this._draw = new Draw({
      stopClick: true,
      source: this._measureLayer.getSource(),
      type: EnumGeometryType.LINESTRING,
      style: (feature, resolution) => {
        let styles = [this._backgroundLine, this._measureStyle];
        if (feature.getGeometry().getType() === EnumGeometryType.LINESTRING) {
          const text = feature
            .getGeometry()
            .getLength()
            .toString();

          this._labelStyle.getText().setText(text);
          styles.push(this._labelStyle);
        }
        return styles;
      }
    });

    this._draw.on('drawend', event => {
      setTimeout(() => {
        this.deactivate();
      }, 100);
    });

    this.map.addInteraction(this._draw);

    if (snapping) {
      this._activateSnap();
    }
  }

  /**
   * Deactivates Highlight Widget.
   */
  deactivate() {
    this.active = false;
    this._deactivateDraw();
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
    // @ts-ignore
    this._measureLayer.setMap(this.map);
  }

  /**
   * deactivate draw interaction
   */
  _deactivateDraw() {
    this.map.removeInteraction(this._snap);
    this._snap = null;
    this.map.removeInteraction(this._draw);
    this._draw = null;
  }
  _activateSnap() {
    let snappingFeatures = new Collection();
    this.map.snappableLayers
      .filter(layer => layer.getVisible())
      .forEach(layer => {
        // @ts-ignore
        const ftrs = layer.getFeatures();
        ftrs.forEach(f => {
          snappingFeatures.push(f);
        });
      });
    this._snap = new Snap({
      features: snappingFeatures
    });
    this.map.addInteraction(this._snap);
  }
  _deactivateSnap() {
    this.map.removeInteraction(this._snap);
    this._snap = null;
  }
}
