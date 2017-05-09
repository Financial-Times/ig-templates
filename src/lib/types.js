// @flow

import { SafeString } from 'handlebars';

export type TemplateContext = {
  [string]: any,
};

export type TemplateHelperOptions = {
  fn?: (TemplateContext) => string | SafeString,
  inverse?: (TemplateContext) => string | SafeString,
  context: TemplateContext, // the current context
  data: TemplateContext, // complete data including 'root', 'first', 'index' etc.
};

/**
 * We flip this around so that the helper options are the first argument, not the last.
 */
export type TemplateHelper = (
  options: TemplateHelperOptions,
  ...args: Array<any>
) => string | SafeString;
