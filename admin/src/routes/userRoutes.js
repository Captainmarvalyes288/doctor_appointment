import express from 'express';
import { login } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', login);
router.post('/bookAppointment', bookAppointment);
router.get('/getAllDoctors', getAllDoctors);

export default router; 