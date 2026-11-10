import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Para alternar entre Login y Registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };

      const response = await api.post(endpoint, payload);

      // Guardamos en Zustand y localStorage
      loginStore(response.data.user, response.data.token);
      
      // Redirigimos al catálogo
      navigate('/'); 
    } catch (err) {
      // Mostramos el error que devuelve nuestro backend
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}