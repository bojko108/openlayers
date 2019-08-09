/**
 * @typedef FilterType
 * @property {!String} field
 * @property {!Object} value
 * @property {EnumOperators} [operator='equal']
 */

/**
 * Available fitler operators
 * @enum {string}
 */
export const EnumOperators = Object.freeze({
  /**
   * For **Number** - `field` is in range of `value`
   * @example
   * COUNT BETWEEN [1,100]
   * // select features with COUNT in range 1, 100
   */
  BETWEEN: 'between',
  /**
   * For **String** - `field` contains `value`
   * @example
   * NAME CONTAIN 'BG'
   * // select features with NAME containing 'BG'
   */
  CONTAIN: 'contain',
  /**
   * For **Number** - `field` is equal to `value`
   * @example
   * POWER EQUAL 20
   * // select features with POWER = 20kV
   */
  EQUAL: 'equal',
  /**
   * For **Number** - `field` is greater than `value`
   * @example
   * POWER GREATER_THAN 20
   * // select features with POWER > 20kV
   */
  GREATER_THAN: 'greaterThan',
  /**
   * For **Number** - `field` is greater than or equal to `value`
   * @example
   * POWER GREATER_THAN_OR_EQUAL 20
   * // select features with POWER >= 20kV
   */
  GREATER_THAN_OR_EQUAL: 'greaterThanOrEqual',
  /**
   * For **String** - `field` is equal to `value`
   * @example
   * NAME LIKE 'Full Match'
   * // select features with NAME = 'Full Match'
   */
  LIKE: 'like',
  /**
   * For **Number** - `field` is less than `value`
   * @example
   * POWER LESS_THAN 20
   * // select features with POWER < 20kV
   */
  LESS_THAN: 'lessThan',
  /**
   * For **Number** - `field` is less than or equal `value`
   * @example
   * POWER LESS_THAN_OR_EQUAL 20
   * // select features with POWER <= 20kV
   */
  LESS_THAN_OR_EQUAL: 'lessThanOrEqual',
  /**
   * For **String** - `field` is not equal to `value`
   * @example
   * NAME NOT_LIKE 'Full Match'
   * // select features with NAME != 'Full Match'
   */
  NOT_LIKE: 'notLike',
  /**
   * For **Number** - `field` is not equal to `value`
   * @example
   * POWER NOT_EQUAL 20
   * // select features with POWER <> 20kV
   */
  NOT_EQUAL: 'notEqual',
  /**
   * For **Number, String** - `field` is in `value`
   * @example
   * POWER IN (10, 20)
   * // select features with POWER = 10 and POWER = 20
   */
  IN: 'in',
  /**
   * For **Number, String** - `field` is not in `value`
   * @example
   * POWER NOT_IN (10, 20)
   * // select features with POWER <> 10 and POWER <> 20
   */
  NOT_IN: 'notIn'
});

/**
 * Use this method to test if a feature satisfies passed filters. You can pass a callback
 * to check the feature and return `true` or `false`.
 *
 * @param {!import('../../Feature').default} feature
 * @param {FilterType|Array<FilterType>|function(import('../../Feature').default):Boolean} filters - an array of filters or a callback
 * @return {Boolean}
 * @example
 * // test if a feature is a 'trafostation'
 * let filter = {
 *  field: 'TYPE',
 *  operator: EnumOperators.LIKE,
 *  value: 'trafostation'
 * }
 * testFeature(feature, filters)
 *
 * // using a callback
 * testFeature(feature, (feature => {
 *  // test the feature and return `true` or `false`
 * })
 */
export const testFeature = (feature, filters) => {
  if (typeof filters === 'function') {
    return filters(feature);
  } else {
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    return filters.every(({ field, value, operator = EnumOperators.EQUAL }) => {
      const currentValue = feature.get(field);
      switch (operator) {
        case EnumOperators.BETWEEN:
          return Number(value[0]) <= Number(currentValue) && Number(value[1]) >= Number(currentValue);
        case EnumOperators.CONTAIN:
          return currentValue ? currentValue.indexOf(value) > -1 : false;
        case EnumOperators.EQUAL:
          return Number(currentValue) === Number(value);
        case EnumOperators.GREATER_THAN:
          return Number(currentValue) > Number(value);
        case EnumOperators.GREATER_THAN_OR_EQUAL:
          return Number(currentValue) >= Number(value);
        case EnumOperators.IN:
          if (!currentValue) return false;
          const valuesIn = value.split(',').map(value => value.toString());
          return valuesIn.indexOf(currentValue.toString()) > -1;
        case EnumOperators.LESS_THAN:
          return Number(currentValue) < Number(value);
        case EnumOperators.LESS_THAN_OR_EQUAL:
          return Number(currentValue) <= Number(value);
        case EnumOperators.LIKE:
          if (!currentValue) return false;
          return currentValue ? currentValue.toString() === value.toString() : false;
        case EnumOperators.NOT_EQUAL:
          return Number(currentValue) !== Number(value);
        case EnumOperators.NOT_IN:
          if (!currentValue) return false;
          const valuesNotIn = value.split(',').map(value => value.toString());
          return valuesNotIn.indexOf(currentValue.toString()) === -1;
        case EnumOperators.NOT_LIKE:
          if (!currentValue) return false;
          return currentValue ? currentValue.toString() !== value.toString() : false;
      }
    });
  }
};
