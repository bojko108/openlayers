/**
 * @typedef {Object} CustomProjection
 * @property {!string} epsgCode - EPSG code for the projection (or custom one)
 * @property {!string} definition - proj4 definition for the projection.
 * For existing projections can be found in {@link https://epsg.io/{code}}
 * @property {string} [description] - description for this projection
 */

/**
 * @type {Array<CustomProjection>}
 */
export default [
  {
    epsgCode: 'EPSG:9802',
    description: 'Bulgarian Cadastral Coordinate System - BGS 2005 (Lambert Conformal Conic 2SP)',
    definition:
      '+proj=lcc +lat_1=42.0 +lat_2=43.3333333 +lat_0=42.6678756833333 +lon_0=25.5 +x_0=500000 +y_0=4725824.3591 +a=6378137 +b=6356752.314140347 +units=m +no_defs'
  },
  {
    epsgCode: 'EPSG:32635',
    description: 'Universal Transverse Mercator Zone 35 North',
    definition: '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs'
  },
  {
    epsgCode: 'EPSG:31700',
    description: 'Dealul Piscului 1970/ Stereo 70 used in Romania',
    definition: '+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=28,-121,-77,0,0,0,0 +units=m +no_defs'
  }
];
