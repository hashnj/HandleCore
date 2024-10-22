import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface SubCat extends Document{
  name: string;
  description: string;
  cat_img: string;
  parent_id:Types.ObjectId;
}

const subCategorySchema=new mongoose.Schema<SubCat>({
  name:String,
  description:String,
  cat_img:String,
  parent_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categories'
  },
},{
  timestamps:true
});
export const SubCategories = mongoose.model<SubCat>('SubCategories',subCategorySchema)

