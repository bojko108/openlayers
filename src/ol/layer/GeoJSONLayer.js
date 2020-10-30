/**
 * @module ol/layer/DaemonVectorLayer
 */
import VectorLayer from "./Vector.js";
import CanvasVectorLayerRenderer from "../renderer/canvas/VectorLayer.js";
import VectorSource from "../source/Vector.js";
import GeoJSON from "../format/GeoJSON.js";
import Axios from "axios";
import { getChangeEventType } from "../Object.js";
import LayerProperty from "./Property.js";

/**
 * @classdesc
 * Vector data from old UGIS backend.
 *
 * @extends {VectorLayer}
 * @api
 */
export default class GeoJSONLayer extends VectorLayer {
  /**
   * @param {import("./BaseVector.js").Options=} opt_options Options.
   */
  constructor(opt_options) {
    if (!opt_options.source) {
      opt_options.source = new VectorSource();
    }

    super(opt_options);

    /**
     * Used for reading the responce from ArcGIS Server
     * @type {GeoJSON}
     * @private
     */
    this._format = new GeoJSON();

    this.addEventListener(getChangeEventType(LayerProperty.MAP), () => {
      this._loadFeatures();
    });
  }

  /**
   * Create a renderer for this layer.
   * @return {import("../renderer/Layer.js").default} A layer renderer.
   */
  createRenderer() {
    return new CanvasVectorLayerRenderer(this);
  }

  async _loadFeatures() {
    const responce = await Axios.get(this.layerInfo.layerUrl);
    const data = await responce.data;

    const features = this._format.readFeatures(data, {
      dataProjection: this.layerInfo.sourceCRS,
      featureProjection: this.map.getProjection(),
    });

    this.addFeatures(features);
  }
}
