import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../webpack.config';

const app = express();
const port = 8080;

// reload=true: Enable autoreloading when changing JS files or content
// timeout=1000: Time for disconnecting from server to reconnecting
// config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

// Add HMR plugin
// config.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(config);

// Enable 'webpack-dev-middleware'
if (typeof config.output.publicPath === 'string') {
  console.log('running webpack');
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
}

// Enable 'webpack-hot-middleware'
// app.use(webpackHotMiddleware(compiler));

// app.use(express.static('./public'));

// API Goes here
// -------------

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port: ${port}`);
});
