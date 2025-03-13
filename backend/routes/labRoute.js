import express from 'express'
import { 
  getAllLabs, 
  getLab, 
  createLab, 
  updateLab, 
  deleteLab,
  bookAppointment,
  getUserAppointments,
  updateAppointmentStatus
} from '../controllers/labController.js'
import { verifyAdmin, verifyUser } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllLabs)
router.get('/:id', getLab)

// Protected routes (require admin authentication)
router.post('/', verifyAdmin, createLab)
router.put('/:id', verifyAdmin, updateLab)
router.delete('/:id', verifyAdmin, deleteLab)

// Appointment routes (require user authentication)
router.post('/appointments', verifyUser, bookAppointment)
router.get('/appointments/user', verifyUser, getUserAppointments)
router.put('/appointments/:id/status', verifyUser, updateAppointmentStatus)

export default router 