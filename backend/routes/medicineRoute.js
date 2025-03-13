import express from 'express'
import { getAllMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController.js'
import { verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllMedicines)
router.get('/:id', getMedicine)

// Protected routes (require admin authentication)
router.post('/', verifyAdmin, createMedicine)
router.put('/:id', verifyAdmin, updateMedicine)
router.delete('/:id', verifyAdmin, deleteMedicine)

export default router 