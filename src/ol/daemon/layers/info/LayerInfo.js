import defaultOptions from './defaultOptions';
import { EnumBasemaps } from '../Basemaps';
import { METERS_PER_UNIT } from '../../../proj/Units';
import Field from '../fields/Field';
import Relationship from '../relationships';
import { getMapProjection } from '../../app';
import LayerProperty from '../../../layer/Property.js';

/**
 * Available types of vector layers
 * @enum {string}
 */
export const EnumLayerType = {
  /**
   * Empty vector layer
   */
  EMPTY: 'empty',
  /**
   * Layer from ArcGIS Server
   */
  ARCGIS: 'arcgis',
  /**
   * Layer conneted to Daemon backend
   */
  DAEMON: 'daemon',
  /**
   * Group layer
   */
  GROUP: 'group'
};

export default class LayerInfo {
  /**
   * @type {string}
   */
  static get NAME() {
    return 'layerInfo';
  }

  /**
   * Creates Layer Info for a given layer.
   * @param {!import("../../../layer/Base").default} layer
   * @param {Object} metadata
   */
  constructor(layer, metadata = {}) {
    const layerInfo = Object.assign({}, defaultOptions, metadata);

    /**
     * @type {import("../../../layer/Base").default}
     * @private
     */
    this._layer = layer;
    // this listener is for setting initial visibility scale ranges for the layer
    this._layer.on(`change:${LayerProperty.MAP}`, () => {
      this.maxScale = this.maxScale;
      this.minScale = this.minScale;
    });

    /**
     * @type {EnumLayerType}
     */
    this._type = layerInfo.type;

    /**
     * @type {String}
     */
    this._name = layerInfo.name;
    /**
     * @type {String}
     */
    this._title = layerInfo.title;
    /**
     * @type {String}
     */
    this._layerId = layerInfo.layerId;
    /**
     * @type {String}
     */
    this._layerUrl = layerInfo.layerUrl;
    /**
     * @type {String}
     */
    this._collectionName = layerInfo.collectionName;
    /**
     * @type {EnumBasemaps}
     */
    this._provider = layerInfo.provider;
    // /**
    //  * metadata URL address
    //  * @private
    //  * @type {String}
    //  */
    // this._metadataUrl = layer.get('layerInfo').metadataUrl;

    // for georeferencing images
    // this._imageExtent = layer.get('layerInfo').imageExtent;
    // this._forwardParameters = layer.get('layerInfo').forwardParameters;
    // this._inverseParameters = layer.get('layerInfo').inverseParameters;

    /**
     * source coordinate system, according to http://epsg.io
     * @type {String}
     */
    this._sourceCRS = layerInfo.sourceCRS;

    /**
     * The geodatabase version to load data from
     * @type {String}
     */
    this._gdbVersion = layerInfo.gdbVersion;

    /**
     * name of field used as unique identifier
     * @type {String}
     */
    this._objectIdField = layerInfo.objectIdField;
    /**
     * is layer editable
     * @type {Boolean}
     */
    this._editable = layerInfo.editable;
    /**
     * are features from that layer snappable
     * @type {Boolean}
     */
    this._snappable = layerInfo.snappable;
    /**
     * are features from that layer selectable
     * @type {Boolean}
     */
    this._selectable = layerInfo.selectable;
    /**
     * are features from that layer printable
     * @type {Boolean}
     */
    this._printable = layerInfo.printable;
    /**
     * is layer searchable
     * @private
     * @type {Boolean}
     */
    this._searchable = layerInfo.searchable;

    /**
     * icon, used in legend control
     * @type {String}
     */
    this._icon = layerInfo.icon;
    /**
     * diplay this layer in legend control or not
     * @type {Boolean}
     */
    this._showInLegend = layerInfo.showInLegend;
    /**
     * is the layer appearence editable from legend control
     * @type {Boolean}
     */
    this._disabledInLegend = layerInfo.disabledInLegend;
    /**
     * primary display mask used in sidebar or when labeling features
     * @type {String}
     */
    this._displayMask = layerInfo.displayMask;
    /**
     * template string for displaying data in a popup
     * @type {String}
     */
    this._displayPopupsMask = layerInfo.displayPopupsMask;
    /**
     * display popups on hover or not
     * @type {Boolean}
     */
    this._displayPopupsOnHover = layerInfo.displayPopupsOnHover;
    /**
     * display popups on click or not
     * @type {Boolean}
     */
    this._displayPopupsOnClick = layerInfo.displayPopupsOnClick;

    /**
     * minimum map scale - the layer is visible beyond that scale
     * @type {Number}
     * @private
     */
    this._minScale = layerInfo.minScale;
    /**
     * maximum map scale - the layer is not visible beyond that scale
     * @type {Number}
     * @private
     */
    this._maxScale = layerInfo.maxScale;

    /**
     * display labels or not
     * @type {Boolean}
     */
    this._showLabels = layerInfo.showLabels;

    /**
     * list of fields
     * @type {Array<Field>}
     */
    this._fields = layerInfo.fields ? layerInfo.fields.map(field => new Field(field)) : [];
    /**
     * list of relationships
     * @type {Array<Relationship>}
     */
    this._relationships = layerInfo.relationships ? layerInfo.relationships.map(relationship => new Relationship(relationship)) : [];

    // /**
    //  * geometry type for this layer
    //  * @private
    //  * @type {enumGeometryType}
    //  */
    // this._geometryType = layerInfo.geometryType || enumGeometryType.olPoint;
  }

  /**
   * @type {EnumLayerType}
   */
  get type() {
    return this._type;
  }

  /**
   * Unique identifier for this layer
   * @type {String}
   */
  get name() {
    return this._name;
  }
  /**
   * Get layer title
   * @type {String}
   */
  get title() {
    return this._title;
  }
  /**
   * Set layer title
   * @param {String} title
   */
  set title(title) {
    this._title = title;
  }
  /**
   * Layer Id - for ESRI layers this is the layer id in MapServer
   * @type {String}
   */
  get layerId() {
    return this._layerId;
  }
  /**
   * Layer Id - for ESRI layers this is the layer id in MapServer
   * @param {String} layerId
   */
  set layerId(layerId) {
    this._layerId = layerId;
  }
  /**
   * Layer URL
   * @type {String}
   */
  get layerUrl() {
    return this._layerUrl;
  }
  /**
   * Collection name for backend layers...
   * @type {String}
   */
  get collectionName() {
    return this._collectionName;
  }
  /**
   * Provider for basemap layers
   * @type {EnumBasemaps}
   */
  get provider() {
    return this._provider;
  }

  /**
   * source coordinate system, according to http://epsg.io
   * @type {String}
   */
  get sourceCRS() {
    return this._sourceCRS;
  }
  /**
   * source coordinate system, according to http://epsg.io
   * @param {String} epsgCode
   */
  set sourceCRS(epsgCode) {
    this._sourceCRS = epsgCode;
  }

  /**
   * Get geodatabase version to load data from
   * @type {String}
   */
  get gdbVersion() {
    return this._gdbVersion;
  }
  /**
   * Set geodatabase version to load data from
   * @param {String} gdbVersionName
   */
  set gdbVersion(gdbVersionName) {
    this._gdbVersion = gdbVersionName;
  }

  /**
   * name of field used as unique identifier for features
   * @type {String}
   */
  get objectIdField() {
    return this._objectIdField;
  }
  /**
   * is layer editable
   * @type {Boolean}
   */
  get editable() {
    return this._editable;
  }
  /**
   * is layer editable
   * @param {Boolean} editable
   */
  set editable(editable) {
    this._editable = editable;
  }
  /**
   * are features from that layer snappable
   * @type {Boolean}
   */
  get snappable() {
    return this._snappable;
  }
  /**
   * are features from that layer snappable
   * @param {Boolean} snappable
   */
  set snappable(snappable) {
    this._snappable = snappable;
  }
  /**
   * are features from that layer selectable
   * @param {Boolean} selectable
   */
  set selectable(selectable) {
    this._selectable = selectable;
  }
  /**
   * are features from that layer printable
   * @type {Boolean}
   */
  get printable() {
    return this._printable;
  }
  /**
   * are features from that layer printable
   * @param {Boolean} printable
   */
  set printable(printable) {
    this._printable = printable;
  }
  /**
   * is layer searchable
   * @type {Boolean}
   */
  get searchable() {
    return this._searchable;
  }
  /**
   * is layer searchable
   * @param {Boolean} searchable
   */
  set searchable(searchable) {
    this._searchable = searchable;
  }
  /**
   * icon, used in legend control
   * @type {String}
   */
  get icon() {
    return this._icon;
  }
  /**
   * icon, used in legend control
   * @param {String} icon
   */
  set icon(icon) {
    this._icon = icon;
  }
  /**
   * diplay this layer in legend control or not
   * @type {Boolean}
   */
  get showInLegend() {
    return this._showInLegend;
  }
  /**
   * diplay this layer in legend control or not
   * @param {Boolean} showInLegend
   */
  set showInLegend(showInLegend) {
    this._showInLegend = showInLegend;
  }
  /**
   * is the layer appearence editable from legend control
   * @type {Boolean}
   */
  get disabledInLegend() {
    return this._disabledInLegend;
  }
  /**
   * is the layer appearence editable from legend control
   * @param {Boolean} disabledInLegend
   */
  set disabledInLegend(disabledInLegend) {
    this._disabledInLegend = disabledInLegend;
  }
  /**
   * primary display mask used in sidebar or when labeling features
   * @type {String}
   */
  get displayMask() {
    return this._displayMask;
  }
  /**
   * primary display mask used in sidebar or when labeling features
   * @param {String} displayMask
   */
  set displayMask(displayMask) {
    this._displayMask = displayMask;
  }
  /**
   * template string for displaying data in a popup
   * @type {String}
   */
  get displayPopupsMask() {
    return this._displayPopupsMask;
  }
  /**
   * template string for displaying data in a popup
   * @param {String} displayPopupsMask
   */
  set displayPopupsMask(displayPopupsMask) {
    this._displayPopupsMask = displayPopupsMask;
  }
  /**
   * display popups on hover or not
   * @type {Boolean}
   */
  get displayPopupsOnHover() {
    return this._displayPopupsOnHover;
  }
  /**
   * display popups on hover or not
   * @param {Boolean} displayPopupsOnHover
   */
  set displayPopupsOnHover(displayPopupsOnHover) {
    this._displayPopupsOnHover = displayPopupsOnHover;
  }
  /**
   * display popups on click or not
   * @type {Boolean}
   */
  get displayPopupsOnClick() {
    return this._displayPopupsOnClick;
  }
  /**
   * display popups on click or not
   * @param {Boolean} displayPopupsOnClick
   */
  set displayPopupsOnClick(displayPopupsOnClick) {
    this._displayPopupsOnClick = displayPopupsOnClick;
  }
  /**
   * display labels or not
   * @type {Boolean}
   */
  get showLabels() {
    return this._showLabels;
  }
  /**
   * display labels or not
   * @param {Boolean} showLabels
   */
  set showLabels(showLabels) {
    this._showLabels = showLabels;
    this._layer.changed();
  }
  /**
   * list of fields
   * @type {Array<Field>}
   */
  get fields() {
    return this._fields;
  }
  /**
   * list of fields
   * @param {Array<Field>} fields
   */
  set fields(fields) {
    this._fields = fields;
    this._layer.changed();
  }
  /**
   * list of relationships
   * @type {Array<Relationship>}
   */
  get relationships() {
    return this._relationships;
  }
  /**
   * list of relationships
   * @param {Array<Relationship>} relationships
   */
  set relationships(relationships) {
    this._relationships = relationships;
  }

  set opacity(opacity) {
    this._layer.setOpacity(opacity);
  }
  get opacity() {
    return this._layer.getOpacity();
  }
  set visible(visible) {
    this._layer.setVisible(visible);
  }
  get visible() {
    return this._layer.getVisible();
  }
  set zIndex(zIndex) {
    this._layer.setZIndex(zIndex);
  }
  get zIndex() {
    return this._layer.getZIndex();
  }
  set minScale(scale) {
    this._minScale = scale;
    if (this._layer.map) {
      this._layer.setMinResolution(this.__getMapResolutionFromScale(this._minScale) || 0);
    }
  }
  get minScale() {
    return this._minScale;
  }
  set maxScale(scale) {
    this._maxScale = scale;
    if (this._layer.map) {
      this._layer.setMaxResolution(this.__getMapResolutionFromScale(this._maxScale) || 0);
    }
  }
  get maxScale() {
    return this._maxScale;
  }

  /**
   * Create an oid value: '[layerInfo.name].[feature.getId()]'
   * @param {import('../../../Feature').default} feature
   * @return {String}
   */
  createObjectId(feature) {
    const id = feature.get(this.objectIdField);
    return `${this.name}.${id}`;
  }

  /**
   * @param {!Number} scale
   * @return {Number}
   */
  __getMapResolutionFromScale(scale) {
    const projection = getMapProjection();
    let mpu = METERS_PER_UNIT[projection.getUnits()];
    return scale / (mpu * 39.37 * (25.4 / 0.28));
  }
}
