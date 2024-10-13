import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import importAssets from "rollup-plugin-import-assets";
import styles from "rollup-plugin-styles";
import alias from "@rollup/plugin-alias";
import del from "rollup-plugin-delete";
import externalGlobals from "rollup-plugin-external-globals";

// replace "assert" with "with" once node implements that
import manifest from "./plugin.json" assert { type: "json" };

export default defineConfig({
  input: "./src/index.tsx",
  plugins: [
    del({ targets: "./dist/*", force: true }),
    commonjs(),
    nodeResolve({
      browser: true,
    }),
    externalGlobals({
      react: "SP_REACT",
      "react-dom": "SP_REACTDOM",
      "@decky/ui": "DFL",
      "@decky/manifest": JSON.stringify(manifest),
    }),
    typescript(),
    json(),
    replace({
      preventAssignment: false,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    styles(),
    alias({
      entries: [
        { find: "@cssloader/backend", replacement: "./src/backend" },
        { find: "@/backend", replacement: "./src/backend-impl" },
        { find: "@/lib", replacement: "./src/lib" },
        { find: "@/styles", replacement: "./src/styles" },
        { find: "@/types", replacement: "./src/types" },
        { find: "@/modules", replacement: "./src/modules" },
        { find: "@/decky-patches", replacement: "./src/decky-patches" },
      ],
    }),
    importAssets({
      publicPath: `http://127.0.0.1:1337/plugins/${manifest.name}/`,
    }),
  ],
  context: "window",
  external: ["react", "react-dom", "@decky/ui"],
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    // **Don't** change this.
    sourcemapPathTransform: (relativeSourcePath) =>
      relativeSourcePath.replace(
        /^\.\.\//,
        `decky://decky/plugin/${encodeURIComponent(manifest.name)}/`
      ),
    exports: "default",
  },
});
