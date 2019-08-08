/**
 * @module ol/daemon/widgets/EditorWidget
 */
import Widget from './Widget';
import Collection from '../../Collection';
import Draw from '../../interaction/Draw';
import Modify from '../../interaction/Modify';
import Snap from '../../interaction/Snap';
import Translate from '../../interaction/Translate';
import { Edits } from '../edits';

/**
 * type of geometry
 * @enum {String}
 */
export const EnumGeometryType = Object.freeze({
  esriGeometryPoint: 'esriGeometryPoint',
  esriGeometryMultipoint: 'esriGeometryMultipoint',
  esriGeometryPolyline: 'esriGeometryPolyline',
  esriGeometryPolygon: 'esriGeometryPolygon',
  esriGeometryEnvelope: 'esriGeometryEnvelope',
  POINT: 'Point',
  LINESTRING: 'LineString',
  POLYGON: 'Polygon',
  CIRCLE: 'Circle'
});

/**
 * @classdesc
 *
 * @extends {Widget}
 */
export default class EditorWidget extends Widget {
  /**
   * Creates a new Editor Widget
   * @param {import('./Widget').WidgetConfig} options
   */
  constructor(options) {
    super(options);

    /**
     * is the editor in editing state
     * @private
     * @type {Boolean}
     */
    this._isEditing = false;

    /**
     * reference to current edit operations
     * @private
     * @type {import('../edits/Edits').default}
     */
    this._currentEdits;

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
    /**
     * modify interaction
     * @private
     * @type {Modify}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.Modify.html
     */
    this._modify = null;
    /**
     * translate interaction
     * @private
     * @type {Translate}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.Translate.html
     */
    this._translate = null;

    /**
     * to save map.displayPopups and restore it later
     * @type {Boolean}
     */
    this._displayPopups = false;
  }

  /**
   * Activates Editor Widget.
   */
  activate() {
    this.active = true;
    this._startOperation();
  }

  /**
   * Deactivates Editor Widget.
   */
  deactivate() {
    this.active = false;
    this._stopOperation();
  }

  /**
   * is the tool active
   * @public
   * @readonly
   * @return {Boolean}
   */
  get isEditing() {
    return this._isEditing;
  }
  get canUndo() {
    return this._currentEdits.canUndo;
  }
  get canRedo() {
    return this._currentEdits.canRedo;
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
  }

  //-------------------------------------------------------------------------------------------

  drawFeatureIn(layer, snapping = true) {
    if (this._draw) {
      this._deactivateDraw();
    }

    this._draw = new Draw({
      stopClick: true,
      source: layer.getSource(),
      type: layer.layerInfo ? layer.layerInfo.geometryType : EnumGeometryType.POINT
    });

    if (snapping) {
      this._activateSnap();
    }

    this._draw.on('drawend', event => {
      this._deactivateDraw();

      let feature = event.feature;
      feature.setId(layer.getOn)
    });
  }
  //-------------------------------------------------------------------------------------------

  /**
   * start editing
   */
  _startOperation() {
    this._isEditing = true;
    // this._currentEdits.push(new Edits()) ...
    // this._currentEdits will contain an array of edit operations
    this._currentEdits = new Edits();

    // this._displayPopups = this.map.displayPopups;
    // this.map.displayPopups = false;
  }
  /**
   * stop editing
   * @param {Boolean} [saveEdits=true]
   */
  _stopOperation(saveEdits = true) {
    // TODO: save edits

    this._isEditing = false;

    this._deactivateSnap();
    this._deactivateDraw();
    this._deactivateModify();
    this._deactivateMove();

    // this.map.displayPopups = this._displayPopups;
  }

  _activateSnap() {
    // // TODO: listen for changes in map extent
    // let snappingFeatures = new olCollection();
    // let layers = this._mapp.getVisibleLayers(false).filter(layer => layer.layerInfo.snappable);
    // let extent = this._mapp.getView().calculateExtent();
    // layers.forEach(layer => {
    //     let ftrs = layer.getSource().getFeaturesInExtent(extent);
    //     ftrs.forEach(f => { snappingFeatures.push(f); });
    // });
    // this._snap = new olInteractionSnap({
    //     features: snappingFeatures
    // });

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
  /**
   * deactivate draw interaction
   */
  _deactivateDraw() {
    this.map.removeInteraction(this._snap);
    this._snap = null;
    this.map.removeInteraction(this._draw);
    this._draw = null;
  }
  /**
   * deactivate modify interaction
   */
  _deactivateModify() {
    this.map.removeInteraction(this._snap);
    this._snap = null;
    this.map.removeInteraction(this._modify);
    this._modify = null;
  }
  /**
   * deactivate move interaction
   */
  _deactivateMove() {
    this.map.removeInteraction(this._snap);
    this._snap = null;
    this.map.removeInteraction(this._move);
    this._move = null;
  }
}
