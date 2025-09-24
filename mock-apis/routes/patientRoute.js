import express from 'express';
import { getPatients } from '../controllers/patientControllers.js';
import authenticate from '../middlewares/authentication.js';
const router = express.Router();

router.post('/patients', authenticate, getPatients);

export default router;
