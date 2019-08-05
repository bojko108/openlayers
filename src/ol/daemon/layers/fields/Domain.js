/**
 * @typedef {Object} DomainType
 * @property {!String} name domain name
 * @property {String} [type='coded'] domain type - `range` or `coded`
 * @property {Array<Number>} [range] range values, required when `data.type = 'range'`
 * @property {Array<CodedDomainValue>} [codedValues] coded values, required when `type = 'coded'`
 */

/**
 * @typedef {Object} CodedDomainValue
 * @property {!String|Number} code associated with the code value
 * @property {String} value associated with the code value
 * @property {String} [name] ESRI domains use `name` instead of `value`
 */

/**
 * @classdesc
 * Class for accessing Domain values
 *
 * @api
 */
export default class Domain {
  /**
   * Creates an instance of Domain
   * @param {!DomainType} domain - domain data
   * @see https://resources.arcgis.com/en/help/rest/apiref/domain.html
   */
  constructor(domain) {
    /**
     * domain name
     * @private
     * @type {String}
     */
    this.name = domain.name;
    /**
     * domain type - `range` or `coded`
     * @private
     * @type {String}
     */
    this.type = domain.type || 'coded';
    /**
     * domain range values - in case of {@link Domain.type} = `range`
     * @type {Array<Number>}
     */
    this.range = domain.range ? domain.range : [];
    /**
     * domain coded values - in case of {@link Domain.type} = `coded`
     * @private
     * @type {Array<CodedDomainValue>}
     */
    this.values = domain.codedValues
      ? domain.codedValues.map(({ code, value, name }) => {
          return { code, value: name || value };
        })
      : [];
  }

  /**
   * get domain maximum value
   * @public
   * @readonly
   * @type {Number}
   */
  get minValue() {
    return this.range[0];
  }
  /**
   * get domain minimum value
   * @public
   * @readonly
   * @type {Number}
   */
  get maxValue() {
    return this.range[1];
  }

  /**
   * check if the domain has a specific coded value
   * @public
   * @param {!String|Number} code - code to search in {@link Domain.values}
   * @return {Boolean}
   */
  hasValue(code) {
    let value = this.values.find(item => {
      return item.code.toString() === (code ? code.toString() : code);
    });
    return value ? true : false;
  }
  /**
   * get a specific coded value
   * @public
   * @param {!String|Number} code - code to search in {@link Domain.values}
   * @return {String|Number|undefined}
   */
  getValue(code) {
    let value = this.values.find(item => {
      return item.code.toString() === (code ? code.toString() : code);
    });
    return value ? value.value : code;
  }
}
