import express, { Request, Response } from 'express';
import authenticateToken from '../middleware/auth';
import { OrderItems, Orders, Payment, ShippingAddress, Products, Cart } from '../models'; // Adjust path as necessary

const OrderRouter = express.Router();

// Endpoint to buy a single product directly
OrderRouter.post('/buy', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  const userId: string = req.user_id;
  const { product, quantity, price, address } = req.body;

  try {
    const productData = await Products.findById(product);

    if (!productData) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (productData.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const totalAmount = quantity * price;

    const newOrder = await Orders.create({
      user_id: userId,
      status: 'Shipped',
      total_amount: totalAmount,
    });

    const newOrderItem = await OrderItems.create({
      order_id: newOrder._id,
      product_id: product,
      quantity,
      price,
    });

    const payment = await Payment.create({
      order_id: newOrder._id,
      amount: totalAmount,
      payment_method: 'Visa', // This can be dynamic in the future
      status: 'Paid',
    });

    // Reduce product stock and save the changes
    productData.stock -= quantity;
    await productData.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
      orderItem: newOrderItem,
      payment,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
});

// Endpoint to place an order for items in the cart
OrderRouter.post('/cart', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  const userId: string = req.user_id;
  const { address } = req.body;

  try {
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount : number = 0;
    const inStockItems = [];
    const outOfStockItems = [];

    // Check stock for each cart item
    for (const cartItem of cart.products) {
      const product = await Products.findById(cartItem.product_id);

      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }

      if (product.stock < cartItem.quantity) {
        outOfStockItems.push(cartItem);
      } else {
        inStockItems.push(cartItem);
        totalAmount += parseInt(product.price) * cartItem.quantity;
      }
    }

    if (inStockItems.length === 0) {
      return res.status(400).json({ message: 'No items are available in stock to order' });
    }

    const newOrder = await Orders.create({
      user_id: userId,
      status: 'Shipped',
      total_amount: totalAmount,
      address: {
        address: address.rel,
        postal_code: address.postal_code,
        city: address.city,
        state: address.state,
        country: address.country,
      },
    });

    // Process each in-stock item and update stock levels
    for (const cartItem of inStockItems) {
      const product = await Products.findById(cartItem.product_id);

      if (!product) continue; // Handle any unexpected missing product

      await OrderItems.create({
        order_id: newOrder._id,
        product_id: product._id,
        quantity: cartItem.quantity,
        price: product.price,
      });

      product.stock -= cartItem.quantity;
      await product.save();
    }

    const payment = await Payment.create({
      order_id: newOrder._id,
      amount: totalAmount,
      payment_method: 'Visa',
      status: 'Paid',
    });

    // Update cart to retain out-of-stock items
    cart.products = outOfStockItems;
    await cart.save();

    res.json({
      order: newOrder,
      message: 'Order placed for in-stock items. Out-of-stock items remain in the cart.',
      remainingCart: outOfStockItems,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default OrderRouter;
