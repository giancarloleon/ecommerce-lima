import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';


export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Efecto para cargar los productos al entrar a la página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error cargando productos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    const handleAddToCart = (product) => {
    addToCart(product);
    // 👇 Lanza la notificación
    toast.success(`${product.name} se agregó al carrito`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  if (loading) return <div className="text-center mt-10">Cargando productos...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Navbar simple */}
      <header className="flex justify-between items-center bg-white p-4 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Mi E-commerce</h1>
        <div className="flex items-center gap-4">
          
          {/* 👇 NUEVO: Botón solo para Admins */}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition">
              Panel Admin
            </Link>
          )}

          <Link to="/cart" className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition">
            Carrito
          </Link>
          <span className="text-gray-600">Hola, {user?.name}</span>
          <button onClick={handleLogout} className="text-red-500 hover:underline">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {/* Si no hay imagen, mostramos un placeholder */}
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Sin imagen</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{product.category}</p>
              <p className="text-xl font-bold text-gray-800">S/ {product.price}</p>
              
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                    Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}