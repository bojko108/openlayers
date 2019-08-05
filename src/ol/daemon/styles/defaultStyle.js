import { createFeatureStyle } from "./index.js";

/**
 * @typedef StyleType
 * @property {String} [title]
 * @property {Array<import('../filters').FilterType>} [filters=[]]
 * @property {LabelType} [font]
 * @property {Object} [icon]
 * @property {String} [icon.type]
 * @property {String} [icon.src]
 * @property {Number} [icon.rotation]
 * @property {import('../../style/Fill').Options} [fill]
 * @property {import('../../style/Stroke').Options} [stroke]
 * @property {Object} [circle]
 * @property {Number} [circle.radius]
 * @property {import('../../style/Fill').Options} [circle.fill]
 * @property {import('../../style/Stroke').Options} [circle.stroke]
 */

/**
 * @typedef LabelType
 * @property {Number} [maxScale=1000]
 * @property {Number} [minScale=0]
 * @property {String} [font] Font style as CSS 'font' value, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font. Default is '10px sans-serif'
 * @property {Number} [maxAngle=Math.PI/4] When `placement` is set to `'line'`, allow a maximum angle between adjacent characters.
 * The expected value is in radians, and the default is 45° (`Math.PI / 4`).
 * @property {Number} [offsetX=0] Horizontal text offset in pixels. A positive will shift the text right.
 * @property {Number} [offsetY=0] Vertical text offset in pixels. A positive will shift the text down.
 * @property {Boolean} [overflow=false] For polygon labels or when `placement` is set to `'line'`, allow text to exceed
 * the width of the polygon at the label position or the length of the path that it follows.
 * @property {import("../../style/TextPlacement").default|string} [placement='point'] Text placement.
 * @property {Number} [scale] Scale.
 * @property {Boolean} [rotateWithView=false] Whether to rotate the text with the view.
 * @property {Number} [rotation=0] Rotation in radians (positive rotation clockwise).
 * @property {String} [text] Text content.
 * @property {String} [textAlign] Text alignment. Possible values: 'left', 'right', 'center', 'end' or 'start'.
 * Default is 'center' for `placement: 'point'`. For `placement: 'line'`, the default is to let the renderer choose a
 * placement where `maxAngle` is not exceeded.
 * @property {String} [textBaseline='middle'] Text base line. Possible values: 'bottom', 'top', 'middle', 'alphabetic',
 * 'hanging', 'ideographic'.
 * @property {import("../../style/Fill").Options} [fill] Fill style. If none is provided, we'll use a dark fill-style (#333).
 * @property {import("../../style/Stroke").Options} [stroke] Stroke style.
 * @property {import("../../style/Fill").Options} [backgroundFill] Fill style for the text background when `placement` is
 * `'point'`. Default is no fill.
 * @property {import("../../style/Stroke").Options} [backgroundStroke] Stroke style for the text background  when `placement`
 * is `'point'`. Default is no stroke.
 * @property {Array<Number>} [padding=[0, 0, 0, 0]] Padding in pixels around the text for decluttering and background. The order of
 * values in the array is `[top, right, bottom, left]`.
 */

/**
 * @typedef LabelStyle
 * @property {Number} maxResolution
 * @property {Number} minResolution
 * @property {String} label
 * @property {import('../../style/Style').default} style
 */

/**
 * @typedef FeatureStyle
 * @property {Array<import('../filters').FilterType>} [filters]
 * @property {import('../../style/Style').default} style
 * @property {import('../../style/Style').default} [selected] ---------------------------
 * @property {import('../../style/Style').default} [highlighted] ------------------------
 */

/**
 * @type {StyleType}
 */
export const defaultFeatureStyle = {
  title: "All features",
  filters: [],
  icon: null,
  font: null,
  fill: { color: "rgba(192,192,192,0.5)" },
  stroke: { color: "#808080", width: 3 },
  circle: {
    radius: 5,
    fill: { color: "#1589FF" },
    stroke: { color: "#2B3856", width: 2 }
  }
};

/**
 * @type {LabelType}
 */
export const defaultLabelStyle = {
  maxScale: 1000,
  minScale: 1,
  text: "$id",
  font: "10px sans-serif",
  textAlign: "end",
  textBaseline: "bottom",
  fill: { color: "#000" },
  rotation: 0,
  offsetX: 5,
  offsetY: -5
};

/**
 * When a feature is selected this style is added to feature styles.
 * @type {import('../../style/Style').default}
 */
export const defaultSelectStyle = createFeatureStyle({
  fill: { color: "rgba(0,116,217,0.5)" },
  stroke: { color: "#0074d9", width: 1 },
  circle: {
    radius: 1,
    fill: { color: "#0074d9" }
  }
});

/**
 * When a feature is highlighted this style is added to feature styles.
 * @type {import('../../style/Style').default}
 */
export const defaultHighlightStyle = createFeatureStyle({
  fill: { color: "rgba(255,220,0,0.5)" },
  stroke: { color: "#FFDC00", width: 1 },
  circle: {
    radius: 1,
    fill: { color: "#FFDC00" }
  }
});
