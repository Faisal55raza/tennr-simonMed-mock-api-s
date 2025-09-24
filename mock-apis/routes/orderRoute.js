import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authenticate from '../middlewares/authentication.js';
const router = express.Router();

router.post('/orders', authenticate, createOrder);

export default router;