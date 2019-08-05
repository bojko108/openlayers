import Style from '../../style/Style';
import Stroke from '../../style/Stroke';
import Fill from '../../style/Fill';
import Circle from '../../style/Circle';
import Icon from '../../style/Icon';
import Text from '../../style/Text';
import { toRadians } from '../../math';
import { formatAttributes, formatObject } from '../helpers';
import { defaultFeatureStyle, defaultLabelStyle } from './defaultStyle';

/**
 * Creates a new style.
 *
 * @param {import('./defaultStyle').StyleType} [styleData]
 * @return {Style}
 */
export const createFeatureStyle = styleData => {
  if (!styleData.icon) {
    styleData.icon = null;
  }
  if (!styleData.font) {
    styleData.font = null;
  }
  if (!styleData.fill) {
    styleData.fill = null;
  }
  if (!styleData.stroke) {
    styleData.stroke = null;
  }
  if (!styleData.circle) {
    styleData.circle = null;
  }
  const style = Object.assign({}, defaultFeatureStyle, styleData);

  const fill = style.fill ? new Fill(style.fill) : null,
    stroke = style.stroke ? new Stroke(style.stroke) : null,
    fontSymbol = style.font ? createLabelStyle(style.font) : null;
  let image = null;

  if (style.icon) {
    image = new Icon(Object.assign({}, style.icon, { rotation: toRadians(style.icon.rotation || 0) }));
  }
  if (style.circle) {
    const circleFill = style.circle.fill ? new Fill(style.circle.fill) : null;
    const circleStroke = style.circle.stroke ? new Stroke(style.circle.stroke) : null;
    image = new Circle({ radius: style.circle.radius, fill: circleFill, stroke: circleStroke });
  }

  return new Style({ stroke, fill, image, text: fontSymbol });
};

/**
 * Creates a text style. `text` property is not formatted, which means that it can contain $id, {ATTRIBUTE_NAME}...
 * Before the feature is drawn on the map you can call `getFormattedLabel` to create the actual text displayed on the map.
 *
 * @param {import('./defaultStyle').LabelType} labelData
 * @return {Text}
 */
export const createLabelStyle = labelData => {
  const label = Object.assign({}, defaultLabelStyle, labelData);

  const rotation = toRadians(label.rotation || 0);
  const fill = label.fill ? new Fill(label.fill) : null;
  const stroke = label.stroke ? new Stroke(label.stroke) : null;
  const backgroundFill = label.backgroundFill ? new Fill(label.backgroundFill) : null;
  const backgroundStroke = label.backgroundStroke ? new Stroke(label.backgroundStroke) : null;

  // text will be a template - can include: $id, {ATTRIBUTE_NAME}...
  // before the feature is drawn on the map it will be formatted based of feature attribute values
  return new Text(Object.assign({}, label, { rotation, fill, stroke, backgroundFill, backgroundStroke }));
};

/**
 * Formats the label of a feature. The label can contain $id, {ATTRIBUTE_NAME}...
 * @param {!import('../../Feature').default} feature
 * @param {!String} mask
 * @return {String}
 */
export const getFormattedLabel = (feature, mask) => {
  if (mask.includes('$id')) mask = mask.replace('$id', feature.getId().toString());

  if (mask.includes('{')) {
    const layerInfo = feature.layer.layerInfo;
    if (layerInfo) {
      return formatAttributes(mask, feature.getAttributes());
    } else {
      return formatObject(mask, feature.getProperties());
    }
  } else {
    return mask;
  }
};
