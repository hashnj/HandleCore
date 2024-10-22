import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { vendor } from './Vendor';
import { Category } from './Categories';

interface Product extends Document {
  vendor_id: vendor |Types.ObjectId;
  category_id:Category | Types.ObjectId;
  name: string;
  description: string;
    mrp: string;
    price: string;
    stock: number;
    orderSizes: string[]; 
    dividingCriteria:string[];
}

const productSchema = new mongoose.Schema<Product>({
    vendor_id: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor', 
                  },
    category_id: {
                 type: mongoose.Schema.Types.ObjectId,
                 ref: 'Category', 
                },
    name: { type: String, required: true },
    description: { type: String },
    mrp: { type: String, required: true },
    price: { type: String, required: true },
    stock: { type: Number, required: true },
    orderSizes: [{ type: String }], 
    dividingCriteria: [{ key: String, values: [String] }] 
  
});


// const productSchema = new mongoose.Schema({
//   vendor_id: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendors'
//   },
//   category_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Categories'
//   },
//   name: String,
//   description: String,
//   mrp:String,
//   price: String,
//   stock: String,
//   created_at: {
//       type: Date,
//       default: Date.now
//   },
//   updated_at: Date
// });



const Products = mongoose.model<Product>('Products',productSchema);

export default Products;