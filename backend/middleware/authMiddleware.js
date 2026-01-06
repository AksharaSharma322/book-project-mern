const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "No token, authorization denied",
        });
    }

    try {
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "default_jwt_secret_please_change"
        );

        // ✅ THIS IS THE KEY FIX
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found",
            });
        }

        req.user = user; // now includes role
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Token is not valid",
        });
    }
};
