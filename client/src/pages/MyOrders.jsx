import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error al cargar pedidos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center mt-10 text-gray-500">Cargando tus pedidos...</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Pedidos</h2>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Volver a la tienda</Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">Aún no tienes pedidos realizados.</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Pedido: <span className="font-mono text-xs">{order.id}</span></p>
                  <p className="text-sm text-gray-500">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="md:text-right">
                  <p className={`font-bold ${order.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </p>
                  <p className="font-bold text-xl text-gray-800">S/ {order.totalAmount}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">{item.quantity}x</span>
                      <span>{item.product.name}</span>
                    </div>
                    <span className="font-medium">S/ {item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}