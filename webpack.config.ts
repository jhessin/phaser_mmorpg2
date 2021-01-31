/* eslint import/no-extraneous-dependencies: "off" */
// import webpack
import webpack from 'webpack';
import 'webpack-dev-server';
// Node.js module used to manipulate file paths
import path from 'path';
// generate an HTML file for your application by injecting automatically all
// your generated bundles.
import HtmlWebpackPlugin from 'html-webpack-plugin';
// This plugin will remove all files inside webpack's output.path directory,
// as well as all unused webpack assets after every successful rebuild.
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {
  // enable webpack's built-in optimizations
  // that correspond to development
  mode: 'development',
  // the main entry point
  entry: './client/index.ts',
  devtool: 'inline-source-map',
  // Dev Server settings
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    writeToDisk: true,
    open: true,
  },
  // The output path
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },

  module: {
    rules: [
      {
        // use style loader
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        // checks files with .js or .ts extensions
        test: /\.tsx?$/,
        // exclude node_modules folder
        exclude: /node_modules/,
        // uses babel-loader to transpile your ES6/Typescript code
        use: 'ts-loader',
      },
      {
        test: [/\.vert$/, /\.frag$/],
        // in case you need to use Vertex and Fragment shaders this loader will
        // bundle them for you.
        use: 'raw-loader',
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        // in case you need to use images, this loader will bundle them for
        // you.
        use: 'file-loader',
      },
      {
        // Loads the javascript into html template provided.
        // Entry point is set below in HtmlWebpackPlugin in Plugins
        test: /\.html$/,
        use: [{ loader: 'html-loader' }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/**/*',
        },
      ],
    }),
    // config webpack to handle renderer swapping
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      // where your html template is located.
      title: 'Phaser Game',
      // template: 'index.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};

export default config;
