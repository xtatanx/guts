import babel from 'rollup-plugin-babel';

export default {
  input: 'src/Guts.js',
  output: {
    format: 'iife',  // required
    file: 'dist/guts.js',
    name: 'Guts',
    banner:
`/*!
 * Guts
 * (c) 2018 Jhonnatan Gonzalez <jhonnatanhxc@gmail.com>
 * https://github.com/xtatanx/guts
 *
 * Licensed under the MIT license.
 */`
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ["external-helpers"]
    })
  ]
};
