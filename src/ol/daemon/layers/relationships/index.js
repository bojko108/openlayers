/**
 * @typedef {Object} RelationshipType
 * @property {!String} id
 * @property {!String} name
 * @property {!String} relatedTableId
 * @property {!String} role
 * @property {!String} keyField
 * @property {!String} cardinality
 * @property {!String} composite
 * @property {!String} relationshipTableId
 * @property {!String} keyFieldInRelationshipTable
 */

/**
 * @classdesc
 * Class for accessing relationship
 *
 * @api
 */
export default class Relationship {
  /**
   * Creates an instance of RelationshipClass.
   * @param {!RelationshipType} data - relationship data
   * @see https://resources.arcgis.com/en/help/rest/apiref/layer.html
   */
  constructor(data) {
    /**
     * relationship id
     * @type {String}
     */
    this.id = data.id;
    /**
     * relationship name
     * @type {String}
     */
    this.name = data.name;
    /**
     * related table ID
     * @type {String}
     */
    this.relatedTableId = data.relatedTableId;
    /**
     * role
     * @type {String}
     */
    this.role = data.role;
    /**
     * key field
     * @type {String}
     */
    this.keyField = data.keyField;
    /**
     * cardinality
     * @type {String}
     */
    this.cardinality = data.cardinality;
    /**
     * is composite
     * @type {String}
     */
    this.composite = data.composite;
    /**
     * relationship table ID
     * @type {String}
     */
    this.relationshipTableId = data.relationshipTableId;
    /**
     * key field in relationship table
     * @type {String}
     */
    this.keyFieldInRelationshipTable = data.keyFieldInRelationshipTable;
  }
}
