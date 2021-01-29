import express, {
  Request, Response, NextFunction,
} from 'express';
import HttpException from '../HttpException';
import Chat from '../models/ChatModel';
import User, { IUser } from '../models/UserModel';

const router = express.Router();

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || !req.body.message) {
    next(new HttpException(400, 'invalid body'));
  } else {
    const { message } = req.body;
    const user = req.user as IUser;
    // if (!user) {
    //   console.log('req.user not found! - logic error');
    //   process.exit(1);
    // }
    const { email } = user;
    const chat = await Chat.create({ email, message });
    res.status(200).json({
      message: 'message sent',
      chat,
      status: 200,
    });
  }
});

router.post('/update-password', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || !req.body.password || req.body.password !== req.body.confirmPassword) {
    return next(new HttpException(400, 'passwords do not match'));
  }
  const {
    password,
  } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  const id = (req.user as IUser)._id;
  const user = await User.findByIdAndUpdate(id, { password });
  if (!user) {
    return next(new HttpException(401, 'Invalid User'));
  }

  return res.status(200).json({
    message: 'password updated',
    status: 200,
  });
});
export default router;
