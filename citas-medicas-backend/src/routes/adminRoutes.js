const express = require('express');
const router = express.Router();
const { Usuario, Cita, Doctor } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/dashboard - Estadísticas del dashboard
router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Generando estadísticas del dashboard...');

    // Obtener conteos básicos
    const totalUsuarios = await Usuario.count();
    const totalDoctores = await Doctor.count({ where: { activo: true } });
    const totalCitas = await Cita.count();
    
    // Citas por estado
    const citasPorEstado = await Cita.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['estado']
    });

    // Citas recientes (últimos 7 días)
    const ultimaSemana = new Date();
    ultimaSemana.setDate(ultimaSemana.getDate() - 7);

    const citasRecientes = await Cita.count({
      where: {
        fecha: {
          [Op.gte]: ultimaSemana
        }
      }
    });

    // Usuarios nuevos (últimos 30 días)
    const ultimoMes = new Date();
    ultimoMes.setDate(ultimoMes.getDate() - 30);

    const usuariosNuevos = await Usuario.count({
      where: {
        fechaRegistro: {
          [Op.gte]: ultimoMes
        }
      }
    });

    const estadisticas = {
      resumen: {
        totalUsuarios,
        totalDoctores,
        totalCitas,
        citasRecientes,
        usuariosNuevos
      },
      citasPorEstado: citasPorEstado.reduce((acc, item) => {
        acc[item.estado] = parseInt(item.get('count'));
        return acc;
      }, {}),
      timeline: {
        // Datos para gráficos de timeline
        ultimos7Dias: await getCitasUltimos7Dias(),
        ultimos12Meses: await getCitasUltimos12Meses()
      }
    };

    console.log('✅ Estadísticas generadas correctamente');
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/estadisticas - Estadísticas detalladas
router.get('/estadisticas', async (req, res) => {
  try {
    const { tipo, fechaInicio, fechaFin } = req.query;
    
    console.log('📈 Generando estadísticas detalladas...');

    let estadisticas = {};

    switch (tipo) {
      case 'citas':
        estadisticas = await getEstadisticasCitas(fechaInicio, fechaFin);
        break;
      case 'usuarios':
        estadisticas = await getEstadisticasUsuarios(fechaInicio, fechaFin);
        break;
      case 'doctores':
        estadisticas = await getEstadisticasDoctores(fechaInicio, fechaFin);
        break;
      default:
        estadisticas = await getEstadisticasCompletas(fechaInicio, fechaFin);
    }

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('❌ Error generando estadísticas detalladas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar estadísticas detalladas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Funciones auxiliares
async function getCitasUltimos7Dias() {
  const resultados = [];
  
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);
    
    const count = await Cita.count({
      where: {
        fecha: {
          [Op.between]: [fecha, fechaFin]
        }
      }
    });
    
    resultados.push({
      fecha: fecha.toISOString().split('T')[0],
      citas: count
    });
  }
  
  return resultados;
}

async function getCitasUltimos12Meses() {
  const resultados = [];
  const ahora = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0);
    
    const count = await Cita.count({
      where: {
        fecha: {
          [Op.between]: [fecha, fechaFin]
        }
      }
    });
    
    resultados.push({
      mes: fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      citas: count
    });
  }
  
  return resultados;
}

async function getEstadisticasCitas(fechaInicio, fechaFin) {
  // Implementar lógica específica para citas
  return { tipo: 'citas', mensaje: 'Estadísticas de citas' };
}

async function getEstadisticasUsuarios(fechaInicio, fechaFin) {
  // Implementar lógica específica para usuarios
  return { tipo: 'usuarios', mensaje: 'Estadísticas de usuarios' };
}

async function getEstadisticasDoctores(fechaInicio, fechaFin) {
  // Implementar lógica específica para doctores
  return { tipo: 'doctores', mensaje: 'Estadísticas de doctores' };
}

async function getEstadisticasCompletas(fechaInicio, fechaFin) {
  // Implementar estadísticas completas
  return { tipo: 'completas', mensaje: 'Estadísticas completas' };
}

module.exports = router;