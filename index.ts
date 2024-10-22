import express from 'express'
import { connectDB } from './db';
import authRouter from './routes/auth'
import { B_PORT } from './config';
import ProductRouter from './routes/product';
import categoryRouter from './routes/category';
import OrderRouter from './routes/order';

const cors=require('cors');
const cookieParser = require("cookie-parser");

const app=express();

connectDB();

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/auth',authRouter)
app.use('/product',ProductRouter)
app.use('/category',categoryRouter)
app.use('/reviews',categoryRouter)
app.use('/order',OrderRouter)


const PORT = B_PORT ;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});