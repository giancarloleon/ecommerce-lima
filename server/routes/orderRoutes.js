import express from 'express';
import { createOrder, getUserOrders, getAllOrders } from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/all', protect, admin, getAllOrders); 

export default router;