import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createVpsAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const username = 'plenora_admin';
        const email = 'plenora@admin';
        const passwordPlain = 'Plenora@1234';

        // Check if admin already exists by email or username
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email or username.');
            console.log('Updating existing admin password...');
            const hashedPassword = await bcrypt.hash(passwordPlain, 10);
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('✅ Admin password updated successfully!');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Create admin
        const admin = new Admin({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Superadmin created successfully!');
        console.log(`───────────────────────────────────`);
        console.log(`   Username: ${username}`);
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${passwordPlain}`);
        console.log(`───────────────────────────────────`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createVpsAdmin();
