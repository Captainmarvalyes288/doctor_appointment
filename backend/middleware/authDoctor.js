import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;

        if (!dtoken) {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
        }

        // Decode the token
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

        // Ensure token contains expected fields
        if (!token_decode.id) {
            return res.status(403).json({ success: false, message: "Invalid Credentials. Missing ID" });
        }

        req.body.docId = token_decode.id;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid token. Please login again." });
    }
};

export default authDoctor;
