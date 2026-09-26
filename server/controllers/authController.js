const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        res.status(201).json({
            message: "User registration successful",
            user: {
                name,
                email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

export { registerUser };