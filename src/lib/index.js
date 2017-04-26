import path from 'path';
import nunjucks from 'nunjucks';
// import baseContext from '../defaults.json'; // eslint-disable-line import/no-unresolved
import setupEnv from './setupEnv';
// import validateContext from './validateContext';
import * as filters from './filters';
import * as globals from './globals';

// Object.freeze(baseContext);

const searchPath = path.resolve(__dirname, '..');

export {
  /**
   * In case you need to pass a nunjucks instance over a VM boundary to get SafeString to work.
   */
  nunjucks,

  // baseContext,
  setupEnv,
  filters,
  globals,
  searchPath,
  // validateContext,
};
