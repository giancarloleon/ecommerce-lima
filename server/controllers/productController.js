// Importamos el cliente de Prisma (asegúrate de que la ruta sea la correcta)
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Crear un producto (Solo Admin en el futuro)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    let imageUrl = req.body.imageUrl; // Por si envían una URL manual

    // 👇 Si el usuario subió un archivo, lo mandamos a Cloudinary
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ecommerce-lima' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = result.secure_url; // Obtenemos la URL de Cloudinary
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        imageUrl, // Guardamos la URL (de Cloudinary o manual)
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// 2. Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products); // 👈 Asegúrate de enviar el array directamente
  } catch (error) {
    console.error("Error en getProducts:", error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// 3. Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el producto' });
  }
};
// Crear múltiples productos a la vez
export const createMultipleProducts = async (req, res) => {
  try {
    const { products } = req.body; // Recibimos un array de productos

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No se enviaron productos' });
    }

    // Formateamos los datos para Prisma
    const formattedProducts = products.map(p => ({
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      stock: parseInt(p.stock),
      category: p.category,
      imageUrl: p.imageUrl || null, // Si por ahora solo usan URL de imagen
    }));

    // createMany inserta todo de golpe en PostgreSQL
    const result = await prisma.product.createMany({
      data: formattedProducts,
    });

    res.status(201).json({ message: 'Productos creados exitosamente', count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear los productos' });
  }
};