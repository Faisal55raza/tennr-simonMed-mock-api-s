import express from 'express';
import { getAppointments } from '../controllers/appointmentController.js';
import authenticate from '../middlewares/authentication.js';
const router = express.Router();

router.get('/appointments', authenticate, getAppointments);

export default router;