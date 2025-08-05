import express from "express";
import User from '../models/Doctor.js';
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";


const router = express.Router();



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            id: user._id,
            name: user.name,
            email: user.email,
            token: token,
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.get('/me',protect ,async (req, res) => {
    res.status(200).json( req.user );

});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


export default router;