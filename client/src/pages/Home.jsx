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
  const cartItems = useCartStore((state) => state.cartItems); // 👈 Para el contador
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

  const categories = ['Todas', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Todas' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculamos el total de items en el carrito para el contador
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) return <div className="text-center mt-10 text-gray-500">Cargando productos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* HEADER RESPONSIVE */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Título y Bienvenida */}
          <div className="w-full md:w-auto text-center md:text-left">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Mi E-commerce
            </Link>
            {user && <p className="text-xs text-gray-500 mt-1">Hola, {user.name.split(' ')[0]}</p>}
          </div>
          
          {/* Buscador (Ocupa todo el ancho en celular) */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Botones de Navegación */}
          <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition text-xs font-medium">
                    Panel Admin
                  </Link>
                )}
                <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 font-medium text-xs md:text-sm">
                  Mis Pedidos
                </Link>
                
                {/* Botón del Carrito con Contador */}
                <Link to="/cart" className="relative bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition text-xs md:text-sm font-bold flex items-center gap-2">
                  Carrito
                  {totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
                
                <button onClick={handleLogout} className="text-red-500 hover:underline text-xs md:text-sm">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition text-xs md:text-sm font-bold flex items-center gap-2">
                  Carrito
                  {totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="text-blue-600 font-medium hover:underline text-xs md:text-sm">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-medium">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 mt-4">
        {/* BARRA DE CATEGORÍAS */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex flex-col border border-gray-100">
              
              {/* Imagen Cuadrada */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                ) : (
                  <span className="text-gray-400 text-xs">Sin imagen</span>
                )}
              </div>
              
              {/* Contenido */}
              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <p className="text-[10px] sm:text-xs text-blue-500 font-bold mb-1 uppercase tracking-wider">{product.category}</p>
                <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                
                <div className="mt-auto pt-3">
                  <p className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">S/ {product.price}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-bold shadow-sm"
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
          <div className="text-center text-gray-500 mt-10 bg-white p-10 rounded-xl shadow-sm">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium">No se encontraron productos para "{searchTerm}"</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todas');}} className="mt-4 text-blue-600 hover:underline">Limpiar filtros</button>
          </div>
        )}
      </main>
    </div>
  );
}