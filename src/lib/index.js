import path from 'path';
// import baseContext from '../defaults.json'; // eslint-disable-line import/no-unresolved
import setupEnv from './setupEnv';
// import validateContext from './validateContext';
import * as filters from './filters';
import * as globals from './globals';

// Object.freeze(baseContext);

const searchPath = path.resolve(__dirname, '..');

export {
  // baseContext,
  setupEnv,
  filters,
  globals,
  searchPath,
  // validateContext,
};
