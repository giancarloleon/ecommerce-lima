import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/index.js'; 
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://client-sable-five-47.vercel.app' 
  ],
  credentials: true
}));
app.use(express.json());
// ... app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

app.get('/', (req, res) => {
  res.json({ message: 'API de E-commerce funcionando 🚀' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ message: 'Conexión a Neon exitosa', userCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error conectando a la base de datos' });
  }
});

app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});