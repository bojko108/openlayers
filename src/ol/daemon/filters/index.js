/**
 * @typedef FilterType
 * @property {!String} attributeName
 * @property {!Object} validValue
 * @property {EnumOperators} [operator='equal']
 */

/**
 * Available fitler operators
 * @enum {string}
 */
export const EnumOperators = Object.freeze({
  /**
   * For **Number** - `attributeName` is in range of `validValue`
   * @example
   * COUNT BETWEEN [1,100]
   * // select features with COUNT in range 1, 100
   */
  BETWEEN: 'between',
  /**
   * For **String** - `attributeName` contains `validValue`
   * @example
   * NAME CONTAIN 'BG'
   * // select features with NAME containing 'BG'
   */
  CONTAIN: 'contain',
  /**
   * For **Number** - `attributeName` is equal to `validValue`
   * @example
   * POWER EQUAL 20
   * // select features with POWER = 20kV
   */
  EQUAL: 'equal',
  /**
   * For **Number** - `attributeName` is greater than `validValue`
   * @example
   * POWER GREATER_THAN 20
   * // select features with POWER > 20kV
   */
  GREATER_THAN: 'greaterThan',
  /**
   * For **Number** - `attributeName` is greater than or equal to `validValue`
   * @example
   * POWER GREATER_THAN_OR_EQUAL 20
   * // select features with POWER >= 20kV
   */
  GREATER_THAN_OR_EQUAL: 'greaterThanOrEqual',
  /**
   * For **String** - `attributeName` is equal to `validValue`
   * @example
   * NAME LIKE 'Full Match'
   * // select features with NAME = 'Full Match'
   */
  LIKE: 'like',
  /**
   * For **Number** - `attributeName` is less than `validValue`
   * @example
   * POWER LESS_THAN 20
   * // select features with POWER < 20kV
   */
  LESS_THAN: 'lessThan',
  /**
   * For **Number** - `attributeName` is less than or equal `validValue`
   * @example
   * POWER LESS_THAN_OR_EQUAL 20
   * // select features with POWER <= 20kV
   */
  LESS_THAN_OR_EQUAL: 'lessThanOrEqual',
  /**
   * For **String** - `attributeName` is not equal to `validValue`
   * @example
   * NAME NOT_LIKE 'Full Match'
   * // select features with NAME != 'Full Match'
   */
  NOT_LIKE: 'notLike',
  /**
   * For **Number** - `attributeName` is not equal to `validValue`
   * @example
   * POWER NOT_EQUAL 20
   * // select features with POWER <> 20kV
   */
  NOT_EQUAL: 'notEqual',
  /**
   * For **Number, String** - `attributeName` is in `validValue`
   * @example
   * POWER IN (10, 20)
   * // select features with POWER = 10 and POWER = 20
   */
  IN: 'in',
  /**
   * For **Number, String** - `attributeName` is not in `validValue`
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
 *  attributeName: 'TYPE',
 *  operator: EnumOperators.LIKE,
 *  validValue: 'trafostation'
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
    return filters.every(({ attributeName, validValue, operator = EnumOperators.EQUAL }) => {
      const currentValue = feature.get(attributeName);
      switch (operator) {
        case EnumOperators.BETWEEN:
          return Number(validValue[0]) <= Number(currentValue) && Number(validValue[1]) >= Number(currentValue);
        case EnumOperators.CONTAIN:
          return currentValue ? currentValue.indexOf(validValue) > -1 : false;
        case EnumOperators.EQUAL:
          return Number(currentValue) === Number(validValue);
        case EnumOperators.GREATER_THAN:
          return Number(currentValue) > Number(validValue);
        case EnumOperators.GREATER_THAN_OR_EQUAL:
          return Number(currentValue) >= Number(validValue);
        case EnumOperators.IN:
          if (!currentValue) return false;
          const valuesIn = validValue.split(',').map(value => value.toString());
          return valuesIn.indexOf(currentValue.toString()) > -1;
        case EnumOperators.LESS_THAN:
          return Number(currentValue) < Number(validValue);
        case EnumOperators.LESS_THAN_OR_EQUAL:
          return Number(currentValue) <= Number(validValue);
        case EnumOperators.LIKE:
          if (!currentValue) return false;
          return currentValue ? currentValue.toString() === validValue.toString() : false;
        case EnumOperators.NOT_EQUAL:
          return Number(currentValue) !== Number(validValue);
        case EnumOperators.NOT_IN:
          if (!currentValue) return false;
          const valuesNotIn = validValue.split(',').map(value => value.toString());
          return valuesNotIn.indexOf(currentValue.toString()) === -1;
        case EnumOperators.NOT_LIKE:
          if (!currentValue) return false;
          return currentValue ? currentValue.toString() !== validValue.toString() : false;
      }
    });
  }
};
