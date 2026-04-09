import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'admin123';

        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            await Admin.deleteOne({ username });
            console.log('Existing admin deleted for re-seeding');
        }

        const admin = new Admin({
            username,
            password,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
