import fs from 'fs';
import path from 'path';
import glob from 'glob';

const templates = {};

['layouts', 'partials'].forEach((kind) => {
  const dir = path.resolve(__dirname, '..', 'templates', kind);

  const files = glob.sync('*.hbs', { cwd: dir });

  templates[kind] = files.reduce((acc, name) => ({
    ...acc,
    [name.replace(/\.hbs$/, '')]: fs.readFileSync(path.resolve(dir, name), 'utf8'),
  }), {});
});

export default templates;
