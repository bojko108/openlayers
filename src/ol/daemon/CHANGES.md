## Updating ol

https://help.github.com/en/articles/syncing-a-fork

```
git checkout master
git merge upstream/master
git checkout mapdaemon
```

## Added files

1. `daemon` directory
2. `ol/layer/ArcGISDynamicMapServiceLayer`
3. `ol/layer/DaemonVectorLayer`

## Changes

### Map

1. call `setMap(this)` to `ol/daemon/app` in constructor
2. New Methods

- get defaultLayer
- get center
- set center
- get zoom
- set zoom
- get rotation
- set rotation
- positionAt()
- zoomIn()
- zoomOut()
- get projection
- getProjection()
- setProjection()
- get basemaps
- get layers
- get selectableLayers
- get searchableLayers
- get snappableLayers
- get editableLayers
- setGDBVersion()
- getBasemapLayers()
- getVectorLayers()
- getLayer()
- getLayerBy()
- getLayersBy()
- getCenter()
- getVisibleExtent()
- setScale()
- getScale()
- getResolution()
- getScaleFromResolution() - this can be moved to `ol/daemon/helpers`
- getResolutionFromScale() - this can be moved to `ol/daemon/helpers`
- zoomToFID()
- zoomTo()
- zoomToExtent()
- panToFID()
- panTo()
- panToExtent()
- flashFID()
- flash()
- flashExtent()

### LayerInfo

`ol/layer/Property` to have a new property `metadata` containing options for `LayerInfo`

`ol/layer/Base` to have property `layerInfo`. Base layer now have getters `hasLayerInfo` and `layerInfo`

`ol/layer/Group` - set `metadata.type` = `'group'`

`ol/layer/BaseImage` - set `metadata.type` = `'image'`

`ol/layer/BaseTile` - set `metadata.type` = `'basemap'`

`ol/layer/BaseVector` - set `metadata.type` = `'vector'`

### layer.map

`ol/layer/Property` to have a new property `map`

Base layer now have getter `map`

`ol/PluggableMap`

- addLayer(): `layer.set(LayerProperty.MAP, this)`
- removeLayer(): `layer.set(LayerProperty.MAP, null)`

`ol/Map`

in constructor:

```js
// set map for each layer
// @ts-ignore
if (options.layers && options.layers.length > 0) {
  // @ts-ignore
  for (let i = 0; i < options.layers.length; i++) {
    options.layers[i].set(LayerProperty.MAP, this);
  }
}
```

### Feature

1. feature.getAttributes
2. feature.zoomTo
3. feature.panTo
4. feature.flash
5. feature.layer

- `setLayer()`
- getter `layer`

- `ol/layer/Layer.setSource()` sets the layer of the source

- `ol/source/Vector` changes:

- addFeatureInternal(): `feature.setLayer(this.layer)`
- addFeaturesInternal(): `feature.setLayer(this.layer)`

### Source

- `setLayer()`
- getter `layer`

### Additional methods for `ol/layer/Vector`

New properties `styles` and `labels` were added to LayerProperty

- get labels
- get styles
- setLabels()
- setStyles()
- getFeatures()
- getFeatureById()
- addFeatures()
- addFeature()
- removeFeatures()
- removeFeature()
- clearSource()
- find()
- mapProjectionChanged() - change to map.on('change:projection')...
- \_\_createLabels()
- \_\_createStyles()
- \_\_styleFunction()
- \_\_getLabelForResolution()
- \_\_getStyleForFeature()
- \_\_getMapResolutionFromScale()

### Vector Styles and Labels

### ol.css

```css
.map {
  background: #fff
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAAAAABzHgM7AAAAAnRSTlMAAHaTzTgAAAARSURBVHgBY3iKBFEAOp/+MgB+UQnYeBZPWAAAAABJRU5ErkJggg==) !important;
}
```
