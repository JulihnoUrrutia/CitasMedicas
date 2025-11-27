require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/sequelize');
const { sequelize } = require('./src/models');
const { checkAndCreateTables } = require('./src/utils/databaseCheck');

const app = express();

// ==========================================
// CONFIGURACIÓN DE MIDDLEWARES
// ==========================================

// Middleware CORS mejorado
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://localhost:3000',
      'https://localhost:5173'
    ];
    
    // Permitir requests sin origen (como Postman, móviles, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
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
}));

// Middleware para manejar preflight requests
app.options('*', cors());

// Middleware para parsear JSON
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'JSON malformado'
      });
      throw new Error('JSON inválido');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// ==========================================
// MIDDLEWARE DE LOGGING
// ==========================================

app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// RUTAS DE LA API
// ==========================================

// Ruta de salud y diagnóstico
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    
    // Obtener información de la base de datos
    let dbInfo = {};
    if (dbStatus) {
      const [results] = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM usuarios) as total_usuarios,
          (SELECT COUNT(*) FROM doctores WHERE activo = TRUE) as total_doctores,
          (SELECT COUNT(*) FROM citas) as total_citas
      `);
      dbInfo = results[0];
    }

    res.json({
      success: true,
      message: '🚀 Servidor de Citas Médicas funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: dbStatus ? '✅ Conectado' : '❌ Desconectado',
        name: process.env.DB_NAME || 'citas_medicas',
        host: process.env.DB_HOST || 'localhost',
        stats: dbInfo
      },
      server: {
        port: process.env.PORT || 3001,
        node_version: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error en health check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    app: 'Sistema de Citas Médicas',
    version: '1.0.0',
    description: 'Backend para gestión de citas médicas',
    features: [
      'Autenticación de usuarios',
      'Gestión de doctores',
      'Sistema de citas',
      'API RESTful',
      'Dashboard Admin'
    ],
    endpoints: {
      auth: '/api/auth',
      doctores: '/api/doctores',
      citas: '/api/citas',
      usuarios: '/api/usuarios',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// ==========================================
// RUTAS PRINCIPALES DE LA APLICACIÓN
// ==========================================

// Autenticación
app.use('/api/auth', require('./src/routes/auth'));

// Doctores
app.use('/api/doctores', require('./src/routes/doctorRoutes'));

// Citas
app.use('/api/citas', require('./src/routes/citaRoute'));

// Usuarios (NUEVA RUTA - IMPORTANTE)
app.use('/api/usuarios', require('./src/routes/usuarioRoutes'));

// Dashboard Admin (NUEVA RUTA)
app.use('/api/admin', require('./src/routes/adminRoutes'));

// ==========================================
// NUEVA RUTA: DASHBOARD ML (AGREGADA)
// ==========================================

app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));

// ==========================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ==========================================

app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: '🔍 Ruta no encontrada',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: {
        'POST /register': 'Registrar usuario',
        'POST /login': 'Iniciar sesión',
        'GET /verify': 'Verificar token'
      },
      doctores: {
        'GET /': 'Obtener todos los doctores',
        'POST /': 'Crear doctor',
        'GET /:id': 'Obtener doctor por ID'
      },
      citas: {
        'GET /': 'Obtener todas las citas',
        'POST /': 'Crear cita',
        'GET /usuario/:usuarioId': 'Obtener citas por usuario',
        'GET /admin': 'Obtener citas para admin',
        'PUT /:id': 'Actualizar cita',
        'DELETE /:id': 'Cancelar cita'
      },
      usuarios: {
        'GET /': 'Obtener todos los usuarios',
        'GET /:id': 'Obtener usuario por ID'
      },
      admin: {
        'GET /dashboard': 'Estadísticas del dashboard',
        'GET /estadisticas': 'Estadísticas detalladas'
      },
      dashboard: {
        'GET /alertas-riesgo': 'Alertas de riesgo ML',
        'GET /tendencias': 'Tendencias y análisis ML',
        'GET /metricas': 'Métricas del dashboard'
      },
      system: {
        'GET /health': 'Estado del sistema',
        'GET /test': 'Prueba básica',
        'GET /info': 'Información de la API'
      }
    }
  });
});

// ==========================================
// MANEJO GLOBAL DE ERRORES
// ==========================================

app.use((error, req, res, next) => {
  console.error('🔥 Error global del servidor:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Errores de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON malformado en el cuerpo de la solicitud'
    });
  }

  // Errores de validación de Sequelize
  if (error.name && error.name.includes('Sequelize')) {
    return res.status(400).json({
      success: false,
      message: 'Error de base de datos',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        details: error.errors ? error.errors.map(err => err.message) : undefined
      } : undefined
    });
  }

  // Error general del servidor
  res.status(500).json({
    success: false,
    message: '❌ Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? {
      message: error.message,
      stack: error.stack
    } : undefined,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// MANEJADOR DE PROCESOS
// ==========================================

// Manejar cierre graceful del servidor
process.on('SIGINT', async () => {
  console.log('🛑 Recibido SIGINT. Cerrando servidor gracefulmente...');
  try {
    await sequelize.close();
    console.log('✅ Conexión a BD cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando servidor:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recibido SIGTERM. Cerrando servidor...');
  try {
    await sequelize.close();
    console.log('✅ Conexión a BD cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando servidor:', error);
    process.exit(1);
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('💥 ERROR NO CAPTURADO:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 PROMESA RECHAZADA NO MANEJADA:', reason);
  process.exit(1);
});

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Servidor de Citas Médicas...');
    console.log('📋 Configuración inicial:');
    console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Puerto: ${PORT}`);
    console.log(`   - BD: ${process.env.DB_NAME || 'citas_medicas'}`);
    console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);

    // 1. Probar conexión a la base de datos
    console.log('\n🔌 Conectando a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  ADVERTENCIA: No se pudo conectar a la base de datos');
      console.log('   El servidor se iniciará pero algunas funciones pueden no estar disponibles');
    } else {
      console.log('✅ Conexión a BD establecida correctamente');
    }

    // 2. Verificar y crear tablas si es necesario
    console.log('\n🔍 Verificando estructura de la base de datos...');
    await checkAndCreateTables();

    // 3. SOLUCIÓN AL ERROR: Sincronización mejorada
    console.log('\n🔄 Sincronizando modelos...');
    
    try {
      // Intentar sincronización sin alter para evitar error de índices
      await sequelize.sync({ 
        alter: false, // Cambiado a false para evitar el error
        force: false 
      });
      console.log('✅ Modelos sincronizados correctamente');
    } catch (syncError) {
      if (syncError.message.includes('Too many keys')) {
        console.log('⚠️  ADVERTENCIA: Error de índices en sincronización');
        console.log('💡 SOLUCIÓN: Continuando sin sincronización completa');
        console.log('📝 Ejecuta manualmente en PHPMyAdmin:');
        console.log('   ALTER TABLE citas ADD COLUMN probabilidad_no_show FLOAT DEFAULT 0;');
        console.log('   ALTER TABLE citas ADD COLUMN categoria_riesgo ENUM(\'bajo\',\'medio\',\'alto\') DEFAULT \'bajo\';');
      } else {
        throw syncError;
      }
    }

    // 4. Iniciar servidor
    console.log('\n🌐 Iniciando servidor web...');
    app.listen(PORT, () => {
      console.log('\n✨ ==========================================');
      console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
      console.log('✨ ==========================================');
      console.log(`   📍 URL: http://localhost:${PORT}`);
      console.log(`   🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`   🧪 Test: http://localhost:${PORT}/api/test`);
      console.log(`   ℹ️  Info: http://localhost:${PORT}/api/info`);
      console.log('   📚 Documentación de endpoints disponible en /api/*');
      console.log('✨ ==========================================\n');
      
      // Mostrar rutas disponibles
      console.log('🛣️  RUTAS DISPONIBLES:');
      console.log('   🔐 AUTH:');
      console.log('     POST /api/auth/register');
      console.log('     POST /api/auth/login');
      console.log('     GET  /api/auth/verify');
      console.log('');
      console.log('   👨‍⚕️ DOCTORES:');
      console.log('     GET  /api/doctores');
      console.log('     POST /api/doctores');
      console.log('     GET  /api/doctores/:id');
      console.log('');
      console.log('   📅 CITAS:');
      console.log('     GET  /api/citas');
      console.log('     POST /api/citas');
      console.log('     GET  /api/citas/usuario/:usuarioId');
      console.log('     GET  /api/citas/admin');
      console.log('     PUT  /api/citas/:id');
      console.log('     DELETE /api/citas/:id');
      console.log('');
      console.log('   👥 USUARIOS:');
      console.log('     GET  /api/usuarios');
      console.log('     GET  /api/usuarios/:id');
      console.log('');
      console.log('   📊 ADMIN:');
      console.log('     GET  /api/admin/dashboard');
      console.log('     GET  /api/admin/estadisticas');
      console.log('');
      console.log('   🤖 DASHBOARD ML:');
      console.log('     GET  /api/dashboard/alertas-riesgo');
      console.log('     GET  /api/dashboard/tendencias');
      console.log('     GET  /api/dashboard/metricas');
      console.log('');
      console.log('   🖥️  SISTEMA:');
      console.log('     GET  /api/health');
      console.log('     GET  /api/test');
      console.log('     GET  /api/info');
      console.log('\n✨ ==========================================\n');
    });

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO AL INICIAR EL SERVIDOR:');
    console.error('   Mensaje:', error.message);
    
    if (error.message.includes('Too many keys')) {
      console.error('   💡 SOLUCIÓN ESPECÍFICA:');
      console.error('     1. Ejecuta en PHPMyAdmin:');
      console.error('        ALTER TABLE citas ADD COLUMN probabilidad_no_show FLOAT DEFAULT 0;');
      console.error('        ALTER TABLE citas ADD COLUMN categoria_riesgo ENUM(\'bajo\',\'medio\',\'alto\') DEFAULT \'bajo\';');
      console.error('     2. O modifica tus modelos para reducir índices');
    } else {
      console.error('   Stack:', error.stack);
    }
    
    console.log('\n💡 POSIBLES SOLUCIONES:');
    console.log('   1. Verificar que MySQL esté ejecutándose');
    console.log('   2. Verificar credenciales de BD en .env');
    console.log('   3. Verificar que la base de datos exista');
    console.log('   4. Revisar puertos disponibles\n');
    process.exit(1);
  }
};

// ==========================================
// INICIAR LA APLICACIÓN
// ==========================================

// Solo iniciar si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;