import { utcFormat } from 'd3-time-format';
import nodeURL from 'url';
import MarkdownIt from 'markdown-it';
import nunjucks from 'nunjucks';

const SafeString = nunjucks.runtime.SafeString;

export const isoDate = str => (!str ? '' : new Date(str).toISOString());

const d3TimeFormattersCache = {};

/**
 * Formats a date using a D3 format string.
 * See https://github.com/d3/d3-time-format
 */
export const formatTime = (time, formatString = '%A, %-e %B %Y') => {
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

export const resolveURL = (url, from = 'https://www.ft.com/') =>
  nodeURL.resolve(from, url)
;

const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

export const markdown = string =>
  (!string ? '' : new SafeString(markdownRenderer.render(string)))
;

export const inlineMarkdown = string =>
  (!string ? '' : new SafeString(markdownRenderer.renderInline(string)))
;
