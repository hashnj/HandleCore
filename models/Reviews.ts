import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Review extends Document {
  product_id: Types.ObjectId;
  user_id: Types.ObjectId;
  rating: number;
}

const reviewsSchema = new mongoose.Schema<Review>({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true 
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true 
  },
  rating: Number,
  
},{
  timestamps:true
});
const Review = mongoose.model<Review>('Review', reviewsSchema);

export default Review;