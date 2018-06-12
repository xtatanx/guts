import baseConfig from './rollup-base.js';
import {uglify} from 'rollup-plugin-uglify';

const config = {...baseConfig};

config.output.format = 'umd';
config.output.file = 'dist/guts.min.js';
config.plugins = [
  ...config.plugins,
  uglify({
    output: {
      comments: '/^!/'
    }
  })
];


export default config;
