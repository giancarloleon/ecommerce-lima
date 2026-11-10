import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: [],

  // Agregar producto al carrito
  addToCart: (product) => {
    const currentItems = get().cartItems;
    const existingItem = currentItems.find((item) => item.id === product.id);

    if (existingItem) {
      // Si ya existe, sumamos 1 a la cantidad
      set({
        cartItems: currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      // Si no existe, lo agregamos con cantidad 1
      set({ cartItems: [...currentItems, { ...product, quantity: 1 }] });
    }
  },

  // Calcular el total a pagar
  getTotalPrice: () => {
    return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Vaciar el carrito
  clearCart: () => set({ cartItems: [] }),
}));