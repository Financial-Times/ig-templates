// @flow

import type { TemplateHelper } from './types';
import log from './log';

/**
 * This curries functions so they work with Handlebars' API. It means our
 * functions (a) can be context-free and simpler to reason about (no `this`) and
 * (b) don't all have to do common error-checking.
 */
const wrapHelper = (unwrappedHelper: TemplateHelper, name: string) => {
  if (typeof unwrappedHelper !== 'function') throw new TypeError('Expected a function');
  if (typeof name !== 'string') throw new TypeError('Expected name to be a string');

  return function (...args: any[]) { // eslint-disable-line func-names
    const context = this;
    const options = args.pop();

    // pass in the context as a final arg, so helpers can be arrow functions
    try {
      return unwrappedHelper.call(context, { ...options, context }, ...args);
    } catch (error) {
      // eslint-disable-next-line no-console
      log(`Error from Handlebars helper "${name}": ${error && error.message}`);
      throw error;
    }
  };
};

export default wrapHelper;
