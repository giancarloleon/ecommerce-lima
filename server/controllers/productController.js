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
    let imageUrl = null;

    // 1. Si hay imagen, la subimos a Cloudinary primero
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
      imageUrl = result.secure_url;
    }

    // 2. Verificamos si el producto ya existe (mismo nombre y categoría)
    const existingProduct = await prisma.product.findFirst({
      where: { name, category }
    });

    if (existingProduct) {
      // 3. Si existe, actualizamos sumando el stock
      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          stock: existingProduct.stock + parseInt(stock),
          // Si subieron una nueva imagen, actualizamos la URL
          ...(imageUrl && { imageUrl }), 
        }
      });
      return res.status(200).json(updatedProduct);
    }

    // 4. Si no existe, lo creamos
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        imageUrl,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({ error: 'Error al crear/actualizar el producto' });
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
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No se enviaron productos' });
    }

    for (const p of products) {
      // 1. Buscamos si el producto ya existe (mismo nombre y categoría)
      const existingProduct = await prisma.product.findFirst({
        where: { name: p.name, category: p.category }
      });

      if (existingProduct) {
        // 2. Si existe, ACTUALIZAMOS sumando el stock
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: { stock: existingProduct.stock + parseInt(p.stock) }
        });
      } else {
        // 3. Si no existe, lo CREAMOS
        await prisma.product.create({
          data: {
            name: p.name,
            description: p.description,
            price: parseFloat(p.price),
            stock: parseInt(p.stock),
            category: p.category,
          }
        });
      }
    }

    res.status(201).json({ message: 'Productos procesados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar los productos' });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
    let updateData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
    };

    // Si el admin subió una nueva imagen, la procesamos
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
      updateData.imageUrl = result.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};