import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface vendor extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
business_name: string;
business_address: string;
business_email: string;
business_phone: string;
}

const vendorSchema = new mongoose.Schema<vendor>({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
  },
  business_name: String,
  business_address: String,
  business_email: String,
  business_phone: String,
},
  {timestamps:true}
);
export const Vendors = mongoose.model<vendor>('Vendors', vendorSchema);

