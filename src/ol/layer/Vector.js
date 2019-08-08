/**
 * @module ol/layer/Vector
 */
import BaseVectorLayer from './BaseVector.js';
import CanvasVectorLayerRenderer from '../renderer/canvas/VectorLayer.js';
import { METERS_PER_UNIT } from '../proj.js';
import LayerProperty from './Property';
import { Style, Icon, Circle } from '../style.js';

import { testFeature } from '../daemon/filters';
import { getMapProjection } from '../daemon/map';
import { createFeatureStyle, createLabelStyle, getFormattedLabel } from '../daemon/styles';
import { defaultLabelStyle, defaultFeatureStyle, getDefaultSelectStyle, getDefaultHighlightStyle } from '../daemon/styles/defaultStyle.js';

/**
 * @classdesc
 * Vector data that is rendered client-side.
 * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
 * property on the layer object; for example, setting `title: 'My Title'` in the
 * options means that `title` is observable, and has get/set accessors.
 *
 * @extends {BaseVectorLayer<import("../source/Vector.js").default>}
 * @api
 */
class VectorLayer extends BaseVectorLayer {
  /**
   * @param {import("./BaseVector.js").Options=} opt_options Options.
   */
  constructor(opt_options) {
    super(opt_options);

    if (opt_options.metadata && opt_options.metadata.labels) {
      this.setLabels(opt_options.metadata.labels || [defaultLabelStyle]);
    }
    if (opt_options.metadata && opt_options.metadata.styles) {
      this.setStyles(opt_options.metadata.styles || [defaultFeatureStyle]);
    }
  }

  /**
   * Create a renderer for this layer.
   * @return {import("../renderer/Layer.js").default} A layer renderer.
   * @protected
   */
  createRenderer() {
    return new CanvasVectorLayerRenderer(this);
  }

  /**
   * @type {Array<import('../daemon/styles/defaultStyle').LabelStyle>}
   */
  get labels() {
    return this.get(LayerProperty.LABELS) || [];
  }
  /**
   * @type {Array<import('../daemon/styles/defaultStyle').FeatureStyle>}
   */
  get styles() {
    return this.get(LayerProperty.STYLES) || [];
  }

  /**
   * Set labels for this layer.
   * @param {!Array<import('../daemon/styles/defaultStyle').LabelType>} labels
   */
  setLabels(labels) {
    this.set(LayerProperty.LABELS, this.__createLabels(labels));
    // @ts-ignore
    this.setStyle((feature, resolution) => this.__styleFunction(feature, resolution));
  }

  /**
   * Set styles for features in this layer.
   * @param {!Array<import('../daemon/styles/defaultStyle').StyleType>} styles
   */
  setStyles(styles) {
    this.set(LayerProperty.STYLES, this.__createStyles(styles));
    // @ts-ignore
    this.setStyle((feature, resolution) => this.__styleFunction(feature, resolution));
  }

  /**
   * Get all currently loaded features. If strategy is `bbox` you will receive
   * only the loaded features.
   * @return {Array.<import('../Feature').default>}
   */
  getFeatures() {
    return this.getSource().getFeatures();
  }

  /**
   * Get a feature by ID. If the feature is not loaded, the feature will be searched in the layer source
   * and added to the map if found.
   * @param {!String} fid
   * @return {Promise<import('../Feature').default>}
   */
  async getFeatureById(fid) {
    const feature = this.getSource().getFeatureById(fid);
    return feature;
  }

  /**
   * Add features to layer's source.
   * @param {!Array.<import('../Feature').default>} features
   */
  addFeatures(features) {
    this.getSource().addFeatures(features);
  }
  /**
   * Add a feature to layer's source.
   * @public
   * @param {import('../Feature').default} feature
   */
  addFeature(feature) {
    this.getSource().addFeature(feature);
  }
  /**
   * remove list of features from the source
   * @public
   * @param {!Array.<import('../Feature').default>} features - list of features
   */
  removeFeatures(features) {
    features.forEach(feature => {
      this.removeFeature(feature);
    });
  }
  /**
   * Remove a feature from the source
   * @param {!import('../Feature').default} feature
   */
  removeFeature(feature) {
    this.getSource().removeFeature(feature);
  }
  /**
   * Remove all features from the source
   */
  clearSource() {
    this.getSource().clear();
  }

  /**
   * Will return features satisfying the filters. This method searches only loaded
   * features. You can use `layer.query()` to query layer's source
   * @param {!Array<import('../daemon/filters').FilterType>} filters
   * @return {Array<import('../Feature').default>}
   */
  find(filters) {
    return this.getFeatures().filter(feature => {
      return testFeature(feature, filters);
    });
  }

  /**
   * This is called when the map projection is changed - all features are removed and
   * will be loaded again in the new projection
   */
  __mapProjectionChanged() {
    this.clearSource();
    // replace with this:
    // this.refresh();
  }

  /**
   * @param {!Array<import('../daemon/styles/defaultStyle').LabelType>} labels
   * @return {Array<import('../daemon/styles/defaultStyle').LabelStyle>}
   */
  __createLabels(labels) {
    return labels.map(currentLabel => {
      const { maxScale, minScale } = currentLabel;
      const style = new Style({ text: createLabelStyle(currentLabel) });
      return {
        maxResolution: this.__getMapResolutionFromScale(maxScale || 1000),
        minResolution: this.__getMapResolutionFromScale(minScale || 1),
        label: currentLabel.text,
        style
      };
    });
  }

  /**
   * @param {!Array<import('../daemon/styles/defaultStyle').StyleType>} styles
   * @return {Array<import('../daemon/styles/defaultStyle').FeatureStyle>}
   */
  __createStyles(styles) {
    return styles.map(style => {
      return {
        filters: style.filters || [],
        style: createFeatureStyle(style)
      };
    });
  }

  /**
   *
   * @param {!import('../Feature').default} feature
   * @param {Number} resolution
   * @return {import('../style/Style').default|Array<import('../style/Style').default>}
   */
  __styleFunction(feature, resolution) {
    if (feature.state.hidden) return null;

    let styles = [];

    // get feature style for this feature
    // and add it to styles array
    const featureStyle = this.__getStyleForFeature(feature);

    if (!featureStyle) return null;

    // add an additional style if the feature is selected or highlighted
    if (feature.state.selected || feature.state.highlighted) {
      const additionalStyle = feature.state.highlighted ? getDefaultHighlightStyle() : getDefaultSelectStyle();

      if (featureStyle.style.getStroke()) {
        additionalStyle.getStroke().setWidth(featureStyle.style.getStroke().getWidth() * 3);
      }

      if (featureStyle.style.getImage() instanceof Circle) {
        // @ts-ignore
        additionalStyle.getImage().setRadius(featureStyle.style.getImage().getRadius() * 2);
      }
      if (featureStyle.style.getImage() instanceof Icon) {
        const iconSize = featureStyle.style.getImage().getSize();
        const radius = (iconSize[0] + iconSize[1]) / 2 / 2;
        // @ts-ignore
        additionalStyle.getImage().setRadius(radius * 1.5);
      }

      styles.push(additionalStyle);
    }

    styles.push(featureStyle.style);

    // if labels are turned on then
    // get label style for this feature
    // and add it to styles array
    if (feature.layer.hasLayerInfo && feature.layer.layerInfo.showLabels) {
      const featureLabel = this.__getLabelForResolution(resolution);
      if (featureLabel) {
        const text = getFormattedLabel(feature, featureLabel.label);
        featureLabel.style.getText().setText(text);
        styles.push(featureLabel.style);
      }
    }

    return styles.length > 0 ? styles : null;
  }

  __getLabelForResolution(resolution) {
    return this.labels.find(label => {
      return label.maxResolution >= resolution && resolution >= label.minResolution;
    });
  }

  /**
   *
   * @param {import('../Feature').default} feature
   * @return {import('../daemon/styles/defaultStyle').FeatureStyle}
   */
  __getStyleForFeature(feature) {
    return this.styles.find(style => {
      if (style.filters) {
        return testFeature(feature, style.filters);
      } else {
        // will return the first style (default one)
        return true;
      }
    });
  }

  /**
   * @param {!Number} scale
   * @return {Number}
   */
  __getMapResolutionFromScale(scale) {
    const projection = getMapProjection();
    const mpu = METERS_PER_UNIT[projection.getUnits()];
    return scale / (mpu * 39.37 * (25.4 / 0.28));
  }
}

export default VectorLayer;
