import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack.config';
import {
  port, mongoConnectionUrl, mongoUserName, mongoPassword,
} from './env';
import HttpException from './HttpException';
import GameManager from './game_manager';

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const game = new GameManager(io);
game.setup();

// setup mongo connection
const mongoConfig: mongoose.ConnectOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
};

if (mongoUserName && mongoPassword) {
  mongoConfig.authSource = 'admin';
  mongoConfig.user = mongoUserName;
  mongoConfig.pass = mongoPassword;
}

if (!mongoConnectionUrl) {
  console.error('MONGO_CONNECTION_URL is not found!');
  process.exit(1);
}

mongoose.connect(mongoConnectionUrl, mongoConfig);

mongoose.connection.on('error', (err: Error) => {
  console.error(err);
  process.exit(1);
});

// Add HMR plugin
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(webpackConfig);

// Enable 'webpack-dev-middleware'
if (typeof webpackConfig.output.publicPath === 'string') {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }));
} else {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: '/',
  }));
}

// Enable 'webpack-hot-middleware'
app.use(webpackHotMiddleware(compiler));

// API Goes here
// parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
// parse json objects
app.use(bodyParser.json());
app.use(cookieParser());

// catch all other routes
app.use((_req, res) => {
  res.status(404).json({
    message: '404 - Not Found)',
    status: 404,
  });
});

// handle errors
app.use((
  err: HttpException,
  _req: express.Request,
  res: express.Response,
) => {
  res.status(err.status || 500).json({
    error: err.message,
    status: 500,
  });
});
// -------------

let runOnce = false;

mongoose.connection.on('connected', () => {
  if (runOnce) return;
  runOnce = true;
  // eslint-disable-next-line no-console
  console.log('connected to mongo');
  server.listen(port, () => {
  // eslint-disable-next-line no-console
    console.log(`Server started on port: ${port}`);
  });
});
