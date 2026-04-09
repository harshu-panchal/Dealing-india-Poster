import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model.js';
import Subcategory from './models/subcategory.model.js';
import Template from './models/template.model.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Create a Festival Category
    const festival = await Category.create({
      name: 'Festivals',
      slug: 'festivals',
      type: 'all',
      image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e'
    });

    // Create a Holi Subcategory
    const holi = await Subcategory.create({
      name: 'Holi',
      slug: 'holi',
      parentId: festival._id
    });

    // Create a Template
    await Template.create({
      name: 'Happy Holi 2026',
      image: 'https://images.unsplash.com/photo-1590076215667-873d3148f323',
      categoryId: festival._id,
      subcategoryId: holi._id,
      type: 'image'
    });

    console.log('Seeding successful!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
