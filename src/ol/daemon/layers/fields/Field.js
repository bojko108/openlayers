import Domain from './Domain';
import { addDomain, getDomain } from './index.js';

/**
 * @typedef {Object} FieldType
 * @property {!String} name
 * @property {String} [alias=name]
 * @property {Boolean} [visible=true]
 * @property {Boolean} [editable=false]
 * @property {!String} type
 * @property {Object} [defaultValue]
 * @property {Domain} [domain]
 */

/**
 * @classdesc
 * Class for accessing field data
 *
 * @api
 */
export default class Field {
  /**
   * Creates an instance of FieldClass.
   * @param {!FieldType} data - field data
   * @see https://resources.arcgis.com/en/help/rest/apiref/layer.html
   */
  constructor(data) {
    /**
     * field name
     * @private
     * @type {String}
     */
    this.name = data.name;
    /**
     * field alias
     * @private
     * @type {String}
     */
    this.alias = data.alias || this.name;
    /**
     * is the field visible in attribute editor
     * @private
     * @type {Boolean}
     */
    this.visible = data.visible !== undefined ? data.visible : true;
    /**
     * is the field editable
     * @private
     * @type {Boolean}
     */
    this.editable = data.editable !== undefined ? data.editable : false;
    /**
     * field type
     * @private
     * @type {String}
     */
    this.type = data.type;
    /**
     * field default value
     * @private
     * @type {Object}
     */
    this.defaultValue = data.defaultValue;
    /**
     * does the field has a domain
     * @private
     * @type {Boolean}
     */
    this._hasDomain = false;
    /**
     * domain data
     * @private
     * @type {Domain}
     */
    this._domain = undefined;

    if (data.domain) {
      this.domain = data.domain;
    }
  }

  /**
   * does the field has a domain
   * @public
   * @readonly
   * @type {Boolean}
   */
  get hasDomain() {
    return this._hasDomain;
  }
  /**
   * domain data
   * @public
   * @readonly
   * @type {Domain}
   */
  get domain() {
    return this._domain;
  }
  /**
   * set domain data - see {@link Domain}
   * @public
   * @type {Domain|import('./Domain').DomainType}
   */
  set domain(domain) {
    // add new domain or get an existing one from cache
    this._domain = addDomain(domain);
    this._hasDomain = !!this._domain;
  }
}
