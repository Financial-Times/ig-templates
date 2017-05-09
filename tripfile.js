import Directory from 'exhibit-directory';
import handlebars from 'handlebars';
import bowerResolve from 'rollup-plugin-bower-resolve';
import { plugin, withSubset, compose, createMatcher, cache } from 'exhibit';
import axios from 'axios';
import fs from 'fs';
import cssnano from 'cssnano';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';

const src = new Directory('src');
const dist = new Directory('dist', { log: true });

src.on('error', (error) => {
  console.log('src error:', error && error.stack ? error.stack : error);
});

const isDemoHTML = createMatcher('demo/**/*.html');
const isDemoHBS = createMatcher('demo/**/*.hbs');

const compile = compose(
  plugin('yaml'),

  plugin('sass', {
    root: 'src',
    loadPaths: 'bower_components',
  }),

  plugin('postcss', cssnano({
    discardComments: {
      removeAll: true,
    },
  }), { map: false }),

  // bundle rollup bundles first
  withSubset('client/**', compose(
    plugin('rollup', {
      match: ['client/**/*.{js,jsx}', '!**/*.main.js'],
      entry: '**/*.rollup.js',
      format: 'cjs',
      root: 'src',
      external: ['ftdomdelegate', 'dom-delegate'],
      plugins: [
        bowerResolve(),
        // fixes dom-delegate and ftdomdelegate
        // rollupCommonJS(),
      ],
    }),

    // plugin('rename', '**/'

    plugin('babel', { root: 'src' }),

    plugin('browserify', {
      root: 'src',
      entry: '**/*.main.js',
      transforms: ['debowerify'],
      sourceMap: false,
    }),

    plugin('uglify'),
  )),

  plugin('babel', { root: 'src', match: 'lib/**/*.js' }),

  // build demos in a vm
  plugin('vm', async (files, vm) => {
    const { autoRegister } = vm.runFile('lib/index.js');

    const Handlebars = handlebars.create();

    // register helpers
    autoRegister(Handlebars);

    const getContext = (name, allFiles) => {
      const localContext = JSON.parse(
        String(allFiles.get(name.replace(/index\.hbs/, 'context.json')) || '{}'),
      );

      return { ...localContext };
    };

    // render the Handlebars demos with their respective contexts
    const outputFiles = files.mapEntries(([name, content]) => {
      const htmlName = name.replace(/\.hbs$/, '.html');

      if (isDemoHBS(name)) {
        // console.log('HBS!', name);
        // const compiled = JSON.stringify(getContext(name, files));
        const context = getContext(name, files);

        // console.log(content.toString(), context);

        let template;
        try {
          template = Handlebars.compile(content.toString(), {
            // strict: true,
          });
        } catch (error) {
          console.log(`Failed to compile template: ${name}`);
          console.log(error && error.stack ? error.stack : error);
        }

        let output;
        try {
          output = template(context);
        } catch (error) {
          console.log(`Failed to render template: ${name}`);
          console.log(error && error.stack ? error.stack : error);
          return null;
        }

        return [htmlName, new Buffer(output)];
      }

      return [name, content];
    });

    // add the resulting HTML files to our app
    return files.merge(
      outputFiles.filter((content, name) => isDemoHTML(name)),
    ).toObject();
  }, { root: 'src' }),

  // report key stats
  cache((content, name) => {
    console.log(name, chalk.yellow(prettyBytes(content.length)));
    return content;
  }),
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
    '// Do not hand-edit this file. Use "trip updateNav" to redownload it',
    '// from next-navigation.ft.com.',
    '',
    `export default ${json};\n`,
  ];

  fs.writeFileSync('src/lib/nav.js', lines.join('\n'));
};
