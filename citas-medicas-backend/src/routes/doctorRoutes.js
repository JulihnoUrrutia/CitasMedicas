const express = require('express');
const router = express.Router();

// Importar controlador CORRECTAMENTE
const doctorController = require('../controllers/doctorController');

// GET /api/doctores - Obtener todos los doctores
router.get('/', doctorController.getDoctores);

// POST /api/doctores - Crear nuevo doctor
router.post('/', doctorController.createDoctor);

module.exports = router;