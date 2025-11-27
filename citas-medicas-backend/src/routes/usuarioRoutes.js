const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    console.log('👥 Obteniendo todos los usuarios...');
    
    const usuarios = await Usuario.findAll({
      attributes: { 
        exclude: ['password'] // Excluir contraseña por seguridad
      },
      order: [['created_at', 'DESC']] // CORREGIDO: fechaRegistro -> created_at
    });

    console.log(`✅ Encontrados ${usuarios.length} usuarios`);
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👥 Obteniendo usuario ID: ${id}`);

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;