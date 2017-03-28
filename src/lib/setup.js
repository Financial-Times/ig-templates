// helper function to augment an existing Nunjucks environment with all our stuff
// NB you still have to set the load paths though

import * as filters from './filters';
import * as globals from './globals';

export default (env) => {
  Object.keys(filters).forEach((name) => {
    env.addFilter(name, filters[name]);
  });

  Object.keys(globals).forEach((name) => {
    env.addGlobal(name, globals[name]);
  });
};
