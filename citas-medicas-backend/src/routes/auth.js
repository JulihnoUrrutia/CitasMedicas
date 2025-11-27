// backend/routes/auth.js
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const router = express.Router();

// POST /api/auth/register - REGISTRO CORREGIDO AL 100%
router.post('/register', async (req, res) => {
  try {
    const {
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      tipoDocumento,
      numeroDocumento,
      caracterVerificador,
      fechaNacimiento,
      email,
      celular,
      password,
      rol = 'paciente'
    } = req.body;

    console.log('📝 Registrando nuevo usuario:', email);
    console.log('📋 Datos recibidos:', {
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      tipoDocumento,
      numeroDocumento,
      caracterVerificador,
      fechaNacimiento,
      email,
      celular,
      rol
    });

    // Validaciones básicas
    if (!nombres || !apellidoPaterno || !email || !password || !numeroDocumento || !fechaNacimiento) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: nombres, apellido paterno, email, password, número documento y fecha nacimiento'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      console.log('❌ Email ya registrado:', email);
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el número de documento ya existe - CORREGIDO
    const documentoExistente = await Usuario.findOne({
      where: { numeroDocumento: numeroDocumento }  // ✅ camelCase
    });

    if (documentoExistente) {
      console.log('❌ Documento ya registrado:', numeroDocumento);
      return res.status(400).json({
        success: false,
        message: 'El número de documento ya está registrado'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Contraseña hasheada correctamente');

    // Crear usuario - CORREGIDO AL 100%: usar camelCase como está en el modelo
    console.log('🔍 DEBUG - Creando usuario con campos camelCase');
    
    const nuevoUsuario = await Usuario.create({
      nombres: nombres,
      apellidoPaterno: apellidoPaterno,        // ✅ camelCase
      apellidoMaterno: apellidoMaterno,        // ✅ camelCase
      tipoDocumento: tipoDocumento,            // ✅ camelCase
      numeroDocumento: numeroDocumento,        // ✅ camelCase
      caracterVerificador: caracterVerificador || null,  // ✅ camelCase
      fechaNacimiento: fechaNacimiento,        // ✅ camelCase
      email: email,
      celular: celular,
      password: hashedPassword,
      rol: rol,
      isActive: true                           // ✅ camelCase
    });

    console.log('✅ Usuario creado exitosamente en BD. ID:', nuevoUsuario.id);
    console.log('📊 Datos guardados:', {
      id: nuevoUsuario.id,
      nombres: nuevoUsuario.nombres,
      apellidoPaterno: nuevoUsuario.apellidoPaterno,
      apellidoMaterno: nuevoUsuario.apellidoMaterno,
      email: nuevoUsuario.email
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuario.id, 
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol 
      },
      process.env.JWT_SECRET || 'clave-secreta-temporal',
      { expiresIn: '24h' }
    );

    console.log('✅ Token generado para usuario:', nuevoUsuario.email);

    // Responder con datos del usuario
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: nuevoUsuario.id,
        nombres: nuevoUsuario.nombres,
        apellidoPaterno: nuevoUsuario.apellidoPaterno,
        apellidoMaterno: nuevoUsuario.apellidoMaterno,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        token: token
      },
      token: token
    });

  } catch (error) {
    console.error('💥 Error en registro:', error);
    console.error('🔍 Detalles del error:', error.message);
    console.error('📊 Stack trace:', error.stack);
    
    // Mensaje de error más específico
    let mensajeError = 'Error interno del servidor';
    
    if (error.name === 'SequelizeValidationError') {
      mensajeError = 'Error de validación: ' + error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      mensajeError = 'El email o documento ya existe';
    } else if (error.name === 'SequelizeDatabaseError') {
      mensajeError = 'Error de base de datos: ' + error.message;
    }
    
    res.status(500).json({
      success: false,
      message: mensajeError,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/login - CORREGIDO
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Intentando login para:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario activo
    const usuario = await Usuario.findOne({
      where: { 
        email: email,
        isActive: true  // ✅ camelCase
      }
    });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado o inactivo:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }
    
    console.log('✅ Usuario encontrado:', usuario.email);
    
    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'clave-secreta-temporal',
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login exitoso para:', email);
    
    // Responder con datos del usuario
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidoPaterno: usuario.apellidoPaterno,
        apellidoMaterno: usuario.apellidoMaterno,
        email: usuario.email,
        rol: usuario.rol,
        token: token
      },
      token: token
    });
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/auth/verify - Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
    
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario || !usuario.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    res.json({
      success: true,
      user: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidoPaterno: usuario.apellidoPaterno,
        apellidoMaterno: usuario.apellidoMaterno,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('💥 Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

module.exports = router;