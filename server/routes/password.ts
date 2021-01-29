import express, {
  Request, Response, NextFunction,
} from 'express';
import path from 'path';
import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import {
  port, email, password, emailProvider as service,
} from '../env';
import HttpException from '../HttpException';
import User from '../models/UserModel';

const smtpTransport = nodemailer.createTransport({
  service,
  auth: {
    user: email,
    pass: password,
  },
});

const handlebarsOptions: HandlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: undefined,
    partialsDir: './templates/',
    layoutsDir: './templates/',
  },
  viewPath: path.resolve('./templates'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));

const router = express.Router();

router.post('/forgot-password', async (req: Request, res: Response, next) => {
  const userEmail = req.body.email;
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    return next(new HttpException(400, 'invalid email'));
  }

  // create user token
  const buffer = crypto.randomBytes(20);
  const resetToken = buffer.toString('hex');
  const resetTokenExp = new Date(Date.now() + 600000);

  // update user reset password token and exp
  // eslint-disable-next-line no-underscore-dangle
  await User.findByIdAndUpdate({ _id: user._id }, {
    resetToken,
    resetTokenExp,
  });

  // send user password reset email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'forgot-password',
    subject: 'Zenva Phaser MMO Passwor Reset',
    context: {
      name: user.username,
      url: `http://localhost:${port}/reset-password.html?token=${resetToken}`,
    },
  };

  try {
    await smtpTransport.sendMail(emailOptions);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({
    message: 'An email has been sent to your email address. Password reset link only valid for 10 minutes.',
    status: 200,
  });
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.body.email;
  const user = await User.findOne({
    resetToken: req.body.token,
    resetTokenExp: {
      $gt: Date.now(),
    },
    email: userEmail,
  });

  if (!user) {
    return next(new HttpException(400, 'invalid token'));
  }

  // ensure password provided, and verified
  if (!req.body.password || req.body.confirmPassword !== req.body.password) {
    return next(new HttpException(400, 'Passwords do not match'));
  }

  // update user model
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // send user password update email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'reset-password',
    subject: 'Zenva Phaser MMO Password Reset Confirmation',
    context: {
      name: 'joe',
    },
  };
  await smtpTransport.sendMail(emailOptions);
  return res.status(200).json({
    message: 'password updated',
    status: 200,
  });
});

export default router;
