import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
  email: String;
  message: String;
}

const ChatSchema: Schema<IChat> = new Schema({
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const ChatModel: Model<IChat> = mongoose.model('chat', ChatSchema);

export default ChatModel;
