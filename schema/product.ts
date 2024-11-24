import { z } from 'zod';

export const ProductSchema = z.object({
  vendor_id: z.string().optional(),
  category_id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  mrp: z.number().min(0, 'MRP must be a positive number'),  
  price: z.number().min(0, 'Price must be a positive number'), 
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  orderSizes: z.array(z.string()).optional(),  
  dividingCriteria: z.array(z.object({
    key: z.string().min(1, 'Type is required'),  
    values: z.array(z.string()) 
  })).optional(),
  images: z.array(z.string())
}).refine(data => data.mrp >= data.price, {
  message: 'MRP must be greater than or equal to Price',
  path: ['mrp'], 
});


