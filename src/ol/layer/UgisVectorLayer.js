/**
 * @module ol/layer/DaemonVectorLayer
 */
import VectorLayer from "./Vector.js";
import CanvasVectorLayerRenderer from "../renderer/canvas/VectorLayer.js";
import VectorSource from "../source/Vector.js";
import GeoJSON from "../format/GeoJSON.js";
import { all, bbox } from "../loadingstrategy.js";
import { get, transformExtent } from "../proj.js";

import { getCollection } from "../daemon/backend";
import Axios from "axios";

/**
 * @classdesc
 * Vector data from old UGIS backend.
 *
 * @extends {VectorLayer}
 * @api
 */
export default class UgisVectorLayer extends VectorLayer {
  /**
   * @param {import("./BaseVector.js").Options=} opt_options Options.
   */
  constructor(opt_options) {
    super(opt_options);

    /**
     * Used for reading the responce from ArcGIS Server
     * @type {GeoJSON}
     * @private
     */
    this._format = new GeoJSON();

    this._collection = getCollection(this.layerInfo.collectionName);
    this.setSource(this._createSource());

    // load data if 'all'
  }

  /**
   * Create a renderer for this layer.
   * @return {import("../renderer/Layer.js").default} A layer renderer.
   */
  createRenderer() {
    return new CanvasVectorLayerRenderer(this);
  }

  /**
   * Creates a new Source.
   * @private
   * @return {VectorSource}
   */
  _createSource() {
    return new VectorSource({
      strategy: this.layerInfo.strategy === "all" ? all : bbox,
      loader: async (extent, resolution, projection) => {
        // initial extent can be set in the config when stategy=all
        if (this.layerInfo.strategy === "all") {
          extent = get(this.layerInfo.sourceCRS).getExtent();
        } else {
          extent = transformExtent(
            extent,
            projection,
            this.layerInfo.sourceCRS
          );
        }

        let url = `${this.layerInfo.layerUrl}${
          this.layerInfo.collectionName
        }/${extent.join(",")}`;

        const responce = await Axios.get(url);
        const data = await responce.data;

        let features = this._format.readFeatures(data, {
          dataProjection: this.layerInfo.sourceCRS,
          featureProjection: projection.getCode(),
        });

        this.addFeatures(features);
      },
    });
  }
}
