import path from 'path';

export setup from './setup';
export * as filters from './filters';
export * as globals from './globals';

/** For creating a custom Nunjucks loader */
export const searchPath = path.resolve(__dirname, '..');
