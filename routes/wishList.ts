import express, { Request, Response } from "express";
import { WishList } from "../models";
import auth from "../middleware/auth";
import mongoose from "mongoose";

const wishlistRouter = express.Router();

/**
 * ✅ Sync Guest Wishlist with User Wishlist
 */
wishlistRouter.post("/sync", auth, async (req: Request, res: Response) => {
  const userId = req.user_id;
  const { wishlist: guestWishlist } = req.body;

  try {
    let userWishlist = await WishList.findOne({ user_id: userId });

    if (!userWishlist) {
      userWishlist = new WishList({ user_id: userId, product_id: guestWishlist });
    } else {
      userWishlist.product_id = userWishlist.product_id || [];

      guestWishlist.forEach((guestItem: any) => {
        const existingIndex = userWishlist!.product_id.findIndex(
          (item) => item.toString() === guestItem
        );

        if (existingIndex === -1) {
          userWishlist?.product_id.push(new mongoose.Types.ObjectId(guestItem));
        }
      });
    }

    await userWishlist.save();
    res.status(200).json({ message: "Wishlist synced successfully", wishlist: userWishlist.product_id });
  } catch (error) {
    console.error("Error syncing wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Add to Wishlist
 */
wishlistRouter.post("/add", auth, async (req: Request, res: Response): Promise<any> => {
  const { productId } = req.body;
  const userId = req.user_id;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }

  try {
    let wishlist = await WishList.findOne({ user_id: userId });

    if (!wishlist) {
      wishlist = await WishList.create({ user_id: userId, product_id: [productId] });
    } else {
      if (wishlist.product_id.includes(productId)) {
        return res.status(409).json({ error: "Item already in wishlist" });
      }
      wishlist.product_id.push(productId);
      await wishlist.save();
    }

    res.status(201).json({ message: "Item added to wishlist", wishlistItem: wishlist });
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Remove a Single Item from Wishlist
 */
wishlistRouter.delete("/remove/:id", auth, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = req.user_id;

  try {
    const wishlist = await WishList.findOne({ user_id: userId });

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    if (!wishlist.product_id.includes(new mongoose.Types.ObjectId(id))) {
      return res.status(404).json({ error: "Product not found in wishlist" });
    }

    wishlist.product_id = wishlist.product_id.filter((product) => product.toString() !== id);

    if (wishlist.product_id.length === 0) {
      await WishList.findByIdAndDelete(wishlist._id);
    } else {
      await wishlist.save();
    }

    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Clear Entire Wishlist
 */
wishlistRouter.delete("/remove", auth, async (req: Request, res: Response): Promise<any> => {
  const userId = req.user_id;

  try {
    const deletedWishlist = await WishList.findOneAndDelete({ user_id: userId });

    if (!deletedWishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Get User Wishlist
 */
wishlistRouter.get("/", auth, async (req: Request, res: Response): Promise<any> => {
  try {
    const user_id = req.user_id;
    const wishlistItems = await WishList.find({ user_id }).populate("product_id");
    res.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default wishlistRouter;
