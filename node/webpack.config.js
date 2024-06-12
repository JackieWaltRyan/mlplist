let {join} = require("node:path");

module.exports = {
    mode: "production",

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    output: {
        path: join(process.cwd(), "www/list/_resources/scripts"),
        filename: "javascript.js",
        library: "MLPlist"
    }
};
