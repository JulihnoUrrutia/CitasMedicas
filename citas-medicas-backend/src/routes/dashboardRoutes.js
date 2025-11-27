const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

// 🔴 Alertas de riesgo
router.get('/alertas-riesgo', async (req, res) => {
  try {
    const [alertas] = await sequelize.query(`
      SELECT 
        id, usuario_id, doctor_id, fecha_cita, hora_cita,
        especialidad, motivo, sintomas, consultorio, estado,
        ausente, probabilidad_no_show, categoria_riesgo
      FROM citas 
      WHERE categoria_riesgo IN ('medio', 'alto')
      AND fecha_cita >= CURDATE()
      ORDER BY probabilidad_no_show DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      alertas: alertas,
      total: alertas.length
    });
  } catch (error) {
    console.error('Error en alertas-riesgo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📊 Tendencias y análisis
router.get('/tendencias', async (req, res) => {
  try {
    const [metricas] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_citas,
        SUM(ausente) as total_ausentes,
        AVG(COALESCE(probabilidad_no_show, 0)) as riesgo_promedio,
        especialidad,
        DAYNAME(fecha_cita) as dia_semana
      FROM citas 
      WHERE fecha_cita >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY especialidad, dia_semana
      ORDER BY total_ausentes DESC
    `);

    const totalCitas = metricas.reduce((sum, row) => sum + row.total_citas, 0);
    const totalAusentes = metricas.reduce((sum, row) => sum + row.total_ausentes, 0);
    
    res.json({
      success: true,
      metricas,
      resumen: {
        totalCitasAnalizadas: totalCitas,
        totalAusentes: totalAusentes,
        tasaNoShowGeneral: totalCitas > 0 ? (totalAusentes / totalCitas) : 0
      }
    });
  } catch (error) {
    console.error('Error en tendencias:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📈 Métricas generales
router.get('/metricas', async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_citas,
        SUM(ausente) as total_ausentes,
        AVG(COALESCE(probabilidad_no_show, 0)) as riesgo_promedio,
        COUNT(CASE WHEN categoria_riesgo = 'alto' THEN 1 END) as alertas_altas,
        COUNT(CASE WHEN categoria_riesgo = 'medio' THEN 1 END) as alertas_medias
      FROM citas
      WHERE fecha_cita >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error en metricas:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;