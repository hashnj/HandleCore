import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Oitem extends Document{
  order_id: Types.ObjectId;
  product_id:Types.ObjectId;
  quantity: number;
  price: number;
}

const orderItemsSchema = new mongoose.Schema<Oitem>({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders'
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products'
  },
  quantity: Number,
  price: Number,
  
},{
  timestamps:true
});
const OrderItems = mongoose.model<Oitem>('OrderItems', orderItemsSchema);

export default OrderItems;