import express, { Request, Response } from 'express';
import { Products, ProductImages, Categories, SubCategories, Vendors, WishList, Cart } from '../models';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth';
import { ProductSchema } from '../schema/product';
import { Category } from '../models/Categories';

const ProductRouter = express.Router();
const jwt_secret = 'secret';

const populateProductDetails = async (product: any) => {
  const images = await ProductImages.find({ product_id: product._id });
  const category = product.category_id as Category;
  const parentCategory = category.parent_id
    ? await SubCategories.findById(category.parent_id).select('name')
    : null;

  return {
    ...product.toObject(),
    category: {
      name: category.name,
      parent: parentCategory?.name || 'No Parent',
    },
    images: images.map((img) => img.image_url),
    vendor: product.vendor_id || 'Unknown Vendor',
  };
};

ProductRouter.post('/add', auth, async (req: Request, res: Response):Promise<any> => {
  const body = req.body;
  const userId: string = req.user_id;

  try {
    const product = ProductSchema.parse(body); 
    const category = await Categories.findById(product.category_id);

    if (!category) return res.status(404).json({ error: 'Category not found' });

    const newProduct = await Products.create({
      ...product,
      vendor_id: userId,
    });

    const productImagesPromises = product.images.map((imageUrl: string) => 
      ProductImages.create({
        product_id: newProduct._id,
        image_url: imageUrl,
      })
    );
    
    await Promise.all(productImagesPromises);

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

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    await ProductImages.findOneAndUpdate(
      { product_id: updated._id },
      { image_url: image[0] }
    );

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

ProductRouter.post('/cart', auth, async (req: Request, res: Response) => {
  const { list } = req.body;
  const userId: string = req.user_id;

  try {
    const cart = await Cart.findOneAndUpdate(
      { user_id: userId },
      { products: list },
      { upsert: true, new: true }
    );

    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

ProductRouter.get('/cart', auth, async (req: Request, res: Response):Promise<any> => {
  const userId: string = req.user_id;

  try {
    const cartEntry = await Cart.findOne({ user_id: userId }).populate('products');
    if (!cartEntry) return res.status(404).json({ message: 'Cart not found' });

    res.status(200).json({ products: cartEntry.products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

ProductRouter.post('/wish', auth, async (req: Request, res: Response) => {
  const { list } = req.body;
  const userId: string = req.user_id;

  try {
    const wishlist = await WishList.findOneAndUpdate(
      { user_id: userId },
      { product_id: list },
      { upsert: true, new: true }
    );

    res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

ProductRouter.get('/wish', auth, async (req: Request, res: Response):Promise<any> => {
  const userId: string = req.user_id;

  try {
    const wishListEntry = await WishList.findOne({ user_id: userId }).populate('product_id');
    if (!wishListEntry) return res.status(404).json({ message: 'Wishlist not found' });

    res.status(200).json({ products: wishListEntry.product_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

ProductRouter.get('/filter', async (req: Request, res: Response) => {
  const { category, minPrice, maxPrice, vendor, search, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const query: any = {};
    if (category) query.category_id = category;
    if (vendor) query.vendor_id = vendor;
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
    if (search) query.$or = [{ name: new RegExp(search as string, 'i') }, { description: new RegExp(search as string, 'i') }];

    const products = await Products.find(query)
      .populate('category_id', 'name')
      .populate('vendor_id', 'business_name')
      .skip(skip)
      .limit(parseInt(limit as string));

    const totalProducts = await Products.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit as string));

    const productsWithImages = await Promise.all(products.map(populateProductDetails));

    res.status(200).json({ data: productsWithImages, totalProducts, currentPage: page, totalPages });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default ProductRouter;
