import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    try {
        // 1. Get the Authorization header
        const authHeader = req.headers.authorization;

        // 2. Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. No token provided."
            });
        }

        // 3. Extract token
        const token = authHeader.split(" ")[1];

        // 4. Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5. Store decoded user information in request
        req.user = decoded;

        // 6. Continue to the requested route
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized. Invalid or expired token."
        });
    }
};

export default protect;