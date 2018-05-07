import babel from 'rollup-plugin-babel';

export default {
  input: 'src/Guts.js',
  output: {
    format: 'iife',  // required
    file: 'dist/guts.js',
    name: 'Guts'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ["external-helpers"]
    })
  ]
};
