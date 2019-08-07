/**
 * @module ol/daemon/widgets/SelectWidget
 */
import DragBox from '../../interaction/DragBox';
import Widget from './Widget';

/**
 * Constants for selection event types.
 * @enum {String}
 */
export const SelectionEventType = {
  /**
   * Emitted when selection is changed
   */
  CHANGED: 'changed'
};

/**
 * @classdesc
 * @api
 */
export default class SelectWidget extends Widget {
  // add condition

  constructor(options = {}) {
    /**
     * @param {import('../../MapBrowserEventType')} event
     */
    options.handler = event => this.__handleMapEvent(event);

    super(options);

    /**
     * dragbox interaction for selecting features with polygon
     * @private
     * @type {DragBox}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.DragBox.html
     */
    this._dragBoxInteraction = new DragBox({ className: 'dm-dragbox', onBoxEnd: () => this.__onDragBoxEnd() });
    this._dragBoxInteraction.setActive(false);

    this._hitTolerance = options.hitTolerance || 5;

    /**
     * @type {Boolean}
     */
    this._addToSelection = options.addToSelection !== undefined ? options.addToSelection : false;

    this._selected = [];

    this.on(SelectionEventType.CHANGED, this.__setSelectedState);
  }

  /**
   * If `true` any selected features will be added to the existing selection array
   * @type {Boolean}
   */
  get addToSelection() {
    return this._addToSelection;
  }
  /**
   * Set add to selection parameter
   * @param {Boolean} value - if `true` any selected features will be added to the existing selection array
   */
  set addToSelection(value) {
    this._addToSelection = value;
  }

  getSelection() {
    return this._selected;
  }

  isSelected(feature) {
    return this._selected.indexOf(feature) > -1;
  }

  /**
   * Activates Select Widget
   * @param {Boolean} [addToSelection] - if `true` any selected features will be added to the existing selection array
   */
  activate(addToSelection = false) {
    this.addToSelection = addToSelection;
    this.active = true;
    this._dragBoxInteraction.setActive(true);
  }

  /**
   * Deactivates Select Widget and DragBox interaction
   */
  deactivate() {
    this.clearSelection();
    this.active = false;
    this._dragBoxInteraction.setActive(false);
  }

  /**
   * Set widget's map
   * @param {import("../../Map").default} map Map.
   */
  setMap(map) {
    this.map = map;
    this.map.addInteraction(this._dragBoxInteraction);
  }

  selectFeature(feature) {
    this.selectFeatures([feature]);
  }

  selectFeatures(features) {
    if (!this._addToSelection) {
      this.clearSelection(false);
    }

    let oldSelectionCount = this._selected.length;

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      if (this.isSelected(feature) === false) {
        this._selected.push(feature);
      }
    }

    if (oldSelectionCount < this._selected.length) {
      this.emit(SelectionEventType.CHANGED, this._selected);
    }
  }

  deselectFeature(feature) {
    this.deselectFeatures([feature]);
  }

  deselectFeatures(features) {
    let deselected = [];

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      if (this.isSelected(feature)) {
        const index = this._selected.indexOf(feature);
        this._selected.splice(index, 1);
        deselected.push(feature);
      }
    }

    if (deselected.length > 0) {
      this.__clearSelectedState(deselected);
      this.emit(SelectionEventType.CHANGED, this._selected);
    }
  }

  clearSelection(notify = true) {
    this.__clearSelectedState(this._selected);
    this._selected = [];
    if (notify) {
      this.emit(SelectionEventType.CHANGED, this._selected);
    }
  }

  __setSelectedState(selection) {
    selection.forEach(feature => feature.setSelected(true));
  }
  __clearSelectedState(selection) {
    selection.forEach(feature => feature.setSelected(false));
  }

  __onDragBoxEnd() {
    const extent = this._dragBoxInteraction.getGeometry().getExtent();

    if (!this.addToSelection) {
      this.clearSelection(false);
    }

    let oldSelectionCount = this._selected.length;

    this.map.selectableLayers.forEach(layer => {
      // @ts-ignore
      layer.getSource().forEachFeatureIntersectingExtent(extent, feature => {
        // @ts-ignore
        if (this.isSelected(feature) === false) {
          this._selected.push(feature);
        }
      });
    });

    if (oldSelectionCount < this._selected.length) {
      this.emit(SelectionEventType.CHANGED, this._selected);
    }
  }

  __handleMapEvent(event) {
    if (!this._addToSelection) {
      this.clearSelection(false);
    }

    let oldSelectionCount = this._selected.length;

    this.map.forEachFeatureAtPixel(
      event.pixel,
      feature => {
        // @ts-ignore
        if (this.isSelected(feature) === false) {
          this._selected.push(feature);
        }
      },
      {
        layerFilter: layer => layer.layerInfo.selectable,
        hitTolerance: this._hitTolerance
      }
    );

    if (oldSelectionCount < this._selected.length) {
      this.emit(SelectionEventType.CHANGED, this._selected);
      event.stopPropagation();
    }
  }
}
