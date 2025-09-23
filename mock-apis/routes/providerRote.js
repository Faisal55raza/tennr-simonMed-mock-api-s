import express from 'express';
import { getProviders } from '../controllers/providerController.js';
const router = express.Router();

router.get('/providers', getProviders);

export default router;