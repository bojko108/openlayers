/**
 * @type {import('../Map').default}
 */
let map = undefined;
/**
 * @type {import('../proj/Projection').default}
 */
let mapProjection = undefined;

export const getMapProjection = () => {
  return mapProjection;
};

export const setMapProjection = projection => {
  mapProjection = projection;
};

/**
 * @return {import('../Map').default}
 */
export const getMap = () => {
  return map;
};

/**
 * @param {import('../Map').default} createdMap
 */
export const setMap = createdMap => {
  map = createdMap;
  mapProjection = map.getProjection();

  if (window && process.env.NODE_ENV !== 'production') {
    console.log('map created');
    // @ts-ignore
    window.mapp = map;
  }
};
