import { getLength, getArea } from '../../sphere';
import { toRadians, toDegrees } from '../../math';

/**
 * WGS84 semi-major axis in meters - used as approximation of Earth's radius
 * @private
 * @type {Number}
 */
const WGS84_a = 6378137.0;
/**
 * WGS84 semi-minor axis in meters
 * @private
 * @type {Number}
 */
const WGS84_b = 6356752.3142;
/**
 * WGS84 inverse flattering (1/f)
 * @private
 * @type {Number}
 */
const WGS84_f = 1 / 298.257223563;

/**
 * Get the length of a geometry projected on a sphere.
 * @param {import('../../geom').Geometry} geometry - geometry to transform
 * @param {String} [projection='EPSG:3857']
 * @param {Number} [radius=6378137.0]
 */
export const getLengthOnSphere = (geometry, projection = 'EPSG:3857', radius = WGS84_a) => {
  return getLength(geometry, { radius: radius, projection: projection });
};

/**
 * Get the area of a geometry projected on a sphere.
 * @param {import('../../geom').Geometry} geometry - geometry to transform
 * @param {String} [projection='EPSG:3857']
 * @param {Number} [radius=6378137.0]
 */
export const getAreaOnSphere = (geometry, projection = 'EPSG:3857', radius = WGS84_a) => {
  return getArea(geometry, { radius: radius, projection: projection });
};

/**
 * Calculate bearing on sphere (WGS84 radius) between two points.
 * @param {!import('../../coordinate').Coordinate} start - lon, lat coordinates
 * @param {!import('../../coordinate').Coordinate} end - lon, lat coordinates
 * @return {Number} - bearing in degrees
 */
export const bearingOnSphere = (start, end) => {
  const phi1 = toRadians(start[1]);
  const l1 = toRadians(start[0]);
  const phi2 = toRadians(end[1]);
  const l2 = toRadians(end[0]);

  const y = Math.sin(l2 - l1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(l2 - l1);

  let angle = toDegrees(Math.atan2(y, x));
  //angle += 5;
  angle = (angle + 360) % 360;

  return angle;
};

/**
 * Calculate distance on Sphere (WGS84 radius). Uses equirectangular approximation. *
 * @param {!import('../../coordinate').Coordinate} start - lon, lat coordinates
 * @param {!import('../../coordinate').Coordinate} end - lon, lat coordinates
 * @return {Number} distance in meters
 * @see https://www.movable-type.co.uk/scripts/latlong.html
 */
export const distanceOnSphere = (start, end) => {
  const phi1 = toRadians(start[1]);
  const l1 = toRadians(start[0]);
  const phi2 = toRadians(end[1]);
  const l2 = toRadians(end[0]);

  const x = (l2 - l1) * Math.cos((phi1 + phi2) / 2);
  const y = phi2 - phi1;

  return Math.sqrt(x * x + y * y) * WGS84_a;
};

/**
 * Calculates coordinates of target point by distance and bearing
 * @param {!import('../../coordinate').Coordinate} start - lon, lat coordinates
 * @param {!Number} distance - distance in meters
 * @param {!Number} bearing - bearing in degrees
 * @return {Array.<Number>} coordinates of target point in lon, lat
 */
export const calculateOnSphere = (start, distance, bearing) => {
  const delta = Number(distance) / WGS84_a;
  const tita = toRadians(Number(bearing));

  const phi1 = toRadians(start[1]);
  const lam1 = toRadians(start[0]);

  const sinPhi1 = Math.sin(phi1),
    cosPhi1 = Math.cos(phi1);
  const sinDelta = Math.sin(delta),
    cosDelta = Math.cos(delta);
  const sinTita = Math.sin(tita),
    cosTita = Math.cos(tita);

  const sinPhi2 = sinPhi1 * cosDelta + cosPhi1 * sinDelta * cosTita;
  let phi2 = Math.asin(sinPhi2);
  const y = sinTita * sinDelta * cosPhi1;
  const x = cosDelta - sinPhi1 * sinPhi2;
  let lam2 = lam1 + Math.atan2(y, x);

  return [((toDegrees(lam2) + 540) % 360) - 180, toDegrees(phi2)];
};

// /**
//  * Calculates the geodetic distance between two points using the Vincenty inverse formula for ellipsoids.
//  *
//  * Taken from http://movable-type.co.uk/scripts/latlong-vincenty.html and optimized / cleaned up
//  * by Mathias Bynens <http://mathiasbynens.be/>
//  * Based on the Vincenty direct formula by T. Vincenty, “Direct and Inverse Solutions of Geodesics
//  * on the Ellipsoid with application of nested equations”, Survey Review, vol XXII no 176, 1975
//  * <http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf>
//  *
//  * @param {!import('../../coordinate').Coordinate} start - first point coordinates in decimal degrees - lon, lat
//  * @param {!import('../../coordinate').Coordinate} end - end point coordinates in decimal degrees - lon, lat
//  * @return {Object} result
//  */
// export const distanceBearingOnEllipsoid = (start, end) => {
//   const p1 = start,
//     p2 = end;
//   if (p1.lon == -180) p1.lon = 180;
//   const phi1 = toRadians(p1[1]),
//     lamb1 = toRadians(p1[0]);
//   const phi2 = toRadians(p2[1]),
//     lamb2 = toRadians(p2[0]);

//   const a = WGS84_a,
//     b = WGS84_b,
//     f = WGS84_f;

//   const L = lamb2 - lamb1;
//   const tanU1 = (1 - f) * Math.tan(phi1),
//     cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
//     sinU1 = tanU1 * cosU1;
//   const tanU2 = (1 - f) * Math.tan(phi2),
//     cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2),
//     sinU2 = tanU2 * cosU2;

//   let sinLamb,
//     cosLamb,
//     sinSqsigma,
//     sinsigma = 0,
//     cossigma = 0,
//     sigma = 0,
//     sinalpha,
//     cosSqalpha = 0,
//     cos2sigmaM = 0,
//     C;

//   let lambda = L,
//     lambdaPrim,
//     iterations = 0,
//     antimeridian = Math.abs(L) > Math.PI;
//   do {
//     sinLamb = Math.sin(lambda);
//     cosLamb = Math.cos(lambda);
//     sinSqsigma = cosU2 * sinLamb * (cosU2 * sinLamb) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamb) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamb);
//     if (sinSqsigma == 0) break; // co-incident points
//     sinsigma = Math.sqrt(sinSqsigma);
//     cossigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamb;
//     sigma = Math.atan2(sinsigma, cossigma);
//     sinalpha = (cosU1 * cosU2 * sinLamb) / sinsigma;
//     cosSqalpha = 1 - sinalpha * sinalpha;
//     cos2sigmaM = cosSqalpha != 0 ? cossigma - (2 * sinU1 * sinU2) / cosSqalpha : 0; // equatorial line: cosSqalpha=0 (§6)
//     C = (f / 16) * cosSqalpha * (4 + f * (4 - 3 * cosSqalpha));
//     lambdaPrim = lambda;
//     lambda = L + (1 - C) * f * sinalpha * (sigma + C * sinsigma * (cos2sigmaM + C * cossigma * (-1 + 2 * cos2sigmaM * cos2sigmaM)));
//     var iterationCheck = antimeridian ? Math.abs(lambda) - Math.PI : Math.abs(lambda);
//     if (iterationCheck > Math.PI) throw new Error('lambda > π');
//   } while (Math.abs(lambda - lambdaPrim) > 1e-12 && ++iterations < 1000);
//   if (iterations >= 1000) throw new Error('Formula failed to converge');

//   const uSq = (cosSqalpha * (a * a - b * b)) / (b * b);
//   const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
//   const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
//   const deltaSigma =
//     B *
//     sinsigma *
//     (cos2sigmaM +
//       (B / 4) *
//         (cossigma * (-1 + 2 * cos2sigmaM * cos2sigmaM) - (B / 6) * cos2sigmaM * (-3 + 4 * sinsigma * sinsigma) * (-3 + 4 * cos2sigmaM * cos2sigmaM)));

//   const s = b * A * (sigma - deltaSigma);

//   let alpha1 = Math.atan2(cosU2 * sinLamb, cosU1 * sinU2 - sinU1 * cosU2 * cosLamb);
//   let alpha2 = Math.atan2(cosU1 * sinLamb, -sinU1 * cosU2 + cosU1 * sinU2 * cosLamb);

//   alpha1 = (alpha1 + 2 * Math.PI) % (2 * Math.PI); // normalise to 0..360
//   alpha2 = (alpha2 + 2 * Math.PI) % (2 * Math.PI); // normalise to 0..360

//   return {
//     distance: s,
//     initialBearing: s == 0 ? NaN : toDegrees(alpha1),
//     finalBearing: s == 0 ? NaN : toDegrees(alpha2),
//     iterations: iterations
//   };
// };

// /**
//  * Calculates the geodetic distance between two points using the Vincenty inverse formula for ellipsoids.
//  *
//  * Taken from http://movable-type.co.uk/scripts/latlong-vincenty.html and optimized / cleaned up
//  * by Mathias Bynens <http://mathiasbynens.be/>
//  * Based on the Vincenty direct formula by T. Vincenty, “Direct and Inverse Solutions of Geodesics
//  * on the Ellipsoid with application of nested equations”, Survey Review, vol XXII no 176, 1975
//  * <http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf>
//  *
//  * @param {!import('../../coordinate').Coordinate} start - first point coordinates in decimal degrees - lon, lat
//  * @param {!import('../../coordinate').Coordinate} end - end point coordinates in decimal degrees - lon, lat
//  * @return {Number} distance in meters
//  */
// export const distanceOnEllipsoid = (start, end) => {
//   const result = distanceBearingOnEllipsoid(start, end);
//   return result.distance;
// };

/**
 * Calculates the destination point given start point latitude / longitude (numeric degrees),
 * bearing (numeric degrees) and distance (in m).
 *
 * Taken from http://movable-type.co.uk/scripts/latlong-vincenty-direct.html and
 * optimized / cleaned up by Mathias Bynens <http://mathiasbynens.be/>
 * Based on the Vincenty direct formula by T. Vincenty, “Direct and Inverse Solutions
 * of Geodesics on the Ellipsoid with application of nested equations”, Survey Review,
 * vol XXII no 176, 1975 <http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf>
 *
 * @param {!import('../../coordinate').Coordinate} start - lon, lat coordinates
 * @param {!Number} distance - distance in meters
 * @param {!Number} bearing - bearing in degrees
 * @return {import('../../coordinate').Coordinate} coordinates of target point in lon, lat
 */
export const calculateOnEllipsoid = (start, distance, bearing) => {
  let a = WGS84_a,
    b = WGS84_b,
    f = WGS84_f,
    s = distance,
    alpha1 = toRadians(bearing),
    sinAlpha1 = Math.sin(alpha1),
    cosAlpha1 = Math.cos(alpha1),
    tanU1 = (1 - f) * Math.tan(toRadians(start[1])),
    cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
    sinU1 = tanU1 * cosU1,
    sigma1 = Math.atan2(tanU1, cosAlpha1),
    sinAlpha = cosU1 * sinAlpha1,
    cosSqAlpha = 1 - sinAlpha * sinAlpha,
    uSq = (cosSqAlpha * (a * a - b * b)) / (b * b),
    A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
    B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
    sigma = s / (b * A),
    sinSigma = Math.sin(sigma),
    cosSigma = Math.cos(sigma),
    cos2SigmaM = Math.cos(2 * sigma1 + sigma),
    deltaSigma,
    sigmaP = 2 * Math.PI;
  while (Math.abs(sigma - sigmaP) > 1e-12) {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma);
    deltaSigma =
      B *
      sinSigma *
      (cos2SigmaM +
        (B / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    sigmaP = sigma;
    sigma = s / (b * A) + deltaSigma;
    sinSigma = Math.sin(sigma);
    cosSigma = Math.cos(sigma);
  }
  let tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
    lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
    lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
    C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
    L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
    revAz = Math.atan2(sinAlpha, -tmp); // final bearing
  return [start[0] + toDegrees(L), toDegrees(lat2)];
};

/**
 * Convert distance in meters to decimal degrees
 * @public
 * @param {!Number} meters - value to convert in meters
 * @param {Number} [latitude=0] - current latitude, default is 0 - the equator
 * @return {Number}
 */
export const metersToDegrees = (meters, latitude = 0) => {
  return meters / (111.32 * 1000 * Math.cos(toRadians(latitude)));
};

/**
 * Convert distance in decimal degrees to meters
 * @public
 * @param {!Number} degrees - value to convert in decimal degrees
 * @param {Number} [latitude=0] - current latitude, default is 0 - the equator
 * @return {Number}
 */
export const degreesToMeters = (degrees, latitude = 0) => {
  return degrees * (111.32 * 1000 * Math.cos(toRadians(latitude)));
};

export const calculateDirectionAngle = (pointA, pointB) => {
  const dX = pointB[0] - pointA[0];
  const dY = pointB[1] - pointA[1];
  let angle;

  if (dX == 0 && dY > 0) {
    return 90;
  }
  if (dX < 0 && dY == 0) {
    return 180;
  }
  if (dX == 0 && dY < 0) {
    return 270;
  }
  if (dX > 0 && dY == 0) {
    return 0;
  }

  angle = toDegrees(Math.atan(Math.abs(dY) / Math.abs(dX)));

  if (dX > 0 && dY > 0) {
    return angle;
  }
  if (dX < 0 && dY > 0) {
    return 180 - angle;
  }
  if (dX < 0 && dY < 0) {
    return 180 + angle;
  }
  if (dX > 0 && dY < 0) {
    return 360 - angle;
  }
};
