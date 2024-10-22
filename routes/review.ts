import express, { Request, Response } from 'express';
import { Review, Orders, OrderItems, Users } from '../models'; 
import authenticateToken from '../middleware/auth';

const ReviewRouter = express.Router();

ReviewRouter.get('/:productId', async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product_id: productId }).populate('user_id');
    console.log({ reviews });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Check if the user has purchased the product
ReviewRouter.get('/hasBought/:productId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user_id;
  const { productId } = req.params;

  try {
    const orders = await Orders.find({ user_id: userId }).select('_id');
    const orderIds = orders.map(order => order._id); // Extract order IDs

    const orderItem = await OrderItems.findOne({
      product_id: productId,
      order_id: { $in: orderIds },
    });

    res.json(!!orderItem); // Return true if order item exists, otherwise false
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({ message: 'Error checking purchase status' });
  }
});

// Post a review for a product
ReviewRouter.post('/:productId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user_id;
  const { productId } = req.params;
  const { comment, rating } = req.body;

  try {
    const newReview = await Review.create({
      product_id: productId,
      user_id: userId,
      comment,
      rating,
      created_at: new Date(),
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error posting review:', error);
    res.status(500).json({ message: 'Error posting review' });
  }
});

export default ReviewRouter;
