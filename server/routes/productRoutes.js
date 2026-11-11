import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  createMultipleProducts, 
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configuración de Multer para subir imágenes a memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1. RUTAS MASIVAS (Deben ir antes de /:id)
router.post('/bulk', protect, admin, createMultipleProducts);

// 2. RUTA RAÍZ (Obtener todos y Crear uno)
router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.single('image'), createProduct); 

// 3. RUTAS POR ID (Obtener y Actualizar)
  router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;