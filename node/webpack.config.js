module.exports = {
    mode: "production",

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    output: {
        filename: "list/_resources/scripts/index.js",
        library: "MLPlist"
    }
};
