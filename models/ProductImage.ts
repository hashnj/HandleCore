import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Pimage extends Document {
  product_id:Types.ObjectId;
  image_url: string ;
}

const productImagesSchema = new mongoose.Schema<Pimage>({
  product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products'
  },
  image_url: String,
},{timestamps:true});
const ProductImages = mongoose.model<Pimage>('ProductImages', productImagesSchema);


export default ProductImages;