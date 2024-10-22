import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Address extends Document{
  user_id: Types.ObjectId;
  order_id: Types.ObjectId;
  address_type:string;
isDefault:boolean;
  ref: string;
  city: string;
  state: string;
  postal_code: string;
}

const shippingAddressSchema = new mongoose.Schema<Address>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders'
  },
  address_type:{
    type:String,
    enum:['Home','Work']
},
isDefault:{
    type:Boolean,
    default:false
},
  ref: String,
  city: String,
  state: String,
  postal_code: String,
},{
  timestamps:true
});
const ShippingAddress = mongoose.model<Address>('ShippingAddress', shippingAddressSchema);

export default ShippingAddress;