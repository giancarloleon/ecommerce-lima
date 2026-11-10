import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Admin() {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', category: '', imageUrl: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Manejador de cambios para todos los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Enviamos los datos al backend
      await api.post('/products', formData);
      
      setMessage('¡Producto creado con éxito!');
      
      // Limpiamos el formulario
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      
      // Opcional: Redirigir al inicio después de 2 segundos
      setTimeout(() => navigate('/'), 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Panel de Administrador</h2>
        <Link to="/" className="text-blue-600 hover:underline">Volver a la tienda</Link>
      </div>
      
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input type="text" name="name" required onChange={handleChange} value={formData.name} className="mt-1 w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea name="description" required onChange={handleChange} value={formData.description} className="mt-1 w-full border p-2 rounded" rows="3" />
        </div>
        
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Precio (S/)</label>
            <input type="number" step="0.01" name="price" required onChange={handleChange} value={formData.price} className="mt-1 w-full border p-2 rounded" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" name="stock" required onChange={handleChange} value={formData.stock} className="mt-1 w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <input type="text" name="category" required onChange={handleChange} value={formData.category} className="mt-1 w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Opcional)</label>
          <input type="text" name="imageUrl" onChange={handleChange} value={formData.imageUrl} className="mt-1 w-full border p-2 rounded" placeholder="https://ejemplo.com/imagen.jpg" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}