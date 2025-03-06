import express, { Request, Response } from "express";
import Stripe from "stripe";
import auth from "../middleware/auth";
import { F_URL, STRIPE_SECRET_KEY } from "../config";

const OrderRouter = express.Router();

const stripe = new Stripe(STRIPE_SECRET_KEY as string );

OrderRouter.post("/create-checkout-session", auth, async (req: Request, res: Response) : Promise<any>=> {
  try {
    const { cartItems } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log("Cart Items:", cartItems);
    
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product_id.title,
          images: [item.product_id.images[0]],
          description: item.product_id.description,
        },
        unit_amount: Math.round(item.product_id.price * 100), 
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${F_URL}/payment-success`,
      cancel_url: `${F_URL}/cart`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default OrderRouter;
