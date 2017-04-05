// @flow

import { utcFormat } from 'd3-time-format';
import nodeURL from 'url';
import MarkdownIt from 'markdown-it';
import nunjucks from 'nunjucks';
import CleanCSS from 'clean-css';

const SafeString = nunjucks.runtime.SafeString;

export const isoDate = (str: string) => (
  !str ? '' : new Date(str).toISOString()
);

const d3TimeFormattersCache = {};

/**
 * Formats a date using a D3 format string.
 * See https://github.com/d3/d3-time-format
 */
export const formatTime = (
  time: Date | string,
  formatString: string = '%A, %-e %B %Y',
) => {
  if (typeof formatString !== 'string') {
    throw new Error('formatTime filter: "formatString" must be a string');
  }

  if (!time) return '';

  // create and cache a d3 formatter
  if (!d3TimeFormattersCache[formatString]) {
    d3TimeFormattersCache[formatString] = utcFormat(formatString);
  }

  const format = d3TimeFormattersCache[formatString];

  if (time instanceof Date) return format(time);

  if (typeof time === 'string' || typeof time === 'number') {
    return format(new Date(time));
  }

  throw new Error(`formatTime filter: Unexpected input type: "${typeof time}"`);
};

export const resolveURL = (url: string, from: string = 'https://www.ft.com/') =>
  nodeURL.resolve(from, url)
;

const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

export const markdown = (text: string) => {
  if (!text) return '';

  if (typeof text !== 'string') {
    throw new Error('markdown filter: Expected input to be a string');
  }

  return new SafeString(markdownRenderer.render(text));
};

export function inlineMarkdown(text: string) {
  if (!text) return '';

  if (typeof text !== 'string') throw new Error('inlineMarkdown filter: Expected input to be a string');

  return new SafeString(markdownRenderer.renderInline(text));
}

const cleanCSS = new CleanCSS({
  compatibility: 'ie8',
});

export const minifyCSS = (css: string, environment: string) => new SafeString(
  environment === 'development' ? css : cleanCSS.minify(css).styles,
);

// converts any URL to an Image Service URL (with the given query params)
// - see https://www.ft.com/__origami/service/image/v2/docs/api for options
export const imageServiceUrl = (
  url: string,
  queryParams: {[string]: mixed} = {},
) => {
  const queryString = Object.keys({ ...queryParams, source: 'ig' })
    .sort()
    .map(name => `${encodeURIComponent(name)}=${encodeURIComponent(String(queryParams[name]))}`)
    .join('&')
  ;

  return `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(url)}?${queryString}`;
};

// converts any URL to an `srcset` string containing *multiple* Image Service
// URLs respecting the given widths
export const imageServiceSrcset = (
  url: string,
  widths: number[],
  queryParams: {[string]: mixed} = {},
) =>
  widths.map(width =>
    `${imageServiceUrl(url, { ...queryParams, width })} ${width}w`,
  ).join(', ')
;
