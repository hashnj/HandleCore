import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Pay extends Document {
  order_id: Types.ObjectId;
  amount: number;
  payment_method: string;
  status: string;
}

const paymentSchema = new mongoose.Schema<Pay>({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders'
  },
  amount: Number,
  payment_method: {
    type: String,
    enum: ['Credit Card', 'PayPal', 'Bank Transfer','Visa'] 
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed']
  },
  
},{
  timestamps:true
});
const Payment = mongoose.model<Pay>('Payment', paymentSchema);

export default Payment;