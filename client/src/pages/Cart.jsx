import { useState } from 'react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { loadCheckoutScript, openCheckout } from '@jibaru/culqi/checkout';


export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);

    try {
      // 2. Nos aseguramos de que el script de Culqi esté cargado
      await loadCheckoutScript();

      // 3. Abrimos el checkout con las opciones
      openCheckout({
        publicKey: 'pk_test_ZBEgoMsIJcN2Lp0l', // Tu llave pública directa
        title: 'Mi E-commerce',
        amount: Math.round(getTotalPrice() * 100), // En céntimos
        currency: 'PEN',
        mode: 'modal',
        // 4. Callback cuando el usuario ingresa la tarjeta correctamente
        onToken: async (token) => {
          try {
            // Enviamos el token a tu backend (que ya tiene la lógica de cobro)
            await api.post('/orders', { 
              items: cartItems, 
              culqiToken: token.id 
            });
            
            clearCart();
            alert('¡Pago exitoso! Tu orden está en camino.');
            navigate('/my-orders');
          } catch (error) {
            alert(error.response?.data?.error || 'Error al procesar el pago.');
          } finally {
            setLoading(false);
          }
        },
        // 5. Callback si hay un error (ej. tarjeta rechazada)
        onError: (error) => {
          console.error('Error de Culqi:', error);
          alert(error.user_message || 'Error en la pasarela de pagos.');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error al cargar Culqi:', error);
      alert('No se pudo cargar la pasarela de pagos.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <h2 className="text-2xl font-bold mb-6">Tu Carrito</h2>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 block">
            Volver al catálogo
          </Link>
        </div>
      ) : (
        <>
                    <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow rounded gap-4">
                
                {/* Nombre y Precio */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">Precio unitario: S/ {item.price}</p>
                </div>

                {/* Controles de Cantidad */}
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

                {/* Subtotal */}
                <div className="text-right sm:min-w-[100px]">
                  <p className="font-bold text-lg">S/ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
              </div>
            ))}
          </div>

                    <div className="mt-6 bg-white p-4 shadow rounded">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>S/ {getTotalPrice().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={loading}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 transition text-lg"
            >
              {loading ? 'Procesando pago...' : 'Pagar con Tarjeta'}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Pago 100% seguro procesado por Culqi.
            </p>

            {/* 👇 AQUÍ VA EL NUEVO ENLACE */}
            <div className="text-center mt-4 border-t pt-4">
              <Link to="/" className="inline-block text-gray-600 hover:text-blue-600 font-medium transition">
  ← Seguir comprando
</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}