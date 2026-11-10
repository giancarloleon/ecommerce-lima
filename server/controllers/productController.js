// Importamos el cliente de Prisma (asegúrate de que la ruta sea la correcta)
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Crear un producto (Solo Admin en el futuro)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    // Prisma espera que el precio sea un Decimal o String para no perder precisión
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Convertimos el string del front a número
        stock: parseInt(stock),
        category,
        imageUrl,
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
      orderBy: { createdAt: 'desc' } // Los más nuevos primero
    });
    res.json(products);
  } catch (error) {
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