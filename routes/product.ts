import express, { Request, Response } from 'express';
import { Products, ProductImages, Categories, SubCategories, Vendors, WishList, Cart } from '../models';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth';
import { ProductSchema } from '../schema/product';
import { Category } from '../models/Categories';

const ProductRouter = express.Router();
const jwt_secret = 'secret';



ProductRouter.post('/add', auth, async (req: Request, res: Response):Promise<any> => {
  const body  = req.body;
  const userId :string= req.user_id;
try{
    const product  = ProductSchema.parse(body);
    const category = await Categories.findById(product.category_id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newProduct = await Products.create({
      ...product,
      vendor_id: userId,
    });

    await ProductImages.create({
      product_id: newProduct._id,
      image_url: product.image,
    });

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.put('/', auth, async (req: Request, res: Response):Promise<any> => {
  const { name, description, mrp, price, stock, image } = req.body.item;

  try {
    const updated = await Products.findOneAndUpdate(
      { $or: [{ name }, { description }] },
      { name, description, mrp, price, stock },
      { new: true }
    );

    await ProductImages.findOneAndUpdate(
      { product_id: updated?._id },
      { image_url: image[0] }
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.post('/cart', auth, async (req: Request, res: Response):Promise<any> => {
  const { list } = req.body;
  const userId :string= req.user_id;


  try {
    const exists = await Cart.findOne({ user_id: userId });
    const qry = exists
      ? await Cart.findOneAndUpdate({ user_id: userId }, { products: list })
      : await Cart.create({ user_id: userId, products: list });

    res.json({ qry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.get('/cart', auth, async (req: Request, res: Response):Promise<any> => {
  const userId :string= req.user_id;


  try {
    const qry = await Cart.find({ user_id: userId });
    res.json({ qry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.post('/wish', auth, async (req: Request, res: Response):Promise<any> => {
  const { list } = req.body;
  const userId :string= req.user_id;


  try {
    const exists = await WishList.findOne({ user_id: userId });
    const qry = exists
      ? await WishList.findOneAndUpdate({ user_id: userId }, { product_id: list })
      : await WishList.create({ user_id: userId, product_id: list });

    res.json({ qry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.get('/wish', auth, async (req: Request, res: Response):Promise<any> => {
  const userId :string= req.user_id;


  try {
    const qry = await WishList.find({ user_id: userId });
    res.json({ qry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


ProductRouter.get('/', async (req: Request, res: Response):Promise<any> => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

  try {
      // Calculate the number of items to skip based on the current page and limit
      const skip = (page - 1) * limit;

      // Fetch products with pagination
      const products = await Products.find({})
          .populate({
              path: 'category_id',
              select: 'name description parent_id',
              populate: {
                  path: 'parent_id',
                  select: 'name',
              },
          })
          .populate('vendor_id', 'business_name address contact')
          .skip(skip) 
          .limit(limit); 

      const totalProducts = await Products.countDocuments();

      const productsWithImages = await Promise.all(
          products.map(async (product) => {
              const images = await ProductImages.find({ product_id: product._id });
              const category = product.category_id as Category; // Get category name
              const categoryName = category.name;
                const parentCategoryName = category.parent_id 
                    ? await SubCategories.findById(category.parent_id).select('name') 
                    : null;

              return {
                  ...product.toObject(),
                  category: {
                      name: category.name,
                      parent: parentCategoryName,
                  },
                  vendor: product.vendor_id || 'Unknown Vendor',
                  images: images.map((img) => img.image_url),
              };
          })
      );

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({
          data: productsWithImages,
          totalProducts,
          currentPage: page,
          totalPages,
      });
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default ProductRouter;
