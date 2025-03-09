import dotenv from "dotenv";

dotenv.config(); 

export const URI = process.env.MONGO_URI || "";
export const JwtSecret = process.env.JWT_SECRET || "default_secret";
export const F_URL = process.env.FRONTEND_URL || "https://corecart.vercel.app";
export const B_PORT = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3300;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET || "";
