/**
 * @module ol/daemon/widgets/EditorWidget
 */
import Widget from './Widget';
import Collection from '../../Collection';
import Draw from '../../interaction/Draw';
import Modify from '../../interaction/Modify';
import Snap from '../../interaction/Snap';
import Translate from '../../interaction/Translate';
import { Edit, EnumEditType } from '../edits';

/**
 * Constants for editor event types.
 * @enum {String}
 */
export const EditorEventType = {
  /**
   * Emitted when a new feature is created
   */
  FEATURE_CREATED: 'featureCreated',
  /**
   * Emitted when a new feature is updated
   */
  FEATURE_UPDATED: 'featureUpdated',
  /**
   * Emitted when a new feature is deleted
   */
  FEATURE_DELETED: 'featureDeleted'
};

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
     * @type {Array<Array<Edit>>}
     */
    this._currentEdits = [];
    /**
     * current edit index: default is `-1`
     * @private
     * @type {Number}
     */
    this._editIndex = -1;

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

    this.on(EditorEventType.FEATURE_CREATED, feature => {
      // @ts-ignore
      const edit = new Edit(feature.getId(), feature.layer, EnumEditType.CREATE, undefined, feature.getProperties());
      this.currentEditOperation.push(edit);
    });
  }

  /**
   * Activates Editor Widget.
   */
  activate() {
    this.active = true;
    this._isEditing = true;
    this._currentEdits = [];
  }

  /**
   * Deactivates Editor Widget.
   */
  deactivate() {
    this.stopOperation();
    this._isEditing = false;
    this.active = false;
  }

  /**
   * start an editing operation
   */
  startOperation() {
    this._editIndex++;

    // insert a new edit in edits array: when the user undo some edits
    // and then make new ones
    this._currentEdits.splice(this._editIndex, 0, []);

    // trim all edits after this one: when the user undo some edits
    // and then make new ones
    this._currentEdits.length = this._editIndex + 1;

    // this._displayPopups = this.map.displayPopups;
    // this.map.displayPopups = false;
  }
  /**
   * stop editing
   * @param {Boolean} [saveEdits=true]
   */
  stopOperation(saveEdits = true) {
    // TODO: save edits

    this._deactivateSnap();
    this._deactivateDraw();
    this._deactivateModify();
    this._deactivateMove();

    // this.map.displayPopups = this._displayPopups;
  }

  /**
   * @type {Array<Edit>}
   */
  get currentEditOperation() {
    return this._currentEdits[this._editIndex];
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
    if (this._currentEdits.length < 1) {
      return false;
    } else {
      return this._editIndex > -1;
    }
  }
  get canRedo() {
    if (this._currentEdits.length < 1) {
      return false;
    } else {
      return this._editIndex < this._currentEdits.length - 1;
    }
  }

  /**
   * undo the last edit operation {@link Edits}
   */
  async undo() {
    if (this.isEditing) {
      if (this._draw && this._draw.getActive()) {
        this._draw.removeLastPoint();
      } else {
        if (this.canUndo) {
          for (let i = 0; i < this.currentEditOperation.length; i++) {
            const edit = this.currentEditOperation[i];
            let feature;
            switch (edit.editType) {
              case EnumEditType.CREATE:
                console.log(`undo create: delete feature - ${edit.fid}`);
                feature = await edit.layer.getFeatureById(edit.fid);
                edit.layer.removeFeature(feature);
                break;
              case EnumEditType.UPDATE:
                console.log('undo update: get edit.oldState and restore it');
                feature = await edit.layer.getFeatureById(edit.fid);
                feature.setProperties(edit.oldState.getProperties());
                break;
              case EnumEditType.DELETE:
                console.log(`undo delete: create feature - ${edit.fid}`);
                edit.layer.addFeature(edit.oldState);
                break;
            }
          }

          this._editIndex--;
        } else {
          console.log('undefined undo');
        }
      }
    }
  }

  /**
   * redo the last edit operation for {@link Edits}
   */
  async redo() {
    if (this.isEditing) {
      if (this.canRedo) {
        this._editIndex++;

        for (let i = 0; i < this.currentEditOperation.length; i++) {
          const edit = this.currentEditOperation[i];
          let feature;
          switch (edit.editType) {
            case EnumEditType.CREATE:
              console.log(`redo create: create feature - ${edit.fid}`);
              edit.layer.addFeature(edit.newState);
              break;
            case EnumEditType.UPDATE:
              console.log('redo update: get edit.newState and restore it');
              feature = await edit.layer.getFeatureById(edit.fid);
              feature.setProperties(edit.newState.getProperties());
              break;
            case EnumEditType.DELETE:
              console.log(`redo delete: delete feature - ${edit.fid}`);
              feature = await edit.layer.getFeatureById(edit.fid);
              edit.layer.removeFeature(feature);
              break;
          }
        }
      } else {
        console.log('undefined redo');
      }
    }
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
  }

  //-------------------------------------------------------------------------------------------

  /**
   *
   * @param {import('../../layer/Vector').default} layer
   * @param {Boolean} [snapping=false]
   * @param {function(import('../../Feature').default):void} callbak
   * @param {String} [geometryType] - type of geometry to draw. This value gets precedence over
   * `layer.layerInfo`. If both are undefined `Point` will be used.
   */
  createFeature(layer, snapping, callbak, geometryType) {
    if (!this.isEditing) {
      throw 'Not in editing session!';
    }

    this.startOperation();

    if (this._draw) {
      this._deactivateDraw();
    }

    this._draw = new Draw({
      stopClick: true,
      source: layer.getSource(),
      type: geometryType ? geometryType : layer.layerInfo ? layer.layerInfo.geometryType : EnumGeometryType.POINT
    });

    this.map.addInteraction(this._draw);

    if (snapping) {
      this._activateSnap();
    }

    this._draw.on('drawend', event => {
      let feature = event.feature;
      layer.layerInfo.createDefaultProperties(feature);

      // probably this can be moved to: layer.getSource().on('addfeature')...
      feature.setId(layer.layerInfo.createObjectId());
      layer.addFeature(feature);

      this.emit(EditorEventType.FEATURE_CREATED, feature);

      this.stopOperation();

      callbak(feature);
    });
  }

  //-------------------------------------------------------------------------------------------

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
