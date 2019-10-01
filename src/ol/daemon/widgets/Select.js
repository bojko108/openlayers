/**
 * @module ol/daemon/widgets/SelectWidget
 */
import DragBox from '../../interaction/DragBox';
import Widget from './Widget';
import MapBrowserEventType from '../../MapBrowserEventType';

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
 * Select widget can be used to select features from the map. The user can
 * select features by clicking on the map or drawing a box. There are methods
 * for selecting features programmatically: `selectFeature`, `selectFeatures`,
 * `deselectFeature`, `deselectFeatures`.
 *
 * @extends {Widget}
 */
export default class SelectWidget extends Widget {
  /**
   * Creates a new Select Widget
   * @param {import('./Widget').WidgetConfig} options
   */
  constructor(options) {
    /**
     * @param {import('../../MapBrowserEventType')} event
     */
    // @ts-ignore
    options.handler = event => this.__handleMapEvent(event);
    options.mapEventType = options.mapEventType || MapBrowserEventType.SINGLECLICK;

    // @ts-ignore
    super(options);

    /**
     * dragbox interaction for selecting features with polygon
     * @private
     * @type {DragBox}
     * @see http://openlayers.org/en/latest/apidoc/ol.interaction.DragBox.html
     */
    this._dragBoxInteraction = new DragBox({ className: 'dm-dragbox', onBoxEnd: () => this.__onDragBoxEnd() });
    this._dragBoxInteraction.setActive(false);

    /**
     * hit-detection tolerance in pixelss
     * @type {Number}
     */
    this._hitTolerance = options.hitTolerance || 5;

    /**
     * if `true` selection will be extended and not cleared on new features
     * @type {Boolean}
     */
    this._addToSelection = options.addToSelection !== undefined ? options.addToSelection : false;

    /**
     * Array of crrently selected features
     * @type {Array<import('../../Feature').default|import('../../render/Feature').default>}
     */
    this._selected = [];

    // this listener sets feature state to `selected`
    this.on(SelectionEventType.CHANGED, this.__setSelectedState);

    if (this.map) {
      this.map.addInteraction(this._dragBoxInteraction);
    }

    if (this.active) {
      this.activate(this._addToSelection);
    }
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

  /**
   * Get currently selected features
   * @return {Array<import('../../Feature').default|import('../../render/Feature').default>}
   */
  getSelection() {
    return this._selected;
  }

  /**
   * Check if a feature is selected or not
   * @param {import('../../Feature').default|import('../../render/Feature').default} feature
   * @return {Boolean}
   */
  isSelected(feature) {
    return this._selected.indexOf(feature) > -1;
  }

  /**
   * Activates Select Widget. This method only activates map interactions. You can use
   * `selectFeature`, `selectFeatures`, `deselectFeature`, `deselectFeatures` to select features
   * programmatically.
   * @param {Boolean} [singleSelect]
   * @param {Boolean} [addToSelection] - if `true` any selected features will be added to the
   * existing selection array
   */
  activate(singleSelect = false, addToSelection = false) {
    this.addToSelection = addToSelection;
    this.active = true;
    if (!singleSelect) {
      this._dragBoxInteraction.setActive(true);
    }
  }

  /**
   * Deactivates Select Widget and DragBox interaction. This method only deactivates map interactions.
   * You can use `selectFeature`, `selectFeatures`, `deselectFeature`, `deselectFeatures` to select
   * features programmatically.
   * @param {Boolean} [clearSelection=false] clear the existing selection or not
   */
  deactivate(clearSelection = false) {
    if (clearSelection) {
      this.clearSelection();
    }
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

  /**
   * Select a single feature
   * @param {import('../../Feature').default|import('../../render/Feature').default} feature
   */
  selectFeature(feature) {
    this.selectFeatures([feature]);
  }

  /**
   * Select an array of features
   * @param {Array<import('../../Feature').default|import('../../render/Feature').default>} features
   */
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

  /**
   * Remove a single feature from current selection
   * @param {import('../../Feature').default|import('../../render/Feature').default} feature
   */
  deselectFeature(feature) {
    this.deselectFeatures([feature]);
  }

  /**
   * Remove an array of features from current selection
   * @param {Array<import('../../Feature').default|import('../../render/Feature').default>} features
   */
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

  /**
   * Clear the current map selection.
   * @param {Boolean} [notify=true] emit selection changed event or not
   */
  clearSelection(notify = true) {
    this.__clearSelectedState(this._selected);
    this._selected = [];
    if (notify) {
      this.emit(SelectionEventType.CHANGED, this._selected);
    }
  }

  /**
   * Set selected state for an array of features
   * @private
   * @param {Array<import('../../Feature').default|import('../../render/Feature').default>} selection
   */
  __setSelectedState(selection) {
    // @ts-ignore
    selection.forEach(feature => feature.setSelected(true));
  }

  /**
   * Clear selected state for an array of features
   * @private
   * @param {Array<import('../../Feature').default|import('../../render/Feature').default>} selection
   */
  __clearSelectedState(selection) {
    // @ts-ignore
    selection.forEach(feature => feature.setSelected(false));
  }

  /**
   * This method is called when the user finish drawing a selection box
   * @private
   */
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

  /**
   * This method is called when the user clicks on the map
   * @private
   * @param {import('../../MapBrowserEvent').default} event
   */
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
