import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  resetToken?: string;
  resetTokenExp?: any;
  isValidPassword: (this: IUser, password: string) => Promise<boolean>;

}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  resetToken: {
    type: String,
  },
  resetTokenExp: {
    type: Date,
  },
});

UserSchema.pre('save', async function Callback(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function validatePassword(
  this: IUser,
  password: string,
) {
  const user = this;
  const compare: boolean = await bcrypt.compare(password, user.password);
  return compare;
};

const UserModel: Model<IUser> = mongoose.model('user', UserSchema);

export default UserModel;
