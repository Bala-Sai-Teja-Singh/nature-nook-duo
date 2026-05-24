import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { UserModel } from '../models/User';

async function seedUsers() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment variables');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');

    const adminEmail = 'admin@naturenook.com';
    const userEmail = 'user@naturenook.com';

    let admin = await UserModel.findOne({ email: adminEmail });
    if (!admin) {
      console.log('Creating Admin user...');
      admin = await UserModel.create({
        _id: `user-admin-${Date.now()}`,
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin'
      });
      console.log('Admin created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    let regularUser = await UserModel.findOne({ email: userEmail });
    if (!regularUser) {
      console.log('Creating Regular user...');
      regularUser = await UserModel.create({
        _id: `user-demo-${Date.now()}`,
        name: 'Demo User',
        email: userEmail,
        password: 'user123', // Will be hashed by pre-save hook
        role: 'user'
      });
      console.log('Regular user created successfully.');
    } else {
      console.log('Regular user already exists.');
    }

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedUsers();
