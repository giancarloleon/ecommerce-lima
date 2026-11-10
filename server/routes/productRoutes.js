import express from 'express';
import { createProduct, getProducts, getProductById } from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener todos (Público) y Crear (Solo Admin)
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Obtener uno por ID (Público)
router.route('/:id')
  .get(getProductById);

export default router;