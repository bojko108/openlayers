import Domain from './Domain';
import Field from './Field';

/**
 * all domains are cached here
 * @private
 * @type {Object.<String,*>}
 */
let domains = {};

/**
 * Checks if the domains cache has a domain specified by name.
 * @param {!String} name
 * @return {Boolean}
 */
const hasDomain = name => {
  return domains[name] !== undefined;
};

/**
 * Adds a domain to the cache and returns it.
 * @public
 * @param {!Domain} domain
 * @return {Domain}
 */
const addDomain = domain => {
  if (hasDomain(domain.name) == false) {
    domains[domain.name] = domain instanceof Domain ? domain : new Domain(domain);
  }
  return domains[domain.name];
};

/**
 * Gets a domain from the cache specified by name.
 * @public
 * @param {!String} name
 * @return {Domain}
 */
const getDomain = name => {
  return domains[name];
};

export { addDomain, getDomain, hasDomain, Domain, Field };
