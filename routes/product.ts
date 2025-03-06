import express, { Request, Response } from "express";
import Products from "../models/Products";
import auth from "../middleware/auth";

const ProductRouter = express.Router();


ProductRouter.post("/add", auth, async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const userId: string = req.user_id;

  try {
    const newProduct = await Products.create({
      ...body,
      vendor_id: userId,
      salesCount: 0,
      views: 0,
    });

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


ProductRouter.put("/", auth, async (req: Request, res: Response): Promise<any> => {
  const { id, ...updateFields } = req.body;

  try {
    const updated = await Products.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


ProductRouter.get("/home", async (_req: Request, res: Response) => {
  try {
    const trendingProducts = await Products.find().sort({ salesCount: -1 }).limit(10);
    const topRatedProducts = await Products.find().sort({ rating: -1 }).limit(10);
    const newArrivals = await Products.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      sections: {
        trending: trendingProducts,
        topRated: topRatedProducts,
        newArrivals: newArrivals,
      },
    });
  } catch (error) {
    console.error("Error fetching home sections:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


ProductRouter.get("/explore", async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const products = await Products.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const totalProducts = await Products.countDocuments();
    res.status(200).json({
      data: products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / parseInt(limit as string)),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


ProductRouter.get("/:id", async (req: Request, res: Response) : Promise<any> => {
  try {
    const product = await Products.findById(req.params.id);
    console.log(product);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await Products.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


ProductRouter.get("/filter", async (req: Request, res: Response) => {
  const { search, category, brand, minPrice, maxPrice, minStock, rating, sortBy = "price", order = "asc", page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const query: any = {};
    if (search) query.title = { $regex: search as string, $options: "i" };
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) query.price = { ...(minPrice ? { $gte: parseFloat(minPrice as string) } : {}), ...(maxPrice ? { $lte: parseFloat(maxPrice as string) } : {}) };
    if (minStock) query.stock = { $gte: parseInt(minStock as string) };
    if (rating) query.rating = { $gte: parseFloat(rating as string) };

    const sortOptions: any = {};
    sortOptions[sortBy as string] = order === "desc" ? -1 : 1;

    const products = await Products.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit as string));

    const totalProducts = await Products.countDocuments(query);
    res.status(200).json({ data: products, totalProducts, totalPages: Math.ceil(totalProducts / parseInt(limit as string)) });
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default ProductRouter;
