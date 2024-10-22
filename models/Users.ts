import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  userName: string;
  email: string;
  password: string;
  addresses: Types.ObjectId[];
  role: string;
} 

const userSchema = new mongoose.Schema<User>({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingAddress'
  }],
  role: {
    type: String,
    enum: ['Admin', 'Customer', 'Vendor'],
    default: 'Customer',
    required: true,
  },
},
  {timestamps:true}
);
export const Users = mongoose.model<User>('Users', userSchema);


