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
  SELECTION_CHANGED: 'changed'
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
    this._dragBoxInteraction = new DragBox({ onBoxEnd: () => this.__onDragBoxEnd() });
    this._dragBoxInteraction.setActive(false);

    this._hitTolerance = options.hitTolerance || 5;

    /**
     * @type {Boolean}
     */
    this._addToSelection = options.addToSelection !== undefined ? options.addToSelection : false;

    this._selected = new Set();

    this.on(SelectionEventType.SELECTION_CHANGED, ({ selected, deselected }) => {
      selected.forEach(feature => feature.setSelected(true));
      deselected.forEach(feature => feature.setSelected(false));
    });
  }

  /**
   * If `true` any selected features will be added to the existing selection set
   * @type {Boolean}
   */
  get addToSelection() {
    return this._addToSelection;
  }
  /**
   * Set add to selection parameter
   * @param {Boolean} value - if `true` any selected features will be added to the existing selection set
   */
  set addToSelection(value) {
    this._addToSelection = value;
  }

  getSelection() {
    return [...this._selected];
  }

  isSelected(feature) {
    return this._selected.has(feature);
  }

  /**
   * Activates Select Widget
   * @param {Boolean} [addToSelection] - if `true` any selected features will be added to the existing selection set
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

  selectFeatures(features) {}

  deselectFeature(feature) {
    this.deselectFeatures([feature]);
  }

  deselectFeatures(features) {}

  clearSelection() {
    this.emit(SelectionEventType.SELECTION_CHANGED, { selected: [], deselected: [...this._selected] });
    this._selected.clear();
  }

  __onDragBoxEnd() {
    let selectionChanged = false;
    let deselected = [];
    const extent = this._dragBoxInteraction.getGeometry().getExtent();

    if (!this._addToSelection) {
      this.clearSelection();
    }

    this.map.selectableLayers.forEach(layer => {
      // @ts-ignore
      const source = layer.getSource();
      source.forEachFeatureIntersectingExtent(extent, feature => {
        // disable this to replace selection
        if (this._addToSelection) {
          // @ts-ignore
          if (this.isSelected(feature) === false) {
            this._selected.add(feature);
            selectionChanged = true;
          }
        } else {
          // @ts-ignore
          if (this.isSelected(feature) === false) {
            this._selected.add(feature);
            selectionChanged = true;
          } else {
            this._selected.delete(feature);
            deselected.push(feature);
            selectionChanged = true;
          }
        }
      });
    });

    if (selectionChanged) {
      this.emit(SelectionEventType.SELECTION_CHANGED, { selected: [...this._selected], deselected });
    }
  }

  __handleMapEvent(event) {
    let selectionChanged = false;
    let deselected = [];

    if (!this._addToSelection) {
      this.clearSelection();
    }

    this.map.forEachFeatureAtPixel(
      event.pixel,
      feature => {
        // disable this to replace selection
        if (this._addToSelection) {
          // @ts-ignore
          if (this.isSelected(feature) === false) {
            this._selected.add(feature);
            selectionChanged = true;
          }
        } else {
          // @ts-ignore
          if (this.isSelected(feature) === false) {
            this._selected.add(feature);
            selectionChanged = true;
          } else {
            this._selected.delete(feature);
            deselected.push(feature);
            selectionChanged = true;
          }
        }
      },
      {
        layerFilter: layer => layer.layerInfo.selectable,
        hitTolerance: this._hitTolerance
      }
    );

    if (selectionChanged) {
      this.emit(SelectionEventType.SELECTION_CHANGED, { selected: [...this._selected], deselected });
      event.stopPropagation();
    }
  }
}
