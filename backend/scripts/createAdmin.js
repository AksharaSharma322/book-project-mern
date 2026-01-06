const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = "admin@bookapp.com";

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const admin = new User({
            email: adminEmail,
            password: "admin123",
            role: "admin",
        });

        await admin.save();

        console.log("✅ Admin user created successfully");
        console.log("Email: admin@bookapp.com");
        console.log("Password: admin123");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
