import { register } from '../../proj/proj4.js';
import proj4 from 'proj4';
import predefinedProjections from './predefinedProjections';

/**
 * Registers all predefined custom projections to proj4 which can then be used in ol.
 * Predefined projections can be found in {@link module:predefinedProjections}
 */
export const initializePredefinedProjections = () => {
  const projections = predefinedProjections.map(({ epsgCode, definition }) => [epsgCode, definition]);
  proj4.defs(projections);
  register(proj4);
};
