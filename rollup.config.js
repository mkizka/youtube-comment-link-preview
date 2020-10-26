import copy from "rollup-plugin-copy";
import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: {
    file: "dist/content.js",
    format: "cjs",
  },
  plugins: [
    copy({
      targets: [
        //{ src: "src/icons", dest: "dist" },
        {
          src: "src/manifest.json",
          dest: "dist",
          transform: (buffer) => {
            const manifest = JSON.parse(buffer.toString());
            manifest.name = pkg.name;
            manifest.description = pkg.description;
            manifest.version = pkg.version;
            manifest.developer = {
              name: pkg.author,
              url: pkg.homepage,
            };
            return JSON.stringify(manifest, null, 2);
          },
        },
      ],
    }),
  ],
};
