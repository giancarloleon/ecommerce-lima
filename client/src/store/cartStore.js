import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: [],

  addToCart: (product) => {
    const currentItems = get().cartItems;
    const existingItem = currentItems.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        cartItems: currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({ cartItems: [...currentItems, { ...product, quantity: 1 }] });
    }
  },

  // 👇 NUEVO: Función para aumentar la cantidad
  increaseQuantity: (id) => {
    set({
      cartItems: get().cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    });
  },

  // 👇 NUEVO: Función para disminuir la cantidad
  decreaseQuantity: (id) => {
    const currentItems = get().cartItems;
    const existingItem = currentItems.find((item) => item.id === id);

    if (existingItem.quantity === 1) {
      // Si la cantidad es 1 y presiona "-", eliminamos el producto del carrito
      set({ cartItems: currentItems.filter((item) => item.id !== id) });
    } else {
      // Si es mayor a 1, simplemente restamos
      set({
        cartItems: currentItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        ),
      });
    }
  },

  getTotalPrice: () => {
    return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  clearCart: () => set({ cartItems: [] }),
}));