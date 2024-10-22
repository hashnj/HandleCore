import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Wishlist extends Document {
  user_id: Types.ObjectId;
  product_id: Types.ObjectId[];
}

const wishListSchema = new mongoose.Schema<Wishlist>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  product_id: 
    [{type: mongoose.Schema.Types.ObjectId,
    ref: 'Products'
  }],
},
{ timestamps: true }
);
const WishList = mongoose.model<Wishlist>('WishList',wishListSchema);

export default WishList