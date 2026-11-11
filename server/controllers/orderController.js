import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import Culqi from 'culqi-node'; 

dotenv.config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Inicializamos Culqi (asegúrate de tener pciCompliant: true)
const culqi = new Culqi({
  privateKey: process.env.CULQI_SECRET_KEY,
  publicKey: process.env.CULQI_PUBLIC_KEY,
  pciCompliant: true,
});

export const createOrder = async (req, res) => {
  try {
    const { items, culqiToken } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email; // 👈 IMPORTANTE: Culqi exige un email válido

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // 1. Validar stock y calcular el total real
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para ${item.name}` });
      }
      totalAmount += product.price.toNumber() * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const amountInCents = Math.round(totalAmount * 100);

    // 2. Cobro REAL con Culqi
    try {
              const charge = await culqi.charges.createCharge({
        amount: amountInCents,
        currency_code: 'PEN',
        email: req.user.email, // 👈 Volvemos a usar el email real del usuario
        source_id: culqiToken, 
      });

      // 3. Si el cobro es exitoso, guardamos la orden
      const newOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PAID',
          paymentId: charge.id,
          items: {
            create: orderItemsData
          }
        }
      });

      // Descontar stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      res.status(201).json({ message: 'Pago procesado exitosamente', orderId: newOrder.id });

    } catch (culqiError) {
      // 🚨 AQUÍ ESTÁ LA MAGIA PARA VER EL ERROR REAL
      console.error('--- ERROR DE CULQI ---');
      console.error(culqiError); 
      
      // Extraemos el mensaje de error de Culqi (si existe)
      const errorMsg = culqiError.user_message || culqiError.merchant_message || culqiError.message || 'Pago rechazado';
      
      // Devolvemos el error real al frontend
      return res.status(400).json({ error: `Culqi dice: ${errorMsg}` });
    }

  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ error: 'Error al procesar la orden' });
  }
};

// ... (aquí abajo va tu función getUserOrders que ya tenías)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true 
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};
// Obtener TODAS las órdenes (Solo para el Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }, // Quién compró
        items: { include: { product: true } } // Qué compró
      }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todas las órdenes' });
  }
};