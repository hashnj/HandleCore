import express from 'express';
import { connectDB } from './db';
import authRouter from './routes/auth';
import { B_PORT } from './config';
import ProductRouter from './routes/product';
import categoryRouter from './routes/category';
import OrderRouter from './routes/order';
import ReviewRouter from './routes/review';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import CartRouter from './routes/cart';
import wishlistRouter from './routes/wishList';

const app = express();

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'https://corecart.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/product', ProductRouter);
app.use('/cart', CartRouter);
app.use('/category', categoryRouter);
app.use('/wishlist', wishlistRouter);
app.use('/reviews', ReviewRouter);
app.use('/order', OrderRouter);

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = B_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
