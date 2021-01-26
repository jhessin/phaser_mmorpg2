import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
// import passport from 'passport';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../webpack.config';
import {
  port, mongoConnectionUrl, mongoUserName, mongoPassword,
} from './env';

const app = express();
const server = require('http').Server(app);
// const io = require('socket.io')(server);

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

// reload=true: Enable autoreloading when changing JS files or content
// timeout=1000: Time for disconnecting from server to reconnecting
// config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

// Add HMR plugin
config.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(config);

// Enable 'webpack-dev-middleware'
if (typeof config.output.publicPath === 'string') {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
} else {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: '/',
  }));
}

// Enable 'webpack-hot-middleware'
app.use(webpackHotMiddleware(compiler));

// app.use(express.static('./public'));

// API Goes here
// parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
// parse json objects
app.use(bodyParser.json());
app.use(cookieParser());

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
