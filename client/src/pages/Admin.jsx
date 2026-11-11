import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // 👈 Usamos las notificaciones bonitas


export default function Admin() {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders' o 'create'
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
   const [quantityToCreate, setQuantityToCreate] = useState(1); 
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [tempProducts, setTempProducts] = useState([]); 

  // Función para recargar datos (productos y órdenes)
  const fetchData = async () => {
    try {
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
      
      const ordRes = await api.get('/orders/all'); 
      setOrders(ordRes.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Calculamos el stock total (stock base * cantidad de lotes)
    const stockBase = parseInt(formData.stock) || 0;
    const stockTotal = stockBase * quantityToCreate;

    // 2. Preparamos el FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', stockTotal); // 👈 Enviamos el stock calculado
    data.append('category', formData.category);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Producto creado con ${stockTotal} unidades en stock`);
      
      // Limpiamos el formulario
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      setQuantityToCreate(1);
      setImageFile(null);
      fetchData(); // Recargamos la tabla
      setActiveTab('products'); // Volvemos a la pestaña de productos
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear producto');
    }
  };
  
    const handleAddToList = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Por favor, llena los campos obligatorios');
      return;
    }
    // Agregamos el producto actual a la lista temporal
    setTempProducts([...tempProducts, { ...formData, id: Date.now() }]);
    // Limpiamos el formulario para el siguiente
    setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
    toast.success('Producto añadido a la lista');
  };

  const handleRemoveFromList = (id) => {
    setTempProducts(tempProducts.filter(p => p.id !== id));
  };

  const handleSaveAll = async () => {
    if (tempProducts.length === 0) return;
    try {
      await api.post('/products/bulk', { products: tempProducts });
      toast.success(`${tempProducts.length} productos guardados en la base de datos`);
      setTempProducts([]); // Limpiamos la lista
      fetchData(); // Recargamos la tabla de productos
      setActiveTab('products'); // Volvemos a la pestaña de productos
    } catch (error) {
      toast.error('Error al guardar los productos');
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel de Administrador</h2>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Volver a la tienda</Link>
      </div>

      {/* Navegación de Pestañas */}
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button onClick={() => setActiveTab('products')} className={`font-bold pb-3 px-2 ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
          Productos y Stock
        </button>
        <button onClick={() => setActiveTab('orders')} className={`font-bold pb-3 px-2 ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
          Órdenes de Compra ({orders.length})
        </button>
        <button onClick={() => setActiveTab('create')} className={`font-bold pb-3 px-2 ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
          + Nuevo Producto
        </button>
      </div>

      {/* CONTENIDO: TABLA DE PRODUCTOS Y STOCK */}
            {/* CONTENIDO: CREAR PRODUCTO MASIVO */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Añadir a la Lista</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" name="name" placeholder="Ej. Polo Oversize" onChange={handleChange} value={formData.name} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" placeholder="Descripción del producto..." onChange={handleChange} value={formData.description} className="w-full border p-2 rounded" rows="2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                  <input type="number" step="0.01" name="price" placeholder="0.00" onChange={handleChange} value={formData.price} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" name="stock" placeholder="0" onChange={handleChange} value={formData.stock} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input type="text" name="category" placeholder="Ej. Ropa" onChange={handleChange} value={formData.category} className="w-full border p-2 rounded" />
              </div>
              
              <button type="button" onClick={handleAddToList} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 font-bold transition">
                + Añadir a la lista
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: LISTA TEMPORAL Y GUARDADO */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Productos a Guardar ({tempProducts.length})</h3>
            
            {tempProducts.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Aún no has añadido productos.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {tempProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">S/ {p.price} | Stock: {p.stock} | {p.category}</p>
                    </div>
                    <button onClick={() => handleRemoveFromList(p.id)} className="text-red-500 hover:text-red-700 font-bold px-2">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleSaveAll} 
              disabled={tempProducts.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              Guardar todos los productos
            </button>
          </div>

        </div>
      )}

      {/* CONTENIDO: LISTA DE ÓRDENES */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between font-bold border-b pb-3 mb-3 gap-2 text-gray-800">
                <div>
                  <span className="block text-lg">Pedido de: {order.user.name}</span>
                  <span className="text-sm text-gray-500 font-normal">{order.user.email}</span>
                </div>
                <div className="md:text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs mb-1 ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                  <span className="block text-lg">S/ {order.totalAmount}</span>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {order.items.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>S/ {(item.quantity * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-500 bg-white p-6 rounded shadow text-center">Aún no hay ventas registradas.</p>}
        </div>
      )}

      {/* CONTENIDO: CREAR PRODUCTO */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-5 max-w-2xl mx-auto border border-gray-100">
          <h3 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Añadir Nuevo Producto</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
            <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" required onChange={handleChange} value={formData.description} rows="3" className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
                    <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
              <input type="number" step="0.01" name="price" required onChange={handleChange} value={formData.price} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock por Lote</label>
              <input type="number" name="stock" required onChange={handleChange} value={formData.stock} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* 👇 NUEVO: Multiplicador de Lotes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Lotes a agregar</label>
            <input 
              type="number" 
              min="1"
              required
              value={quantityToCreate} 
              onChange={(e) => setQuantityToCreate(parseInt(e.target.value) || 1)} 
              className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <p className="text-sm text-blue-600 font-medium mt-1">
              Stock total a registrar: { (parseInt(formData.stock) || 0) * quantityToCreate } unidades
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input type="text" name="category" required onChange={handleChange} value={formData.category} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="w-full border border-gray-300 p-2.5 rounded-md" 
              />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-bold transition duration-200">
            Guardar Producto
          </button>
        </form>
      )}
    </div>
  );
}