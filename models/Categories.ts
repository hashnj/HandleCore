import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface Category extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  cat_img:string;
  parent_id?: Types.ObjectId;
}

const categorySchema = new mongoose.Schema<Category>({
  name: String,
  description: String,
  cat_img:String,
});

export const Categories = mongoose.model<Category>('Categories',categorySchema);
