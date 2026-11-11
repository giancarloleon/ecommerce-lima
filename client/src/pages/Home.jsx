import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const addToCart = useCartStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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
    toast.success(`${product.name} se agregó al carrito`, {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

 // 1. Extraemos las categorías únicas
  const categories = ['Todas', ...new Set(products.map((p) => p.category))];

  // 2. Filtramos por buscador Y por categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Todas' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-center mt-10 text-gray-500">Cargando productos...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* HEADER RESPONSIVE */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 shadow-sm mb-6 rounded-lg gap-4">
       {/* 👇 Cambiamos el título para que salude */}
        <h1 className="text-2xl font-bold text-blue-600">
          {user ? `Hola, ${user.name.split(' ')[0]}` : 'Mi E-commerce'}
        </h1>
        
        {/* BARRA DE BÚSQUEDA */}
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

                  {/* BOTONES DE NAVEGACIÓN */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {user ? (
            // 👇 SI HAY USUARIO: Mostramos su menú
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition text-sm">
                  Panel Admin
                </Link>
              )}
              <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                Mis Pedidos
              </Link>
              <Link to="/cart" className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition text-sm">
                Carrito
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:underline text-sm">
                Cerrar Sesión
              </button>
            </>
          ) : (
            // 👇 SI NO HAY USUARIO: Mostramos botones de Login y Registro
            <>
              <Link to="/cart" className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition text-sm">
                Carrito
              </Link>
              <Link to="/login" className="text-blue-600 font-medium hover:underline text-sm">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>
      {/* 👇 NUEVA BARRA DE CATEGORÍAS */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID DE PRODUCTOS (RESPONSIVE) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {/* Imagen */}
            <div className="h-32 sm:h-48 bg-gray-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">Sin imagen</span>
              )}
            </div>
            
            {/* Contenido */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-sm sm:text-lg line-clamp-2">{product.name}</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-2">{product.category}</p>
              
              <div className="mt-auto">
                <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">S/ {product.price}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-600 text-white py-1.5 sm:py-2 rounded hover:bg-blue-700 transition text-xs sm:text-base"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No se encontraron productos para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}