let WebpackObfuscator = require("webpack-obfuscator");

module.exports = {
    mode: "production",

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    output: {
        filename: "list/mlplist.js",
        library: "MLPlist"
    },

    plugins: [
        new WebpackObfuscator()
    ]
};
