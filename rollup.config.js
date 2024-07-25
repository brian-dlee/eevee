import dts from "rollup-plugin-dts"
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  output: [{
    dir: 'dist/cjs',
    format: 'cjs'
  }, {
    dir: 'dist/esm',
    format: 'esm'
  }],
  plugins: [typescript(), dts()]
};
