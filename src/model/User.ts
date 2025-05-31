import mongoose, { Document } from 'mongoose';

export interface Message extends Document {
      content: string;
      createdAt: Date;
}

export interface User extends Document {
      username: string;
      password: string;
      email: string;
      verifyCode: string;
      verifyCodeExpire: Date;
      isVerified?: boolean;
      isAcceptingMessages: boolean;
      messages: Message[];
}

const MessageSchema: mongoose.Schema<Message> = new mongoose.Schema({
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
})


const UserSchema: mongoose.Schema<User> = new mongoose.Schema({
      username: { type: String, required: [true, "UserName is required"], unique: true },
      password: { type: String, required: true },
      email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
      },
      verifyCode: { type: String, required: true },
      verifyCodeExpire: { type: Date, required: true },
      isVerified: { type: Boolean, default: false },
      isAcceptingMessages: { type: Boolean, default: false },
      messages: [MessageSchema]
});

const UserModel = (mongoose.models.User) as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default UserModel;