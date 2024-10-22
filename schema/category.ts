import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  isSubCategory: z.boolean()
});
export const SubCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  parent: z.string().min(1, 'Parent category is required'),
  isSubCategory: z.boolean()
});


