// src/middleware/cors.js
const cors = require('cors');

// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production';

// Lista de dominios permitidos
const allowedOrigins = [
  'http://localhost:3000',     // React local
  'http://localhost:5173',     // Vite local
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://localhost:3000',
  'https://localhost:5173',
  'https://tudominio.com',     // 👈 Reemplaza con tu dominio real de producción
  'https://www.tudominio.com'
];

// Función dinámica para validar orígenes
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (por ejemplo, Postman o apps móviles)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (isProduction) {
      console.log('🚫 CORS bloqueado en producción para:', origin);
      callback(new Error('No permitido por CORS'));
    } else {
      console.log('⚠️ CORS permitido temporalmente en desarrollo para:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-access-token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

// Middleware principal
const corsMiddleware = cors(corsOptions);

// Middleware para manejar preflight requests manualmente
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, x-access-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.sendStatus(200);
  }
  next();
};

module.exports = {
  corsMiddleware,
  handlePreflight
};
