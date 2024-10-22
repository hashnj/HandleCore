import { URI } from "../config";
import mongoose from 'mongoose';

const uri = URI || '';

export const connectDB = async () => {
  try {
    await mongoose.connect(uri, {});
  console.log('Connected to MongoDB!');
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1); 
}
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB.');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected.');
});