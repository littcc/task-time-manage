'use strict';

const webpack = require('webpack');
console.log(__dirname);
const config = {
    context: __dirname + '/src',
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: ['transform-decorators-legacy'],
                },
            }],
        }, {
            test: /\.scss$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }]
        }],
    },
    entry: {
        app: './app.js',
    },
    output: {
        path: __dirname + '/assets',
        publicPath: '/assets',
        filename: '[name].bundle.js'        
    },
    devServer: {
        contentBase: __dirname,
        // hot: true,
        // hotOnly: true,
        // inline: true,
        host: '0.0.0.0',
        port: 8088,
    },
};

module.exports = config;
