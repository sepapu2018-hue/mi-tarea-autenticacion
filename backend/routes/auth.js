const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simulación de base de datos en memoria
let users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$10$YourHashedPasswordHere',
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  }
];
let nextId = 2;

// --- CONFIGURACIÓN DE COOKIES ---
const COOKIE_OPTIONS = {
  httpOnly: true, // Protege contra XSS: impide acceso desde JS
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict', // Protege contra CSRF
  maxAge: 24 * 60 * 60 * 1000 // 24 horas
};

// POST /api/auth/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) return res.status(400).json({ error: 'Campos obligatorios' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: nextId++, email, password: hashedPassword, name, role: 'user', createdAt: new Date() };
    users.push(newUser);

    const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // MODIFICADO: Establecer cookie en lugar de enviar token en el body
    res.cookie('token', token, COOKIE_OPTIONS);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // MODIFICADO: Establecer cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login exitoso', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// AGREGADO: POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Sesión cerrada exitosamente' });
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword }); // MODIFICADO: Estructura consistente
});

// Middleware de autenticación (Actualizado para leer cookies)
function authenticateToken(req, res, next) {
  // MODIFICADO: Leer el token desde las cookies
  const token = req.cookies.token; 

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

module.exports = router;