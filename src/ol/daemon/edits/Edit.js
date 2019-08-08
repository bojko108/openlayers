import Feature from '../../Feature';

/**
 * enum for type of edit operation
 * @enum {String}
 */
export const EnumEditType = Object.freeze({
  /**
   * create a new feature
   */
  CREATE: 'create',
  /**
   * update an existing feature
   */
  UPDATE: 'update',
  /**
   * delete an existing feature
   */
  DELETE: 'delete'
});

/**
 * @classdesc
 *
 * Class for managing individual edits
 * TODO: extend this to group more edits in a single operation
 */
export default class Edit {
  /**
   * Creates an instance of Edit
   *
   * @param {String} fid - feature ID this edit operation applies to
   * @param {import('../../layer/Vector').default} layer - the layer this edit belongs to
   * @param {EnumEditType} editType - type of edit operation
   * @param {Object} oldState - feature properties: geometry and attributes, before edit operation
   * @param {Object} newState - feature properties: geometry and attributes, after edit operation
   */
  constructor(fid, layer, editType, oldState, newState) {
    /**
     * feature ID this edit operation applies to
     * @type {String}
     */
    this._fid = fid;
    /**
     * the layer this edit belongs to
     * @type {import('../../layer/Vector').default}
     */
    this._layer = layer;
    /**
     * type of edit operation
     * @type {EnumEditType}
     */
    this._editType = editType;
    /**
     * feature properties: geometry and attributes, before the edit operation has begain
     * @type {Object}
     */
    this._oldState = {};
    /**
     * feature properties: geometry and attributes, after the edit operation has finished
     * @type {Object}
     */
    this._newState = {};

    this.oldState = oldState || {};
    this.newState = newState || {};
  }

  get fid() {
    return this._fid;
  }

  get layer() {
    return this._layer;
  }
  set layer(layer) {
    this._layer = layer;
  }

  get editType() {
    return this._editType;
  }
  set editType(editType) {
    this._editType = editType;
  }

  get oldState() {
    return this._create(this._oldState);
  }
  set oldState(properties) {
    this._oldState = this._clone(properties);
  }

  get newState() {
    return this._create(this._newState);
  }
  set newState(properties) {
    this._newState = this._clone(properties);
  }

  /**
   * create a new feature
   * @private
   * @param {Object.<String,*>} [properties]
   * @return {Feature|undefined}
   */
  _create(properties) {
    let newFeature = new Feature(properties);
    newFeature.setId(this.fid);
    return newFeature;
  }

  _clone(properties) {
    const clonedProperties = {};
    Object.keys(properties).forEach(property => {
      clonedProperties[property] = property === 'geometry' ? properties[property].clone() : properties[property];
    });
    return clonedProperties;
  }
}
