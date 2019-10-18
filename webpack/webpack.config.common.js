const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');


/* less全局变量 */
const lessModifyVars = require(path.resolve(__dirname, '../src/theme/index.js'));

const CopyWebpackPlugin = require('copy-webpack-plugin');


const commonConfig = {
    /*入口*/
    entry: {
        app: [
            'babel-polyfill',
            path.resolve(__dirname, '../src/index.js')
        ],
        //antd: ['antd'],
        //react: ['react', 'react-router-dom', 'react-dom'],
        //mobx: ['mobx', 'mobx-react']
        //vendor: ['react', 'react-router-dom', 'react-dom', 'mobx', 'mobx-react', 'antd']
    },
    /*输出到dist文件夹，输出文件名字为bundle.js*/
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        publicPath: '/public/'
    },
    module: {
        rules: [{
            test: /\.html$/,
            use: 'html-loader',
            exclude: [path.resolve(__dirname, '../node_modules/')]
        }, {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader'
            ]
        }, {
            test: /\.less$/,
            use: [
                {loader: MiniCssExtractPlugin.loader},
                {loader: 'css-loader'},
                {loader: 'less-loader', options: {javascriptEnabled: true, modifyVars: lessModifyVars}}
            ]
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader?cacheDirectory=true',
                options: {
                    plugins: [['import', {libraryName: 'antd', libraryDirectory: 'es', style: true}]]
                }
            }],
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192 //小于等于8K的图片会被转成base64编码，直接插入HTML中，减少HTTP请求。
                }
            }]
        }, {
            test: /\.(ico)$/,
            use: [{
                loader: 'url-loader',
            }]
        },]
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        contentBase: path.resolve(__dirname, '../dist'),
        historyApiFallback: {index: '/public/index.html'},
        publicPath: '/public/',
        overlay: {
            errors: true
        },
        disableHostCheck: true,
    },
    // 追踪到错误和警告在源代码中的原始位置
    //devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: "系统综合集成",
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/templates/index.html'),
            mobx: path.resolve(__dirname, 'node_modules/mobx')
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([
            {from: path.resolve(__dirname, '../src/assets/images/favicon.ico'), to: 'favicon.ico'},
        ]),
        new webpack.HashedModuleIdsPlugin(),
    ],
    resolve: {
        alias: {
            modules: path.resolve(__dirname, '../node_modules')
        }
    }
};

module.exports = commonConfig;
