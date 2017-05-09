// @flow

import path from 'path';
import autoRegister from './autoRegister';
import wrapHelper from './wrapHelper';
import * as _helpers from './helpers';

const helpers = Object.keys(_helpers).reduce((acc, name) => ({
  ...acc,
  [name]: wrapHelper(_helpers[name], name),
}), {});

const searchPath = path.resolve(__dirname, '..');

export {
  autoRegister,
  searchPath,
  helpers,
};
