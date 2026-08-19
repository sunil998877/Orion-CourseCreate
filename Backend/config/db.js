import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    console.log(
      `MongoDB Database: ${mongoose.connection.name}`
    );

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;