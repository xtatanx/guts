import baseConfig from './rollup-base.js';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const config = {...baseConfig};

config.output.sourcemap = 'inline';
config.plugins = [
  ...config.plugins,
  serve({
    open: true,
    contentBase: ['dist', 'examples']
  }),
  livereload()
];


export default config;
