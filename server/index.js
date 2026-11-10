import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
// 👇 AQUÍ ESTÁ EL CAMBIO: Apuntamos a la carpeta generada
import { PrismaClient } from './generated/prisma/index.js'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});