import mongoose from 'mongoose';
import Feedback from './src/models/feedback.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkFeedback() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Feedback.countDocuments();
    console.log('Feedback Count:', count);
    const feedbacks = await Feedback.find();
    console.log('Feedbacks:', feedbacks);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkFeedback();
