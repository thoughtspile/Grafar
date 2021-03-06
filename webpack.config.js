var path = require('path');
var isProduction = process.env.NODE_ENV === 'production';
var { version } = require('./package.json');
const { DefinePlugin } = require('webpack');

module.exports = {
    mode: isProduction ? 'production' : 'development',
    entry: { grafar: './src/grafar.ts' },
    output: {
        path: path.resolve('build'),
        filename: "[name].js",
        library: "grafar",
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: { extensions: ['', '.ts', '.js'] },
    module: {
        rules: [ { test: /\.ts$/, loader: 'ts-loader' } ]
    },
    plugins: [
        new DefinePlugin({
            'process.env.GRAFAR_VERSION': JSON.stringify(version),
        }),
    ],
    optimization: {
        minimize: false
    }
}
