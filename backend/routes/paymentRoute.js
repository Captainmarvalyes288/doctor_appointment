import express from 'express';
import { verifyUser } from '../middleware/auth.js';
import {
  createLabAppointmentPayment,
  createMedicineOrderPayment,
  verifyLabAppointmentPayment,
  verifyMedicineOrderPayment
} from '../controllers/paymentController.js';

const router = express.Router();

// Lab appointment payment routes
router.post('/lab-appointment/:appointmentId/create', verifyUser, createLabAppointmentPayment);
router.post('/lab-appointment/:appointmentId/verify', verifyUser, verifyLabAppointmentPayment);

// Medicine order payment routes
router.post('/medicine-order/:orderId/create', verifyUser, createMedicineOrderPayment);
router.post('/medicine-order/:orderId/verify', verifyUser, verifyMedicineOrderPayment);

export default router; 