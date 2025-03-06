import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import Cart from "../models/Cart";
import mongoose from "mongoose";

const CartRouter = express.Router();

/**
 * ✅ Get User Cart
 */
CartRouter.get("/", auth, async (req: Request, res: Response): Promise<any> => {
  const userId = req.user_id;

  try {
    const cart = await Cart.findOne({ user_id: userId }).populate("products.product_id");
    console.log(cart, "cart");

    res.status(200).json({ cart: cart ? cart.products : [] });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Add to Cart (Creates if not exists, updates if already exists)
 */
CartRouter.post("/add", auth, async (req: Request, res: Response): Promise<any> => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user_id;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { user_id: userId },
      {
        $setOnInsert: { user_id: userId },
        $inc: { "products.$[elem].quantity": quantity },
      },
      {
        upsert: true,
        arrayFilters: [{ "elem.product_id": new mongoose.Types.ObjectId(productId) }],
        new: true,
      }
    );

    // If the product was not found in cart, add it
    if (!updatedCart || !updatedCart.products.some((p) => p.product_id.toString() === productId)) {
      await Cart.findOneAndUpdate(
        { user_id: userId },
        {
          $push: { products: { product_id: new mongoose.Types.ObjectId(productId), quantity } },
        },
        { new: true }
      );
    }

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Update Cart Item Quantity
 */
CartRouter.post("/update", auth, async (req: Request, res: Response):Promise<any> => {
  const { productId, quantity } = req.body;
  const userId = req.user_id;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (quantity < 0) {
    return res.status(400).json({ error: "Quantity cannot be negative" });
  }

  try {
    if (quantity === 0) {
      // ✅ Remove product if quantity is set to 0
      const updatedCart = await Cart.findOneAndUpdate(
        { user_id: userId },
        { $pull: { products: { product_id: productId } } },
        { new: true }
      );
      return res.status(200).json({ message: "Product removed from cart", cart: updatedCart?.products || [] });
    }

    // ✅ Update quantity if > 0
    const updatedCart = await Cart.findOneAndUpdate(
      { user_id: userId, "products.product_id": productId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    res.status(200).json({ message: "Cart updated successfully", cart: updatedCart.products });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Remove a Single Item from Cart
 */
CartRouter.delete("/remove/:productId", auth, async (req: Request, res: Response): Promise<any> => {
  const userId = req.user_id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { user_id: userId },
      { $pull: { products: { product_id: productId } } },
      { new: true }
    );

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json({ message: "Product removed from cart", cart: updatedCart.products });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Clear Entire Cart
 */
CartRouter.delete("/", auth, async (req: Request, res: Response) => {
  const userId = req.user_id;

  try {
    await Cart.findOneAndUpdate({ user_id: userId }, { $set: { products: [] } });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ Sync Guest Cart with User Cart
 */
CartRouter.post("/sync", auth, async (req: Request, res: Response) => {
  const userId = req.user_id;
  const { cart: guestCart } = req.body;

  try {
    let userCart = await Cart.findOne({ user_id: userId });

    if (!userCart) {
      userCart = new Cart({ user_id: userId, products: guestCart });
    } else {
      userCart.products = userCart.products || [];

      guestCart.forEach((guestItem: any) => {
        const existingIndex = userCart!.products.findIndex(
          (item) => item.product_id.toString() === guestItem.product_id
        );

        if (existingIndex > -1) {
          if (userCart) {
            userCart.products[existingIndex].quantity += guestItem.quantity;
          }
        } else {
          if (userCart) {
            userCart.products.push(guestItem);
          }
        }
      });
    }

    await userCart.save();
    res.status(200).json({ message: "Cart synced successfully", cart: userCart.products });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default CartRouter;
