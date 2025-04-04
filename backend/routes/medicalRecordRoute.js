import express from 'express';
import { 
  getUserMedicalRecords, 
  getMedicalRecord, 
  getMedicalRecordByAppointment,
  createMedicalRecord, 
  updateMedicalRecord, 
  deleteMedicalRecord 
} from '../controllers/medicalRecordController.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require user authentication
router.use(verifyUser);

// Get all medical records for the authenticated user
router.get('/', getUserMedicalRecords);

// Get a specific medical record by ID
router.get('/:id', getMedicalRecord);

// Get medical record by appointment ID
router.get('/appointment/:appointmentId', getMedicalRecordByAppointment);

// Create a new medical record
router.post('/', createMedicalRecord);

// Update a medical record
router.put('/:id', updateMedicalRecord);

// Delete a medical record
router.delete('/:id', deleteMedicalRecord);

export default router; 