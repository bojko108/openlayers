/**
 * Format a template string based on provided values as arguments.
 * @param {...any} arguments - First is the template and then the values to be formatted.
 * @example
 * // Following example will write to the console: 'Foo: bar'.
 * const result = format('{0}: {1}', 'Foo', 'Bar'))
 * // 'Foo: Bar'
 * @return {String}
 */
export const format = function() {
  let mask = arguments[0];
  // start with the second argument (i = 1)
  for (let i = 1; i < arguments.length; i++) {
    const regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
    mask = mask.replace(regEx, arguments[i]);
  }

  const regex = new RegExp("{([0-9]*?)}");
  let match = null;
  //remove any '{someText}' strings left within the returned string
  while ((match = regex.exec(mask)) !== null) {
    mask = mask.replace(regex, "");
  }

  return mask;
};

/**
 * Format a template string based on provided object with values (placeholders).
 * @param {!String} mask
 * @param {!Object.<String,*>} object - object, containing the field names and their values
 * @param {Boolean} [removeLeftovers=true] - remove unplaced fields from returned result
 * @example
 * // Following example will write to the console: 'Foo: bar ()', any non existing properties
 * // will be removed as we pass true as last parameter
 *
 * const template = '{name}: {value} ({nonExistingProperty})'
 * const obj = {name: 'Foo', value: 'bar'}
 *
 * formatObject(obj))
 * // 'Foo: bar ()'
 * formatObject(obj, false))
 * // 'Foo: bar ({nonExistingProperty})'
 * @return {String}
 */
export const formatObject = function(mask, object, removeLeftovers = true) {
  let result = mask;
  for (let name in object) {
    const regEx = new RegExp("\\{" + name + "\\}", "gm");
    result = result.replace(regEx, object[name]);
  }

  if (removeLeftovers) {
    const regex = new RegExp("{([a-zA-Z]*?)}");
    let match = null;
    //remove any '{someText}' strings left within the returned string
    while ((match = regex.exec(result)) !== null) {
      result = result.replace(regex, "");
    }
  }

  return result;
};

/**
 * Format a template string based on provided object with values (placeholders). This method is
 * similar to {@link formatObject}, with the difference that the attributes
 * have additional information: alias, domain value and more, see {@link LayerInfo}.
 * @param {!String} mask
 * @param {Array<import('../../Feature').FeatureAttribute>} attributes
 * @param {Boolean} [removeLeftovers=true] - remove unplaced fields from the result
 * @example
 * // Following example will write to the console: 'SF_1234 - Name of station'
 * const mask = '{SJZ_STAN} - {NAZEV_BLISCI}'
 *
 * formatAttributes(mask, feature.getAttributes())
 * @return {String}
 */
export const formatAttributes = function(
  mask,
  attributes,
  removeLeftovers = true
) {
  attributes.forEach(attribute => {
    const regEx = new RegExp("\\{" + attribute.name + "\\}", "gm");
    mask = mask.replace(regEx, attribute.value);
  });

  if (removeLeftovers) {
    //remove any '{SOME_TEXT}' strings left within the returned string
    const regex = new RegExp("{([a-zA-Z]*?)}");
    let match;
    while ((match = regex.exec(mask)) !== null) {
      mask = mask.replace(regex, "");
    }
  }

  return mask;
};

/**
 * Splits a string at the given index.
 * @param {!String} string
 * @param {!Number} index
 * @return {Array<String>}
 * @example
 * const text = 'GDO.P_EL_PB.1234'
 * const [part1, part2] = splitAtIndex(text, text.lastIndexOf('.'))
 * // part1 = 'GDO.P_EL_PB'
 * // part2 = '1234'
 */
export const splitAtIndex = function(string, index) {
  return [string.substring(0, index), string.substring(index + 1)];
};
