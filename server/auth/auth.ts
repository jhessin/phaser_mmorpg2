import passport from 'passport';
import localStrategy from 'passport-local';
import JwtStrategy from 'passport-jwt';

import HttpException from '../HttpException';
import { jwtSecret } from '../env';
import User from '../models/UserModel';

// handle user registration
passport.use('signup', new localStrategy.Strategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, async (req, email, password, done) => {
  try {
    const { username } = req.body;
    const user = await User.create({
      email, password, username,
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// handle user login
passport.use('login', new localStrategy.Strategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(new HttpException(401, 'invalid email or password'), false);
    }
    const valid = await user.isValidPassword(password);
    if (!valid) {
      return done(new HttpException(401, 'invalid email or password'), false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

if (!jwtSecret) {
  console.error('JWT_SECRET not defined');
  process.exit(1);
}

// verify jwt token
passport.use(new JwtStrategy.Strategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: (req) => {
    let token = null;
    if (req && req.cookies) token = req.cookies.jwt;
    return token;
  },
}, (payload, done) => {
  try {
    return done(null, payload.user);
    // return done(null, token);
  } catch (err) {
    return done(err);
  }
}));
