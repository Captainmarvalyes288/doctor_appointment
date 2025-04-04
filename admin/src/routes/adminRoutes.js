import express from 'express';
import { login } from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/all-doctors', verifyAdminToken, (req, res) => {
  // TODO: Implement get all doctors
  res.status(200).json({
    success: true,
    doctors: []
  });
});

router.post('/change-availability', verifyAdminToken, (req, res) => {
  // TODO: Implement change availability
  res.status(200).json({
    success: true,
    message: 'Availability updated'
  });
});

router.get('/appointments', verifyAdminToken, (req, res) => {
  // TODO: Implement get appointments
  res.status(200).json({
    success: true,
    appointments: []
  });
});

router.post('/cancel-appointment', verifyAdminToken, (req, res) => {
  // TODO: Implement cancel appointment
  res.status(200).json({
    success: true,
    message: 'Appointment cancelled'
  });
});

router.get('/dashboard', verifyAdminToken, (req, res) => {
  // TODO: Implement get dashboard data
  res.status(200).json({
    success: true,
    dashData: {
      totalDoctors: 0,
      totalAppointments: 0,
      totalPatients: 0
    }
  });
});

export default router; 