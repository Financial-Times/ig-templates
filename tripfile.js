import Directory from 'exhibit-directory';
import { plugin, withSubset, compose, createMatcher } from 'exhibit';
import axios from 'axios';
import fs from 'fs';

const src = new Directory('src');
const dist = new Directory('dist', { log: true });

const isDemoHTML = createMatcher('demo/**/*.html');

const compile = compose(
  plugin('yaml'),
  withSubset('lib/**', plugin('babel', { root: 'src' })),

  // build demos in a vm
  plugin('vm', async (files, vm) => {
    const ftGraphicsUI = vm.run('lib/index.js');

    // render the nunjucks demos with their respective contexts
    const outputFiles = await plugin('nunjucks', {
      root: 'src',
      setup: ftGraphicsUI.setup,
      entry: 'demo/**/*.njk',
      context: (name, allFiles) => JSON.parse(
        String(allFiles.get(name.replace(/index\.njk$/, 'context.json')) || '{}'),
      ),
    })(files);

    // add the resulting HTML files to our app
    return files.merge(
      outputFiles.filter((content, name) => isDemoHTML(name)),
    );
  }, { root: 'src' }),
);

export const develop = async () => {
  await src.watch(compose(
    compile,
    withSubset('demo/**', plugin('serve', { reload: true })),
    dist.write,
  ));
};

export const build = async () => {
  await src.read().then(compose(
    compile,
    dist.write,
  ));
};

/** Update our local src/lib/nav.js file */
export const updateNav = async () => {
  const menus = (await axios.get('https://next-navigation.ft.com/v2/menus')).data;
  const ids = (await axios.get('https://next-navigation.ft.com/v2/ids')).data;

  const json = JSON.stringify({
    menus, ids,
  }, null, 2);

  const lines = [
    '/* eslint-disable */',
    '',
    `// Generated at ${new Date().toISOString()}`,
    '// Do not hand-edit this file. Use "yarn run updateNav" to redownload it',
    '// from next-navigation.ft.com.',
    '',
    `export default ${json};\n`,
  ];

  fs.writeFileSync('src/lib/nav.js', lines.join('\n'));
};
