import mongoose, { Schema, Document, Types } from "mongoose";

interface CartProduct {
  product_id: Types.ObjectId;
  quantity: number;
}

export interface Cart extends Document {
  user_id: Types.ObjectId;
  products: CartProduct[];
  createdAt?: Date;
  updatedAt?: Date;
}

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<Cart>("Cart", cartSchema);
export default Cart;
