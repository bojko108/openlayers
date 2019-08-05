/**
 * @typedef LayerInfoOptions
 * @property {String} name
 * @property {String} [type='vector']
 * @property {String} [title='Layer']
 * @property {String} [objectIdField='fid']
 * @property {String} [layerId]
 * @property {String} [layerUrl]
 * @property {String} [collectionName]
 * @property {String} [provider]
 * @property {String} [icon]
 * @property {String} [sourceCRS]
 * @property {String} [gdbVersion='']
 * @property {Array} [fields=[]]
 * @property {Array} [relationships=[]]
 * @property {Boolean} [editable=false]
 * @property {Boolean} [snappable=false]
 * @property {Boolean} [selectable=false]
 * @property {Boolean} [printable=false]
 * @property {Boolean} [searchable=false]
 * @property {Boolean} [showLabels=true]
 * @property {Boolean} [showInLegend=true]
 * @property {Boolean} [disabledInLegend=false]
 * @property {Boolean} [displayPopupsOnHover=false]
 * @property {Boolean} [displayPopupsOnClick=false]
 * @property {Number} [minScale=1]
 * @property {Number} [maxScale=100000000]
 * @property {Array<import('../../styles/defaultStyle').StyleType>} [styles]
 * @property {Array<import('../../styles/defaultStyle').LabelType>} [labels]
 */

export default {
  type: 'vector',
  title: 'Layer',
  objectIdField: 'fid',
  gdbVersion: '',
  fields: [],
  relationships: [],
  editable: false,
  snappable: false,
  selectable: false,
  printable: false,
  searchable: false,
  showLabels: true,
  showInLegend: true,
  disabledInLegend: false,
  displayPopupsOnHover: false,
  displayPopupsOnClick: false,
  minScale: 1,
  maxScale: 100000000,
  styles: [],
  labels: []
};
