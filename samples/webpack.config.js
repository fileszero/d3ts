// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require('awesome-typescript-loader')
const path = require('path');

module.exports = {
    entry: {
        s3: path.join(__dirname, 'scripts/s3.ts'),
        s4lineChart: path.join(__dirname, 'scripts/LineChart.ts'),
        s5lineChart2: path.join(__dirname, 'scripts/LineChart2.ts'),
        s6lineChart3: path.join(__dirname, 'scripts/LineChart3.ts'),
        s7lineChart4: path.join(__dirname, 'scripts/LineChart4.ts'),
        s8lineChart5: path.join(__dirname, 'scripts/LineChart5.ts'),
        s9lineChart6: path.join(__dirname, 'scripts/LineChart6.ts'),
        s10lineChart7: path.join(__dirname, 'scripts/LineChart7.ts'),
        s11csvread: path.join(__dirname, 'scripts/s11csvread.ts'),
        s12lineChart8: path.join(__dirname, 'scripts/LineChart8.ts'),
        client: path.join(__dirname, 'scripts/hello.ts'),
    },
    externals: {
        'd3': 'd3'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
};