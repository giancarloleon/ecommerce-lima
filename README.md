# 🛒 E-commerce Lima - MERN + PostgreSQL + Culqi

Un sistema completo de comercio electrónico diseñado para pequeños y medianos negocios en Perú. Este proyecto incluye un catálogo público, carrito de compras, pasarela de pagos real con Culqi, y un panel de administración para gestionar inventario y pedidos.

## 🚀 Demo en Vivo
- **Frontend (Vercel):** [https://client-sable-five-47.vercel.app/](https://client-sable-five-47.vercel.app/)
- **Backend API (Render):** [https://ecommerce-lima-api.onrender.com](https://ecommerce-lima-api.onrender.com)

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- React + Vite
- Tailwind CSS (Diseño responsive)
- Zustand (Manejo de estado global)
- Axios (Peticiones HTTP)
- React Router DOM
- React Hot Toast (Notificaciones)

**Backend:**
- Node.js + Express
- PostgreSQL (Base de datos en Neon)
- Prisma ORM (Modelado relacional y migraciones)
- JWT (Autenticación basada en tokens)
- Bcrypt (Encriptación de contraseñas)
- Cloudinary (Almacenamiento de imágenes en la nube)
- Culqi (Pasarela de pagos con tarjeta)

## ✨ Características Principales

### Para el Cliente:
- Catálogo de productos con buscador y filtros por categoría.
- Carrito de compras persistente con control de cantidades.
- Checkout con tarjeta de crédito/débito (Integración con Culqi).
- Historial de pedidos ("Mis Pedidos").

### Para el Administrador:
- Panel de administración protegido por roles (JWT).
- CRUD completo de productos (Crear, Leer, Actualizar, Eliminar).
- Creación masiva de inventario (carga rápida de múltiples productos).
- Gestión de stock con alertas visuales de "Stock por agotarse".
- Visualización de todas las órdenes de compra de los clientes.
- Subida de imágenes directa a Cloudinary.
