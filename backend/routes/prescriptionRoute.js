import express from 'express';
import { 
  getUserPrescriptions, 
  getPrescription, 
  getPrescriptionByAppointment,
  createPrescription, 
  updatePrescription, 
  deletePrescription 
} from '../controllers/prescriptionController.js';
import { verifyUser, verifyDoctor } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', verifyUser, getUserPrescriptions);
router.get('/:id', verifyUser, getPrescription);
router.get('/appointment/:appointmentId', verifyUser, getPrescriptionByAppointment);

// Doctor routes
router.post('/', verifyDoctor, createPrescription);
router.put('/:id', verifyDoctor, updatePrescription);
router.delete('/:id', verifyDoctor, deletePrescription);

export default router; 