import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/sharegradient.ts"],

  format: ["esm", "cjs", "iife"],
  globalName: "ShareGradient",

  dts: true,
  sourcemap: true,
  clean: true,

  target: "es2020",
  outDir: "dist",

  treeshake: true,
  minify: "terser",
  splitting: false,

  esbuildOptions(options) {
    options.banner = {
      js: `'use strict';`,
    };
  },
});
