const express = require("express");
const router = express.Router();
const citaController = require("../controllers/citaController");

// GET /api/citas - Obtener todas las citas
router.get("/", citaController.getCitas);

// GET /api/citas/admin - Obtener citas para administrador (NUEVA RUTA)
router.get("/admin", citaController.getCitasAdmin);

// GET /api/citas/estadisticas - Obtener estadísticas de citas
router.get("/estadisticas", citaController.getEstadisticasCitas);

// GET /api/citas/usuario/:usuarioId - Obtener citas por usuario
router.get("/usuario/:usuarioId", citaController.getCitasPorUsuario);

// POST /api/citas - Crear nueva cita
router.post("/", citaController.createCita);

// PUT /api/citas/:id - Actualizar cita
router.put("/:id", citaController.actualizarCita);

// DELETE /api/citas/:id - Cancelar cita
router.delete("/:id", citaController.cancelarCita);

module.exports = router;