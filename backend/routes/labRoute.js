import express from 'express'
import { getAllLabs, getLab, createLab, updateLab, deleteLab } from '../controllers/labController.js'
import { verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllLabs)
router.get('/:id', getLab)

// Protected routes (require admin authentication)
router.post('/', verifyAdmin, createLab)
router.put('/:id', verifyAdmin, updateLab)
router.delete('/:id', verifyAdmin, deleteLab)

export default router 