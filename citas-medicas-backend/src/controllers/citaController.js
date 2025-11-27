const { Cita, Usuario, Doctor } = require("../models");
const { Op, sequelize } = require("sequelize");

const citaController = {

  // =============================================
  // 1. OBTENER TODAS LAS CITAS
  // =============================================
  async getCitas(req, res) {
    try {
      console.log("📋 Obteniendo todas las citas...");
      
      const citas = await Cita.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'email',
              'celular'
            ]
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'especialidad',
              'email',
              'celular',
              'consultorio',
              'horarioTrabajo',
              'isActive' // CORREGIDO: usar isActive en lugar de activo
            ]
          }
        ],
        order: [['fechaCita', 'DESC'], ['horaCita', 'ASC']]
      });

      console.log(`✅ Encontradas ${citas.length} citas`);
      res.json({ success: true, data: citas });

    } catch (error) {
      console.error("❌ Error en getCitas:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error obteniendo citas",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 2. OBTENER CITAS PARA ADMINISTRADOR (NUEVO MÉTODO)
  // =============================================
  async getCitasAdmin(req, res) {
    try {
      const { fecha, estado, usuarioId, doctorId } = req.query;
      console.log("📋 Obteniendo citas para admin...", { fecha, estado, usuarioId, doctorId });

      let whereClause = {};
      
      // Filtro por fecha
      if (fecha) {
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        whereClause.fechaCita = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      }
      
      // Filtro por estado
      if (estado) {
        whereClause.estado = estado;
      }
      
      // Filtro por usuario
      if (usuarioId) {
        whereClause.usuarioId = usuarioId;
      }

      // Filtro por doctor
      if (doctorId) {
        whereClause.doctorId = doctorId;
      }

      const citas = await Cita.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'email',
              'celular'
            ]
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'especialidad',
              'email',
              'celular',
              'consultorio',
              'horarioTrabajo',
              'isActive' // CORREGIDO: usar isActive en lugar de activo
            ]
          }
        ],
        order: [['fechaCita', 'DESC'], ['horaCita', 'ASC']]
      });

      console.log(`✅ Encontradas ${citas.length} citas para admin`);
      
      res.json({
        success: true,
        data: citas,
        total: citas.length,
        filtros: {
          fecha,
          estado,
          usuarioId,
          doctorId
        }
      });

    } catch (error) {
      console.error("❌ Error en getCitasAdmin:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error obteniendo citas para administración",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 3. OBTENER CITAS POR USUARIO
  // =============================================
  async getCitasPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      console.log(`📋 Obteniendo citas para usuario ID: ${usuarioId}`);

      const citas = await Cita.findAll({
        where: { usuarioId },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'especialidad',
              'email',
              'celular',
              'consultorio',
              'horarioTrabajo',
              'isActive' // CORREGIDO: usar isActive
            ]
          }
        ],
        order: [['fechaCita', 'DESC'], ['horaCita', 'ASC']]
      });

      console.log(`✅ Encontradas ${citas.length} citas para usuario ${usuarioId}`);
      res.json({ success: true, data: citas });

    } catch (error) {
      console.error("❌ Error en getCitasPorUsuario:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error obteniendo citas del usuario",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 4. CREAR CITA
  // =============================================
  async createCita(req, res) {
    try {
      const {
        usuarioId,
        doctorId,
        fechaCita,
        horaCita,
        especialidad,
        motivo,
        sintomas,
        consultorio,
        notas,
        observaciones
      } = req.body;

      console.log("📝 Creando nueva cita...", { 
        usuarioId, 
        doctorId, 
        fechaCita, 
        horaCita,
        especialidad,
        notas 
      });

      // Validaciones básicas
      if (!usuarioId || !doctorId || !fechaCita || !horaCita) {
        return res.status(400).json({
          success: false,
          message: "Usuario, doctor, fecha y hora son requeridos"
        });
      }

      // Verificar si el doctor existe y está activo
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return res.status(400).json({
          success: false,
          message: "Doctor no encontrado"
        });
      }

      if (!doctor.isActive) {
        return res.status(400).json({
          success: false,
          message: "El doctor no está activo"
        });
      }

      // Verificar si el usuario existe
      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(400).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      // Verificar disponibilidad del doctor en esa fecha y hora
      const citaExistente = await Cita.findOne({
        where: {
          doctorId,
          fechaCita,
          horaCita,
          estado: {
            [Op.notIn]: ['cancelada', 'completada']
          }
        }
      });

      if (citaExistente) {
        return res.status(400).json({
          success: false,
          message: "El doctor ya tiene una cita programada en ese horario"
        });
      }

      const nuevaCita = await Cita.create({
        usuarioId,
        doctorId,
        fechaCita,
        horaCita,
        especialidad: especialidad || doctor.especialidad,
        motivo,
        sintomas,
        consultorio,
        notas: notas || observaciones || '', // ✅ GUARDAR LAS NOTAS
        observaciones: observaciones || notas || '', 
        estado: 'pendiente'
      });

      const citaCompleta = await Cita.findByPk(nuevaCita.id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'email',
              'celular'
            ]
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'especialidad',
              'email',
              'celular',
              'consultorio',
              'horarioTrabajo',
              'isActive'
            ]
          }
        ]
      });

      console.log(`✅ Cita creada exitosamente - ID: ${nuevaCita.id}`);
      console.log(`📝 Notas guardadas: "${nuevaCita.notas}"`); 
      res.status(201).json({ 
        success: true, 
        message: "Cita creada exitosamente",
        data: citaCompleta 
      });

    } catch (error) {
      console.error("❌ Error en createCita:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error creando cita",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 5. ACTUALIZAR CITA
  // =============================================
  async actualizarCita(req, res) {
    try {
      const { id } = req.params;
      console.log(`✏️ Actualizando cita ID: ${id}`, req.body);

      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada"
        });
      }

      // Campos que se pueden actualizar
      const camposPermitidos = [
        'doctorId', 
        'fechaCita', 
        'horaCita', 
        'especialidad', 
        'motivo', 
        'sintomas', 
        'consultorio', 
        'estado',
        'notas', // ✅ AGREGAR ESTE CAMPO
        'observaciones'
      ];
      
      const datosActualizar = {};
      camposPermitidos.forEach(campo => {
        if (req.body[campo] !== undefined) {
          datosActualizar[campo] = req.body[campo];
        }
      });

      // Si se cambia el doctor, verificar que esté activo
      if (datosActualizar.doctorId) {
        const nuevoDoctor = await Doctor.findByPk(datosActualizar.doctorId);
        if (!nuevoDoctor || nuevoDoctor.activo !== 1) {
          return res.status(400).json({
            success: false,
            message: "El doctor seleccionado no está activo"
          });
        }
      }

      await cita.update(datosActualizar);

      const citaActualizada = await Cita.findByPk(id, {
        include: [
          { 
            model: Usuario, 
            as: 'usuario',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'email',
              'celular'
            ]
          },
          { 
            model: Doctor, 
            as: 'doctor',
            attributes: [
              'id',
              'nombres',
              'apellidoPaterno',
              'apellidoMaterno',
              'especialidad',
              'email',
              'celular',
              'consultorio',
              'horarioTrabajo',
              'isActive'
            ]
          }
        ]
      });

      console.log(`✅ Cita actualizada exitosamente - ID: ${id}`);
      res.json({ 
        success: true, 
        message: "Cita actualizada exitosamente",
        data: citaActualizada 
      });

    } catch (error) {
      console.error("❌ Error en actualizarCita:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error actualizando cita",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 6. CANCELAR / ELIMINAR CITA
  // =============================================
  async cancelarCita(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Cancelando cita ID: ${id}`);

      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada"
        });
      }

      // Marcar como cancelada (NO eliminar)
      await cita.update({ 
        estado: 'cancelada',
        notas: cita.notas ? 
          `${cita.notas}\n[Cancelada el: ${new Date().toLocaleString()}]` : 
          `Cancelada el: ${new Date().toLocaleString()}`
      });

      console.log(`✅ Cita cancelada exitosamente - ID: ${id}`);
      res.json({ 
        success: true, 
        message: "Cita cancelada exitosamente",
        data: {
          id: cita.id,
          estado: cita.estado
        }
      });

    } catch (error) {
      console.error("❌ Error en cancelarCita:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error cancelando cita",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // =============================================
  // 7. OBTENER ESTADÍSTICAS DE CITAS (EXTRA)
  // =============================================
  async getEstadisticasCitas(req, res) {
    try {
      console.log("📊 Obteniendo estadísticas de citas...");

      const totalCitas = await Cita.count();
      const citasPendientes = await Cita.count({ where: { estado: 'pendiente' } });
      const citasConfirmadas = await Cita.count({ where: { estado: 'confirmada' } });
      const citasCanceladas = await Cita.count({ where: { estado: 'cancelada' } });
      const citasCompletadas = await Cita.count({ where: { estado: 'completada' } });

      // Citas por especialidad
      const citasPorEspecialidad = await Cita.findAll({
        attributes: [
          'especialidad',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['especialidad'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      const estadisticas = {
        total: totalCitas,
        porEstado: {
          pendientes: citasPendientes,
          confirmadas: citasConfirmadas,
          canceladas: citasCanceladas,
          completadas: citasCompletadas
        },
        porEspecialidad: citasPorEspecialidad.reduce((acc, item) => {
          acc[item.especialidad] = parseInt(item.get('total'));
          return acc;
        }, {})
      };

      console.log("✅ Estadísticas generadas correctamente");
      res.json({ success: true, data: estadisticas });

    } catch (error) {
      console.error("❌ Error en getEstadisticasCitas:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error obteniendo estadísticas",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = citaController;