import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const protect = (req, res, next) => {
  let token;

  // Verificamos si el header "Authorization" existe y empieza con "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraemos el token (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verificamos y decodificamos el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adjuntamos los datos del usuario al request para que el controlador los use
      req.user = decoded; 
      
      next(); // Pasamos al siguiente middleware/controlador
    } catch (error) {
      return res.status(401).json({ error: 'Token no válido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, falta el token' });
  }
};
// Middleware para verificar si el usuario es administrador
export const admin = (req, res, next) => {
  // req.user viene del middleware 'protect' que ya definimos antes
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Es admin, puede pasar
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};