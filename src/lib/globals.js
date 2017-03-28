import fs from 'fs';
import path from 'path';
import _ from 'lodash';

export const now = () => Date.now();

export const origamiBuildServiceURL = (modules, type = 'js', environment) => {
  const modulesList = Object.keys(modules).map(name => `${name}@${modules[name]}`)
    .join(',');

  const queryExtra = (environment === 'development' ? '&minify=none' : '');

  return `https://www.ft.com/__origami/service/build/v2/bundles/${type}?modules=${modulesList}${queryExtra}`;
};

/** Model for FT site navigation. */
export nav from './nav.js';

/** Default Origami modules to use */
export const defaultOrigamiModules = (() => {
  const bowerJSON = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'bower.json'),
    'utf8',
  );

  const bowerDeps = JSON.parse(bowerJSON).dependencies;
  const ftModules = _.pickBy(bowerDeps, (value, key) => /[on]-/.test(key));

  return {
    ...ftModules,
  };
})();

/**
 * Miscellaneous JS globals, plus lodash.
 */
export {
  Array,
  Date,
  JSON,
  Math,
  Number,
  Object,
  _,
};
