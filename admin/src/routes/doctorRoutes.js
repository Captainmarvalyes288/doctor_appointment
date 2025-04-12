import express from 'express';
import { login, listDoctors } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/login', login);
router.get('/list', listDoctors);
router.get('/getAllDoctors', getAllDoctors)


export default router; 