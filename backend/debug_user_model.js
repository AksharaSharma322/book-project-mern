const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const email = `debug_${Date.now()}@test.com`;
        const password = "password123";

        console.log("Creating user...");
        const user = await User.create({ email, password });
        console.log("User created:", user);

        console.log("Checking password...");
        const isMatch = await user.comparePassword(password);
        console.log("Password match:", isMatch);

        await mongoose.connection.close();
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    }
})();
