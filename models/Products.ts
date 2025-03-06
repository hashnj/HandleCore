import mongoose, { Schema, Document, Types } from "mongoose";

interface Review {
  rating: number;
  comment: string;
  date: Date;
  reviewerName: string;
  reviewerEmail: string;
}

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface Product extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: Dimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  images: string[];
  thumbnail: string;
}

const reviewSchema = new Schema<Review>({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  reviewerName: { type: String, required: true },
  reviewerEmail: { type: String, required: true },
});

const dimensionsSchema = new Schema<Dimensions>({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  depth: { type: Number, required: true },
});

const productSchema = new Schema<Product>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    tags: [{ type: String }],
    brand: { type: String, required: false },
    weight: { type: Number, required: true },
    dimensions: dimensionsSchema,
    warrantyInformation: { type: String },
    shippingInformation: { type: String },
    availabilityStatus: { type: String },
    reviews: [reviewSchema],
    returnPolicy: { type: String },
    minimumOrderQuantity: { type: Number, default: 1 },
    images: [{ type: String }],
    thumbnail: { type: String },
  },
  { timestamps: true }
);

const Products = mongoose.model<Product>("Products", productSchema);
export default Products;
