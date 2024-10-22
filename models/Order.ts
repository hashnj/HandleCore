import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Order extends Document{
  user_id: Types.ObjectId;
  status: string;
  total_amount: number;
}

const orderSchema = new mongoose.Schema<Order>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    required: true
  },
  total_amount: Number,

},{
  timestamps:true
});
const Orders = mongoose.model<Order>('Orders', orderSchema);

export default Orders;