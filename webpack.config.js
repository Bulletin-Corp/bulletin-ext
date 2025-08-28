const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        popup: './src/popup/popup.jsx',
        content: './src/content/content.js',
        background: './src/background/background.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
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
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            chunks: ['popup'],
            title: 'Bulletin Extension',
            meta: {
                charset: 'utf-8'
            },
            minify: false,
            templateContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                </head>
                <body>
                    <div id="popup-root"></div>
                </body>
                </html>
            `
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '.'
                },
                {
                    from: 'manifest.json',
                    to: 'manifest.json'
                },
                {
                    from: 'src/content/content.css',
                    to: 'content.css'
                }
            ]
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    }
};
