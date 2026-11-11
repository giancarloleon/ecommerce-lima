import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Admin() {
  // Pestañas: 'products', 'orders', 'create' (individual), 'bulk' (masivo)
  const [activeTab, setActiveTab] = useState('products'); 
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario individual
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [imageFile, setImageFile] = useState(null);

  // Estados para el formulario masivo
  const [tempProducts, setTempProducts] = useState([]); 

  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products');
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      
      const ordRes = await api.get('/orders/all'); 
      setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. CREACIÓN INDIVIDUAL (Con imagen)
  const handleSubmitIndividual = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    if (imageFile) data.append('image', imageFile);

    try {
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Producto creado');
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      setImageFile(null);
      fetchData();
      setActiveTab('products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear producto');
    }
  };

  // 2. CREACIÓN MASIVA (A la lista temporal)
  const handleAddToList = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Llena los campos obligatorios');
      return;
    }
    setTempProducts([...tempProducts, { ...formData, id: Date.now() }]);
    setFormData({ name: '', description: '', price: '', stock: '', category: '' });
    toast.success('Añadido a la lista');
  };

  const handleRemoveFromList = (id) => {
    setTempProducts(tempProducts.filter(p => p.id !== id));
  };

  const handleSaveAll = async () => {
    if (tempProducts.length === 0) return;
    try {
      await api.post('/products/bulk', { products: tempProducts });
      toast.success(`${tempProducts.length} productos guardados`);
      setTempProducts([]);
      fetchData();
      setActiveTab('products');
    } catch (error) {
      toast.error('Error al guardar los productos');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category
    });
    setActiveTab('create'); // Lo enviamos a la pestaña de creación/edición
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${editingProduct.id}`, formData);
      toast.success('Producto actualizado');
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      fetchData();
      setActiveTab('products');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

    const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Producto eliminado');
        fetchData(); // Recargamos la tabla
      } catch (error) {
        toast.error('Error al eliminar el producto');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel de Administrador</h2>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Volver a la tienda</Link>
      </div>

      {/* PESTAÑAS */}
      <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-300">
        <button onClick={() => setActiveTab('products')} className={`font-bold pb-3 px-2 ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          Productos y Stock
        </button>
        <button onClick={() => setActiveTab('orders')} className={`font-bold pb-3 px-2 ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          Órdenes ({orders.length})
        </button>
        <button onClick={() => setActiveTab('create')} className={`font-bold pb-3 px-2 ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          + Nuevo Producto
        </button>
        <button onClick={() => setActiveTab('bulk')} className={`font-bold pb-3 px-2 ${activeTab === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          + Creación Masiva
        </button>
      </div>

      {/* 1. TABLA DE PRODUCTOS */}
            {activeTab === 'products' && (
        <div className="space-y-6"> {/* Envolvemos todo en un div con espacio */}
          
          {/* 🚨 ALERTA DE STOCK BAJO */}
          {products.some(p => p.stock < 3) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-red-700 font-bold text-lg">Alerta: Stock por agotarse</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.filter(p => p.stock < 3).map(p => (
                  <div key={p.id} className="bg-white p-3 rounded shadow-sm border border-red-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-red-600 font-bold">Quedan {p.stock} unidades</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLA PRINCIPAL */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            {loading ? (
              <p className="p-6 text-center text-gray-500">Cargando productos...</p>
            ) : products.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No hay productos en la tienda.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">Producto</th>
                    <th className="p-4 font-semibold">Categoría</th>
                    <th className="p-4 font-semibold">Precio</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4 text-gray-600">{p.category}</td>
                      <td className="p-4">S/ {p.price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 5 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock} unds
                        </span>
                      </td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium text-sm transition"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 font-medium text-sm transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 2. ÓRDENES */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
              <div className="flex justify-between border-b pb-3 mb-3">
                <div>
                  <span className="block text-lg font-bold">{order.user.name}</span>
                  <span className="text-sm text-gray-500">{order.user.email}</span>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs mb-1 font-bold ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                  <span className="block text-lg font-bold">S/ {order.totalAmount}</span>
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
        </div>
      )}

      {/* 3. CREACIÓN INDIVIDUAL */}
        {activeTab === 'create' && (
        <form onSubmit={editingProduct ? handleUpdateProduct : handleSubmitIndividual} className="...">
          <h3 className="...">
            {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
            <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full border p-2.5 rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" required onChange={handleChange} value={formData.description} rows="3" className="w-full border p-2.5 rounded-md" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
              <input type="number" step="0.01" name="price" required onChange={handleChange} value={formData.price} className="w-full border p-2.5 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" name="stock" required onChange={handleChange} value={formData.stock} className="w-full border p-2.5 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input type="text" name="category" required onChange={handleChange} value={formData.category} className="w-full border p-2.5 rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto (Opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border p-2.5 rounded-md" />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-bold">
              {editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
            </button>
            {editingProduct && (
              <button 
                type="button" 
                onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', stock: '', category: '' }); setActiveTab('products'); }}
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-md hover:bg-gray-400 font-bold"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* 4. CREACIÓN MASIVA */}
      {activeTab === 'bulk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FORMULARIO IZQUIERDA */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Añadir a la Lista</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" name="name" placeholder="Ej. Polo Oversize" onChange={handleChange} value={formData.name} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" placeholder="Descripción..." onChange={handleChange} value={formData.description} className="w-full border p-2 rounded" rows="2" />
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

          {/* LISTA DERECHA */}
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
    </div>
  );
}