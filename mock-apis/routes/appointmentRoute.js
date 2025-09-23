import express from 'express';
import { getAppointments } from '../controllers/appointmentController.js';
const router = express.Router();

router.get('/appointments', getAppointments);

export default router;