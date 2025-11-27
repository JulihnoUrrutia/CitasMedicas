// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet());

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});
app.use('/api/', limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importar modelos para sincronización
const { Usuario, Doctor, Cita, Especialidad, Ubicacion } = require('./models');

// Sincronizar modelos con la base de datos
const syncDatabase = async () => {
  try {
    await require('./config/database').sync({ force: false });
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
  }
};

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/doctores', require('./routes/doctores'));
app.use('/api/especialidades', require('./routes/especialidades'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de salud del sistema
app.get('/api/health', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    
    // Contar registros en tablas principales
    const usuariosCount = await Usuario.count();
    const doctoresCount = await Doctor.count();
    const citasCount = await Cita.count();
    
    res.json({
      success: true,
      status: 'Sistema funcionando correctamente',
      database: 'Conectado',
      statistics: {
        usuarios: usuariosCount,
        doctores: doctoresCount,
        citas: citasCount
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Error en el sistema',
      database: 'Desconectado',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta de diagnóstico completo
app.get('/api/diagnostic', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    
    // Obtener información de la base de datos
    const [results] = await sequelize.query('SELECT VERSION() as version');
    const dbVersion = results[0].version;
    
    // Verificar tablas existentes
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'sistema_citas_medicas'}'
    `);
    
    const tableNames = tables.map(table => table.TABLE_NAME);
    
    res.json({
      success: true,
      system: {
        node_version: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      },
      database: {
        status: 'Conectado',
        version: dbVersion,
        dialect: 'mysql',
        tables: tableNames
      },
      endpoints: {
        auth: '/api/auth',
        citas: '/api/citas',
        doctores: '/api/doctores',
        especialidades: '/api/especialidades'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: 'Error de conexión',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ruta para información de la API
app.get('/api', (req, res) => {
  res.json({
    name: 'Sistema de Citas Médicas API',
    version: '1.0.0',
    description: 'API para gestión de citas médicas con machine learning',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      citas: {
        list: 'GET /api/citas',
        create: 'POST /api/citas',
        update: 'PUT /api/citas/:id',
        delete: 'DELETE /api/citas/:id'
      },
      doctores: {
        list: 'GET /api/doctores',
        by_especialidad: 'GET /api/doctores/especialidad/:especialidad'
      },
      system: {
        health: 'GET /api/health',
        diagnostic: 'GET /api/diagnostic',
        test: 'GET /api/test'
      }
    },
    documentation: 'Consulta la documentación para más detalles'
  });
});

// Middleware para servir archivos estáticos (si es necesario)
app.use('/uploads', express.static('uploads'));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/citas',
      'POST /api/citas',
      'GET /api/doctores',
      'GET /api/especialidades'
    ]
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('🔥 Error global:', error);
  
  // Clasificar errores
  let statusCode = 500;
  let message = 'Error interno del servidor';
  
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Error de validación: ' + error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'El registro ya existe en la base de datos';
  } else if (error.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Error en la base de datos';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Sincronizar base de datos
    await syncDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
      console.log(`❤️  Salud del sistema: http://localhost:${PORT}/api/health`);
      console.log(`🔍 Diagnóstico: http://localhost:${PORT}/api/diagnostic`);
    });
  } catch (error) {
    console.error('💥 Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔻 Cerrando servidor gracefulmente...');
  try {
    await require('./config/database').close();
    console.log('✅ Conexiones de base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando conexiones:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
if (require.main === module) {
  startServer();
}

module.exports = app;