/**
 * @module ol/layer/ArcGISDynamicMapServiceLayer
 */
import VectorLayer from './Vector.js';
import CanvasVectorLayerRenderer from '../renderer/canvas/VectorLayer.js';
import VectorSource from '../source/Vector.js';
import EsriJSON from '../format/EsriJSON.js';
import { bbox } from '../loadingstrategy.js';

import { readEsriStyleDefinitions } from 'ol-esri-style';
import { Field, splitAtIndex } from '../daemon';
// import Relationship from '../daemon/layers/relationships';

import axios from 'axios';

/**
 * @classdesc
 * Vector data from ArcGIS Dynamic MapService Layer.
 *
 * @extends {VectorLayer}
 * @api
 */
export default class ArcGISDynamicMapServiceLayer extends VectorLayer {
  /**
   * @param {import("./BaseVector.js").Options=} opt_options Options.
   */
  constructor(opt_options) {
    opt_options.metadata.maxScale = 1;
    opt_options.metadata.minScale = 1;

    super(opt_options);

    /**
     * Used for reading the responce from ArcGIS Server
     * @type {EsriJSON}
     * @private
     */
    this.__format = new EsriJSON();

    if (this.hasLayerInfo) {
      this._createSource();
    }

    this._readLayerInfo();
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
   * Set the version for the ArcGIS Dynamic MapService Layer - all features are removed and
   * will be loaded again from the specified version
   * @param {!String} versionName - The name of the version to display.
   */
  setGDBVersion(versionName) {
    this.layerInfo.gdbVersion = versionName;
    this.clearSource();
  }

  /**
   * Get a feature by ID. If the feature is not loaded, the feature will be searched in the layer source.
   * @param {!String} fid
   * @return {Promise<import('../Feature').default>}
   */
  async getFeatureById(fid) {
    const feature = this.getSource().getFeatureById(fid);
    if (feature) {
      return feature;
    } else {
      const id = splitAtIndex(fid, fid.lastIndexOf('.'))[1];
      // @ts-ignore
      const features = await this.query({ where: `${this.layerInfo.objectIdField} = ${id}` });
      return features[0];
    }
  }

  /**
   *
   * @param {Object} query
   * @param {String} query.where
   * @param {String} query.objectIds
   * @param {String} query.outFields
   * @param {Boolean} query.returnIdsOnly
   * @param {Boolean} query.returnCountOnly
   * @param {Boolean} query.returnGeometry
   * @param {String} query.gdbVersion
   * @return {Promise<Array<import('../Feature').default>>}
   */
  async query(query) {
    const projection = this.map.projection.split(':')[1];
    const queryData = Object.assign({ f: 'json', outFields: '*', gdbVersion: this.layerInfo.gdbVersion, inSR: projection, outSR: projection }, query);

    // ArcGIS Server requires FormData
    let formData = new FormData();
    for (let key in queryData) {
      formData.append(key, queryData[key]);
    }

    let features = [];

    try {
      const url = `${this.layerInfo.layerUrl}/query/`;
      const responce = await axios.post(url, formData);
      const { data } = responce;
      features = this.__format.readFeatures(data).map(ftr => {
        ftr.setId(this.layerInfo.createObjectId(ftr));
        return ftr;
      });
    } catch (e) {
      console.log(e);
    }

    return features;
  }

  /**
   * Creates a new Source - loads features from ArcGI Server with BBOX strategy.
   * @private
   */
  _createSource() {
    if (this.layerInfo.layerUrl) {
      try {
        const source = new VectorSource({
          strategy: bbox,
          loader: (extent, resolution, projection) => {
            const outEPSGCode = projection.getCode().split(':')[1];

            const visibleExtent = encodeURIComponent(
              `{"xmin": ${extent[0]}, "ymin": ${extent[1]}, "xmax": ${extent[2]}, "ymax": ${extent[3]}, "spatialReference": ${outEPSGCode}}`
            );

            const url = `${this.layerInfo.layerUrl}/query/?f=json&gdbVersion=${this.layerInfo.gdbVersion}&returnGeometry=true&outFields=*&spatialRel=esriSpatialRelIntersects&geometry=${visibleExtent}&geometryType=esriGeometryEnvelope&inSR=${outEPSGCode}&outSR=${outEPSGCode}`;

            axios
              .get(url)
              .then(response => {
                return response.data;
              })
              .then(featuresResponce => {
                if (featuresResponce && featuresResponce.features.length > 0) {
                  const features = this.__format.readFeatures(featuresResponce).map(ftr => {
                    ftr.setId(this.layerInfo.createObjectId(ftr));
                    return ftr;
                  });
                  this.addFeatures(features);
                }
              });
          }
        });

        this.setSource(source);
      } catch ({ message }) {
        console.error(message);
      }
    }
  }

  _readLayerInfo() {
    const url = `${this.layerInfo.layerUrl}/?f=json`;

    axios
      .get(url)
      .then(response => {
        return response.data;
      })
      .then(layerResponce => {
        if (this.styles.length === 0 || this.labels.length === 0) {
          const { featureStyles, labelStyles } = readEsriStyleDefinitions(layerResponce.drawingInfo);

          this.setStyles(featureStyles);
          this.setLabels(labelStyles);
        }

        this.layerInfo.layerId = layerResponce.id;
        this.layerInfo.title = layerResponce.name;
        if (layerResponce.sourceSpatialReference) {
          this.layerInfo.sourceCRS = `EPSG:${layerResponce.sourceSpatialReference.wkid}`;
        }

        this.layerInfo.geometryType = layerResponce.geometryType;
        this.layerInfo.visible = layerResponce.defaultVisibility;
        this.layerInfo.minScale = layerResponce.maxScale === 0 ? -Infinity : layerResponce.maxScale;
        this.layerInfo.maxScale = layerResponce.minScale === 0 ? Infinity : layerResponce.minScale;

        this.layerInfo.fields = layerResponce.fields.map(field => new Field(field));
        // this.layerInfo.relationships = layerResponce.relationships.map(rel => new Relationship(rel));
      });
  }
}
