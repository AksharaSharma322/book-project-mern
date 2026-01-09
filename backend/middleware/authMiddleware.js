const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, error: "No token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded:", decoded);

        // Get user from the token
        const user = await require("../models/User").findById(decoded.id).select("-password");

        if (!user) {
            console.error("User not found for ID:", decoded.id);
            return res.status(401).json({ success: false, error: "User not found" });
        }

        console.log("User authenticated:", user._id);
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
};
