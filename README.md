#  E-commerce Lima - MERN + PostgreSQL + Culqi

Un sistema completo de comercio electrónico diseñado para pequeños y medianos negocios en Perú. Este proyecto incluye un catálogo público, carrito de compras, pasarela de pagos real con Culqi, y un panel de administración para gestionar inventario y pedidos.

##  Demo en Vivo
- **Frontend (Vercel):** [https://client-sable-five-47.vercel.app/](https://client-sable-five-47.vercel.app/)
- **Backend API (Render):** [https://ecommerce-lima-api.onrender.com](https://ecommerce-lima-api.onrender.com)

##  Tecnologías Utilizadas

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

##  Características Principales

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

##  Capturas de Pantalla

- [Catálogo Principal]
  
<img width="720" height="1600" alt="catalogo responsive" src="https://github.com/user-attachments/assets/ded39bcc-b951-4ce3-88ef-223dc8f647f7" />
<img width="3838" height="1788" alt="catalogo" src="https://github.com/user-attachments/assets/1005896b-dded-4ba1-aabd-3e5c66562483" />
  
- [Panel de Administrador]
  
<img width="3811" height="1770" alt="panel admin" src="https://github.com/user-attachments/assets/cd3f7d6e-df97-4943-86f1-f34a6278e8e3" />
<img width="720" height="1600" alt="admin panel responsive" src="https://github.com/user-attachments/assets/73ec7b91-e73e-4a72-a781-badae79f1327" />

- [Pasarela de Pago Culqi]
  
<img width="3838" height="1784" alt="carrito" src="https://github.com/user-attachments/assets/7b77b541-706e-4475-a81c-40c29f60587a" />
<img width="720" height="1600" alt="carrito responsive" src="https://github.com/user-attachments/assets/974ae227-8fe8-450a-a75a-66c43d7773fb" />

- [Searchbar]
  
  <img width="3838" height="1786" alt="searchbar" src="https://github.com/user-attachments/assets/fa215016-d12f-49c8-a94e-94a631111027" />
  
##  Cómo ejecutar el proyecto localmente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/giancarloleon/ecommerce-lima.git
