import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==============================
// Register User
// ==============================
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // 2. Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5. Send response
        res.status(201).json({
            message:
                "Registration successful. Your account is waiting for admin approval.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};


// ==============================
// Login User
// ==============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Check account status
        if (user.status === "pending") {
            return res.status(403).json({
                message: "Your account is waiting for admin approval"
            });
        }

        if (user.status === "rejected") {
            return res.status(403).json({
                message: "Your account has been rejected"
            });
        }

        // 4. Compare password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 5. Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 6. Login successful
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};


// ==============================
// Export Controllers
// ==============================
export { registerUser, loginUser };