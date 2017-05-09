// @flow
/* eslint-disable no-underscore-dangle */

import fs from 'fs';
import path from 'path';
import { utcFormat } from 'd3-time-format';
import nodeURL from 'url';
import MarkdownIt from 'markdown-it';
import { SafeString } from 'handlebars';
import nav from './nav';

import type { TemplateHelper } from './types';

const srcRoot = path.resolve(__dirname, '..');

/**
 * Makes a *plain* helper that will throw an error if used as a block helper.
 */
const makePlainHelper = (
  callback: (...any) => (any),
): TemplateHelper => {
  const plainHelper: TemplateHelper = (
    { fn },
    ...args
  ) => {
    if (fn) throw new Error('This helper does accept a content block');

    return callback(...args);
  };

  return plainHelper;
};

/**
 * Converts the given string to an ISO 8601 formatted date.
 */
export const isoTime = makePlainHelper((input: string) => (
  !input ? '' : new Date(input).toISOString()
));

/**
 * Resolves a URL from ft.com
 */
export const resolveURL: TemplateHelper = makePlainHelper((
  url: string,
  from?: string = 'https://www.ft.com/',
) => (
  url ? nodeURL.resolve(from, url) : ''
));

export const convertRatioToPercentage: TemplateHelper = makePlainHelper((ratio: number) => (
  Math.round((100 / ratio) * 1000) / 1000
));

export const ifEquals: TemplateHelper = (
  { fn, inverse, context },
  a: any,
  b: any,
) => {
  if (!fn || !inverse) throw new Error('This is a block helper');

  if (a === b || Object.is(a, b)) {
    return fn(context);
  }

  return inverse(context);
};

export const unlessEquals: TemplateHelper = (
  { fn, inverse, context },
  a: any,
  b: any,
) => {
  if (!fn || !inverse) throw new Error('This is a block helper');

  if (a === b || Object.is(a, b)) {
    return inverse(context);
  }

  return fn(context);
};

export const ifAny: TemplateHelper = (
  { fn, inverse, context },
  ...args: any[]
) => {
  if (!fn || !inverse) throw new Error('This is a block helper');

  if (args.some(x => x)) {
    return fn(context);
  }

  return inverse(context);
};

export const navigation: TemplateHelper = () => nav;

// console.log('navigation', navigation());

/**
 * Formats a date using any D3 format string (defaulting to an FT-style date
 * like "Friday, 13 January 2015").
 *
 * See https://github.com/d3/d3-time-format for how to write a D3 format string.
 */
export const formatTime: TemplateHelper = (
  options,
  time: Date | string,
  formatString: string = '%A, %-e %B %Y',
) => {
  if (typeof formatString !== 'string') {
    throw new TypeError('2nd argument should be a string (or leave undefined to use default)');
  }

  if (options.fn) {
    throw new Error('This helper does not take a content block');
  }

  if (!time) return '';

  const format = utcFormat(formatString);

  if (time instanceof Date) return format(time);

  if (typeof time === 'string' || typeof time === 'number') {
    return format(new Date(time));
  }

  throw new TypeError(`Unexpected type for first argument: "${typeof time}"`);
};

const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

export const markdown: TemplateHelper = ({ fn, context }, arg?: string) => {
  if (arg && fn) {
    throw new Error('Helper was called with both and argument and a string - choose one or the other');
  }

  let markdownString;
  if (fn) {
    markdownString = fn(context);
  } else if (typeof arg === 'string') {
    markdownString = arg;
  } else {
    throw new Error('Neither a block nor a string argument was passed to this helper');
  }

  return new SafeString(markdownRenderer.render(markdownString));
};

export const includeFromFramework: TemplateHelper = (options, name) =>
  fs.readFileSync(path.resolve(srcRoot, name))
;

export const inlineMarkdown: TemplateHelper = makePlainHelper((text: string) => {
  if (!text) return '';

  if (typeof text !== 'string') throw new Error('inlineMarkdown filter: Expected input to be a string');

  return new SafeString(markdownRenderer.renderInline(text));
});

// converts any URL to an Image Service URL (with the given query params)
// - see https://www.ft.com/__origami/service/image/v2/docs/api for options
const _imageServiceUrl = (
  url: string,
  width?: number,
  queryParams: {[string]: mixed} = {},
) => {
  if (!url) throw new Error('URL required for imageServiceUrl');

  const finalQueryParams = { ...queryParams, source: 'ig' };
  if (width) finalQueryParams.width = width;

  const queryString = Object.keys(finalQueryParams)
    .sort()
    .map(name => `${encodeURIComponent(name)}=${encodeURIComponent(String(finalQueryParams[name]))}`)
    .join('&')
  ;

  return `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(url)}?${queryString}`;
};

export const imageServiceUrl = makePlainHelper(_imageServiceUrl);

// converts any URL to an `srcset` string containing *multiple* Image Service
// URLs respecting the given widths
const _imageServiceSrcset = (
  url: string,
  widths: string,
  queryParams: {[string]: mixed} = {},
) =>
  widths.split(',').map(width =>
    `${_imageServiceUrl(url, Number(width), queryParams)} ${width}w`,
  ).join(', ')
;

export const imageServiceSrcset = makePlainHelper(_imageServiceSrcset);

export const percentEncode = makePlainHelper(encodeURIComponent);

export const noBreak = makePlainHelper((text: string) => (
  new SafeString(text.replace(/ /g, '&nbsp;'))
));
