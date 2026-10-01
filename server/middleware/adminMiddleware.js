const adminOnly = (req, res, next) => {
    // Check if authenticated user is an admin
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            message: "Access denied. Admin privileges required."
        });
    }
};

export default adminOnly;