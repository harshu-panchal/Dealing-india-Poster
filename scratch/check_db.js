import mongoose from 'mongoose';
import User from './backend/src/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function checkUserData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ 'savedTemplates.0': { $exists: true } });
    console.log(`Found ${users.length} users with saved templates`);

    users.forEach(u => {
      console.log(`User: ${u.name} (${u._id})`);
      u.savedTemplates.forEach((t, i) => {
        console.log(`  Template ${i}: ${t.templateId}`);
        console.log(`    CustomData:`, JSON.stringify(t.customData, null, 2));
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUserData();
