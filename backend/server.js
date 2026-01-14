const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ← AGREGADO
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
// MODIFICADO: CORS ahora permite credenciales y especifica el origen
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate que coincida con tu puerto de Vite
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser()); // ← AGREGADO: Para que el server lea req.cookies

// Rutas
app.use('/api/auth', authRoutes);

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Acceso concedido a contenido protegido',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
  // MODIFICADO: Ahora lee el token desde las cookies
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ 
    message: '🔐 API de Autenticación con Cookies',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout', // Agregado
      profile: 'GET /api/auth/me (requiere cookie)',
      protected: 'GET /api/protected (requiere cookie)'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});