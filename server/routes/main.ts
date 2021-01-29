/* eslint-disable no-underscore-dangle */
import express, {
  Request, Response, NextFunction,
} from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { jwtSecret, jwtRefreshSecret } from '../env';
import HttpException from '../HttpException';

const router = express.Router();
const tokenList: any = {};

router.get('/status', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'ok',
    status: 200,
  });
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'signup successful',
    status: 200,
  });
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('login', (error, user) => {
    try {
      if (error) return next(error);
      if (!user) {
        return next(new HttpException(401, 'email and password are required'));
      }

      return req.login(user, { session: false }, (err) => {
        if (err) return next(err);
        // create our JWT
        const body = {
          _id: user._id,
          email: user.email,
          name: user.username,
        };

        if (!jwtRefreshSecret) {
          console.error('JWT_REFRESH_SECRET not defined');
          process.exit(1);
        }
        if (!jwtSecret) {
          console.error('JWT_SECRET not defined');
          process.exit(1);
        }
        const token = jwt.sign({ user: body }, jwtSecret, { expiresIn: 300 });
        const refreshToken = jwt.sign(
          { user: body },
          jwtRefreshSecret, { expiresIn: 86400 },
        );

        // store tokens in cookie
        res.cookie('jwt', token, { sameSite: 'none', secure: true });
        res.cookie('refreshJwt', refreshToken, { sameSite: 'none', secure: true });

        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          email: user.email,
          _id: user._id,
          name: user.username,
        };
        // send the token to the user
        return res.status(200).json({
          token,
          refreshToken,
          status: 200,
        });
      });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  })(req, res, next);
});

function processLogoutRequest(req: Request, res: Response) {
  if (req.cookies) {
    const refreshToken = req.cookies.refreshJwt;
    if (refreshToken in tokenList) { delete tokenList[refreshToken]; }
    res.clearCookie('jwt', { sameSite: 'none', secure: true });
    res.clearCookie('refreshJwt', { sameSite: 'none', secure: true });
  }
  if (req.method === 'GET') {
    return res.sendFile('logout.html', { root: './public' });
  }
  return res.status(200).json({ message: 'logged out', status: 200 });
}

router.route('/logout')
  .get(processLogoutRequest)
  .post(processLogoutRequest);

router.post('/token', (req: Request, res: Response) => {
  const { refreshJwt } = req.cookies;
  if (refreshJwt in tokenList) {
    const body = {
      email: tokenList[refreshJwt].email,
      _id: tokenList[refreshJwt]._id,
      name: tokenList[refreshJwt].name,
    };
    if (!jwtSecret) {
      console.error('JWT_SECRET not defined');
      process.exit(1);
    }
    const token = jwt.sign({ user: body }, jwtSecret, { expiresIn: 300 });

    // update jwt
    res.cookie('jwt', token, { sameSite: 'none', secure: true });
    tokenList[refreshJwt] = token;

    return res.status(200).json({ token, status: 200 });
  }

  return res.status(401).json({
    message: 'unauthorized',
    status: 401,
  });
});

export default router;
