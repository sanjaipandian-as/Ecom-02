import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createAdminSanjai = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const username = 'admin_sanjai';
        const email = 'sanjai_admin_2026@gmail.com';
        const passwordPlain = '9#Tq!RzA4$K@xP8mL^C2&fW7EJH';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email or username.');
            console.log('Existing details:', existingAdmin.email, existingAdmin.username);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Create admin
        const admin = new Admin({
            username,
            email,
            password: hashedPassword,
        });

        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${passwordPlain}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdminSanjai();
