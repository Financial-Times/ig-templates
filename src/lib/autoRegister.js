// @flow

import handlebars from 'handlebars';
import * as helpers from './helpers';
import templates from './templates';
import wrapHelper from './wrapHelper';
import type { TemplateHelper } from './types';

const autoRegister = (Handlebars: (typeof handlebars) = handlebars.create()) => {
  Object.keys(helpers).forEach((name) => {
    (helpers[name]: TemplateHelper); // eslint-disable-line no-unused-expressions

    const wrapper = wrapHelper(helpers[name], name);

    Handlebars.registerHelper(name, wrapper);
  });

  ['layouts', 'partials'].forEach((kind) => {
    Object.keys(templates[kind]).forEach((name) => {
      const templateString = templates[kind][name];

      Handlebars.registerPartial(name, templateString);
    });
  });
};

export default autoRegister;
