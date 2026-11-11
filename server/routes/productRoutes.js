import express from 'express';
import { createProduct, getProducts, getProductById, createMultipleProducts } from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import multer from 'multer';


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todos (Público) y Crear (Solo Admin)
router.route('/')
  .get(getProducts)
  //Añadimos upload.single('image')
  .post(protect, admin, upload.single('image'), createProduct); 

// Obtener uno por ID (Público)
router.route('/:id')
  .get(getProductById);

  router.post('/bulk', protect, admin, createMultipleProducts); 

export default router;