import { extend, createEmpty } from '../../extent';

/**
 * Calculate center point for an extent
 * @param {!import('../../extent').Extent} extent
 * @return {import('../../coordinate').Coordinate}
 * @example
 * const extent = [23.113992717022004, 42.61792529145001, 23.541353252452907, 42.773304813773194]
 * const center = calculateCenterPointOfExtent(extent))
 * // [23.327672984737454, 42.6956150526116]
 */
export const calculateCenterPointOfExtent = extent => {
  return [(extent[2] + extent[0]) / 2, (extent[3] + extent[1]) / 2];
};

/**
 * Calculate the bounding extent for an array of features
 * @param {!Array<import('../../Feature').default>} features
 * @return {import('../../extent').Extent}
 */
export const calculateFeaturesExtent = features => {
  let extent = createEmpty();
  features.forEach(feature => {
    extent = extend(extent, feature.getGeometry().getExtent());
  });
  return extent;
};
