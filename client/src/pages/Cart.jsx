import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

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
              <div key={item.id} className="flex justify-between items-center bg-white p-4 shadow rounded">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-500 text-sm">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-bold">S/ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white p-4 shadow rounded">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>S/ {getTotalPrice().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={clearCart}
              className="mt-4 text-red-500 text-sm hover:underline"
            >
              Vaciar carrito
            </button>

            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">
              Proceder al Pago (Culqi)
            </button>
          </div>
        </>
      )}
    </div>
  );
}