const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const USE_DOCKER = process.env.USE_DOCKER === "false";

const REST_PROTOCOL = process.env.REST_PROTOCOL || "http";
const REST_HOST = process.env.REST_HOST || "localhost";
const REST_PORT = process.env.REST_PORT || "4001";

const WS_PROTOCOL = process.env.WS_PROTOCOL || "ws";
const WS_HOST = process.env.WS_HOST || "localhost";
const WS_PORT = process.env.WS_PORT || "4000";

module.exports = {
    mode: "development",
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true,
    },
    devtool: 'cheap-module-source-map',
    devServer: {
        static: [path.join(__dirname, 'dist'), path.join(__dirname, 'public')],
        port: 3000,
        hot: true,
        open: true,
        proxy: [
            {
                context: ["/api"],
                target: `${REST_PROTOCOL}://${REST_HOST}:${REST_PORT}`,
                changeOrigin: true,
                ...(USE_DOCKER ? {} : { pathRewrite: { "^/api": "" } })
            }
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' }
        ],
    },
    resolve: { extensions: ['.js', '.jsx'] },
    plugins: [
        new HtmlWebpackPlugin({ template: './public/index.html' }),
        new webpack.DefinePlugin({
            'process.env.USE_DOCKER': JSON.stringify(process.env.USE_DOCKER || "false"),
            'process.env.REST_PROTOCOL': JSON.stringify(REST_PROTOCOL),
            'process.env.REST_HOST': JSON.stringify(REST_HOST),
            'process.env.REST_PORT': JSON.stringify(REST_PORT),
            'process.env.WS_PROTOCOL': JSON.stringify(WS_PROTOCOL),
            'process.env.WS_HOST': JSON.stringify(WS_HOST),
            'process.env.WS_PORT': JSON.stringify(WS_PORT),
        })
    ]
};