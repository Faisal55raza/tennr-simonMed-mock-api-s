import express from 'express';
import { getProviders } from '../controllers/providerController.js';
import authenticate from '../middlewares/authentication.js';
const router = express.Router();

router.post('/providers', authenticate, getProviders);

export default router;
