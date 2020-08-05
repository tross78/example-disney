const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin')

let phaserModule = path.join(__dirname, '../../../node_modules/phaser-ce/');
let phaser = path.join(phaserModule, 'build/custom/phaser-split.min.js'),
    pixi = path.join(phaserModule, 'build/custom/pixi.js'),
    p2 = path.join(phaserModule, 'build/custom/p2.js');

let zipFileName = "Doc_017_002";
const language = process.env.language;

module.exports = {
    entry: {
        app:'./src/index.js',
        vendor: ['pixi', 'p2', 'phaser']
    },
    output: {
        path:path.resolve(__dirname, `./dist/${language}`),
        publicPath: `/dist/${language}/`,
        filename: 'build.js?[hash]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,  
                loader: [
                    'babel-loader',
                    'eslint-loader',
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/image/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(mp3|wav)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/audio/[name].[ext]?[hash]'
                }
            },
            { 
                test: /pixi\.js/, 
                use: ['expose-loader?PIXI'] 
            },
            { 
                test: /phaser-split\.js$/, 
                use: ['expose-loader?phaser'] 
            },
            { 
                test: /p2\.js/, 
                use: ['expose-loader?p2'] 
            } 
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ 
            name: 'vendor', 
            filename: 'vendor.js?[hash]' 
        }),
        new webpack.DefinePlugin({
            'process.env': {
                language: `"${language}"`
            }
        }),
    ],
    resolve: {
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2,
            'assets': path.join(__dirname, `./src/assets/${language}`),
            'Components': path.join(__dirname, "../../Components"),
        },
        modules: [path.join(__dirname, '../../../node_modules')]
    }
}
if (process.env.NODE_ENV === 'production') {
    module.exports.output.publicPath = "./";
    module.exports.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: path.join(__dirname, 'template.html'),
        }),
        // new ZipPlugin({
        //     // path:path.join(__dirname, './dist'),
        //     path:path.resolve(__dirname, `../../../release/${language}/`),
        //     filename: `${zipFileName}.zip`,
        // }),
    ]);
}