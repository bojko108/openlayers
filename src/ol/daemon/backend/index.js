import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';

/**
 * @type {Object}
 */
let backendApp;
/**
 * @type {Object}
 */
let restClient;

export const initializeBackend = baseUrl => {
  restClient = rest(baseUrl);

  backendApp = feathers();
  backendApp.configure(restClient.fetch(window.fetch));
};

/**
 *
 * @param {!String} collectionName
 */
export const getCollection = collectionName => {
  return backendApp.service(collectionName);
};
