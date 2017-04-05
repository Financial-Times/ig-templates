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

  return _.pick(bowerDeps, [
    'o-header',
    // 'o-fonts',
    // 'o-footer',
    'o-grid',
    'o-typography',
    // 'o-loading',
    // 'o-teaser',
    // 'o-teaser-collection',
    'o-hoverable',
    'n-ui-foundations',
    'o-comment-count',
  ]);
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
  encodeURIComponent,
};

export const assert = (object, message = 'Assertion failed') => {
  if (!object) throw new Error(message);
};

export const anyExist = (...items) => items.some(item => item);

export const articleContentWidths = {
  default: 'calc(100% - 20px)',
  L: '620px',
  XL: '664.16px', // not sure what calculation is
};
