import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        
        if (!atoken) {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
        }
        
        // Decode the token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        
        // Check if decoded token contains expected admin credentials
        if (token_decode.email !== process.env.ADMIN_EMAIL || token_decode.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not Authorized. Invalid Credentials" });
        }
        
        next();
        
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid token. Please login again." });
    }
};

export default authAdmin;