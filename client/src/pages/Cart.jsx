import { useState } from 'react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { loadCheckoutScript, openCheckout } from '@jibaru/culqi/checkout';

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);

    try {
      // 1. Cargamos el script de Culqi dinámicamente
      await loadCheckoutScript();

      const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY;

      if (!publicKey) {
        alert("Error: Falta la llave pública de Culqi en el archivo .env");
        setLoading(false);
        return;
      }

      // 2. Abrimos el modal con la librería
      openCheckout({
        publicKey: publicKey,
        title: 'Mi E-commerce',
        amount: Math.round(getTotalPrice() * 100),
        currency: 'PEN',
        mode: 'modal',
        onToken: async (token) => {
          try {
            await api.post('/orders', { items: cartItems, culqiToken: token.id });
            clearCart();
            alert('¡Pago exitoso! Tu orden está en camino.');
            navigate('/my-orders');
          } catch (error) {
            alert(error.response?.data?.error || 'Error al procesar el pago.');
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => {
          console.error('Error de Culqi:', error);
          alert(error.user_message || 'Error en la pasarela de pagos.');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error al cargar Culqi:', error);
      alert('No se pudo cargar la pasarela de pagos.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Tu Carrito</h2>
        <Link to="/" className="text-blue-600 hover:underline font-medium">
          ← Seguir comprando
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 block">
            Volver al catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow rounded-lg gap-4">
                
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">Precio unitario: S/ {item.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 transition font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => increaseQuantity(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-600 transition font-bold text-xl"
                  >
                    +
                  </button>
                </div>

                <div className="text-right sm:min-w-[100px] w-full sm:w-auto">
                  <p className="font-bold text-lg">S/ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white p-6 shadow rounded-lg">
            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Total a pagar:</span>
              <span>S/ {getTotalPrice().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 transition text-lg"
            >
              {loading ? 'Procesando pago...' : 'Pagar con Tarjeta'}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Pago 100% seguro procesado por Culqi.
            </p>
          </div>
        </>
      )}
    </div>
  );
}