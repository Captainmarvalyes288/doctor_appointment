import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary';
import razorpay from 'razorpay';
import crypto from 'crypto';

// Gateway Initialize
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password');

        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
        
        // Validate required fields
        if (!userId || !docId || !slotDate || !slotTime) {
            console.log("Missing required field:", { userId, docId, slotDate, slotTime });
            return res.json({ success: false, message: 'All fields are required: userId, docId, slotDate, slotTime' });
        }
        
        // Check if slotTime is empty
        if (slotTime === '') {
            return res.json({ success: false, message: 'Appointment time slot cannot be empty' });
        }
        
        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        let slots_booked = docData.slots_booked;

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            }
            else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select("-password");

        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Create a clean copy of docData without the slots_booked field
        const docDataClean = { ...docData.toObject() };
        delete docDataClean.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: docDataClean,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        console.log("Creating appointment with data:", {
            userId, 
            docId, 
            slotDate, 
            slotTime, 
            amount: docData.fees
        });

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Booked', appointmentId: newAppointment._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData;

        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        };

        // creation of an order
        const order = await razorpayInstance.orders.create(options);

        res.json({ 
            success: true, 
            order,
            // Include additional data for frontend implementation
            key_id: process.env.RAZORPAY_KEY_ID,
            appointment_id: appointmentId,
            customer_name: appointmentData.userData.name,
            customer_email: appointmentData.userData.email,
            customer_phone: appointmentData.userData.phone || ""
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            appointmentId
        } = req.body;

        // Creating hmac object 
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

        // Passing the data to be hashed
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        
        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');
        
        // Checking if the signature is valid
        if (generated_signature === razorpay_signature) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            return res.json({ success: true, message: 'Payment Successful' });
        } 
        
        res.json({ success: false, message: 'Payment Failed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to handle payment webhook from Razorpay (optional but recommended)
const razorpayWebhook = async (req, res) => {
    try {
        // Verify the webhook signature
        const webhookSignature = req.headers['x-razorpay-signature'];
        
        // The payload is the raw request body
        const payload = req.rawBody;
        
        // Create HMAC hex digest
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
        hmac.update(payload);
        const digest = hmac.digest('hex');
        
        // Compare signatures
        if (digest === webhookSignature) {
            // Parse the webhook payload
            const webhookData = JSON.parse(payload);
            
            // Handle different event types
            if (webhookData.event === 'payment.captured') {
                const paymentId = webhookData.payload.payment.entity.id;
                const orderId = webhookData.payload.payment.entity.order_id;
                
                // Get the appointment ID from the receipt field in the order
                const orderInfo = await razorpayInstance.orders.fetch(orderId);
                const appointmentId = orderInfo.receipt;
                
                // Mark the appointment as paid
                await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            }
            
            // Acknowledge receipt of webhook
            res.status(200).json({ success: true });
        } else {
            // Signatures don't match
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    razorpayWebhook
};