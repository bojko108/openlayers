/**
 * @module ol/layer/DaemonVectorLayer
 */
import VectorLayer from "./Vector.js";
import CanvasVectorLayerRenderer from "../renderer/canvas/VectorLayer.js";
import VectorSource from "../source/Vector.js";
import GeoJSON from "../format/GeoJSON.js";
import { bbox } from "../loadingstrategy.js";
import { transformExtent } from "../proj.js";

import { getCollection } from "../daemon/backend";

/**
 * @classdesc
 * Vector data from UGIS backend.
 *
 * @extends {VectorLayer}
 * @api
 */
export default class DaemonVectorLayer extends VectorLayer {
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
   * Creates a new Source - loads features from ArcGIS Server with BBOX strategy.
   * @private
   */
  _createSource() {
    return new VectorSource({
      strategy: bbox,
      loader: (extent, resolution, projection) => {
        extent = transformExtent(extent, projection, this.layerInfo.sourceCRS);
        const { data } = this._collection.find({
          query: {
            bbox: {
              type: "Polygon",
              coordinates: [extent]
            }
          }
        });

        console.log(data);
      }
    });
  }
}
