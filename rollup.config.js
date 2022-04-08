/**
 * @type {import('rollup').RollupOptions}
 */
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const config = {
  input: "assets/js/app.js",
  output: {
    dir: "assets/dist",
    format: "es",
  },
  plugins: [commonjs(), terser(), nodeResolve()],
};

export default config;
