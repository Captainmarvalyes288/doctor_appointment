import express from 'express';
import { 
  getUserLabRecommendations, 
  getLabRecommendation, 
  getLabRecommendationByAppointment,
  createLabRecommendation, 
  updateLabRecommendation,
  updateLabRecommendationStatus,
  deleteLabRecommendation 
} from '../controllers/labRecommendationController.js';
import { verifyUser, verifyDoctor } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', verifyUser, getUserLabRecommendations);
router.get('/:id', verifyUser, getLabRecommendation);
router.get('/appointment/:appointmentId', verifyUser, getLabRecommendationByAppointment);
router.put('/:id/status', verifyUser, updateLabRecommendationStatus);

// Doctor routes
router.post('/', verifyDoctor, createLabRecommendation);
router.put('/:id', verifyDoctor, updateLabRecommendation);
router.delete('/:id', verifyDoctor, deleteLabRecommendation);

export default router;