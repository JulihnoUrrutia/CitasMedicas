const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const checkAndCreateTables = async () => {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    // Verificar si las tablas principales existen
    const tablesToCheck = ['usuarios', 'doctores', 'citas'];
    
    for (const tableName of tablesToCheck) {
      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}'`,
        { type: QueryTypes.SELECT }
      );
      
      if (tableExists.length === 0) {
        console.log(`⚠️  La tabla ${tableName} no existe. Se creará automáticamente...`);
      } else {
        console.log(`✅ Tabla ${tableName} encontrada`);
      }
    }

    // Verificar y crear doctores de prueba si no existen
    try {
      const doctoresCount = await sequelize.query(
        "SELECT COUNT(*) as count FROM doctores WHERE activo = TRUE",
        { type: QueryTypes.SELECT }
      );
      
      console.log(`📊 Doctores activos en sistema: ${doctoresCount[0].count}`);

      // Si no hay doctores, crear algunos de ejemplo
      if (doctoresCount[0].count === 0) {
        console.log('👨‍⚕️ Creando doctores de prueba...');
        await sequelize.query(`
          INSERT INTO doctores (nombres, apellidoPaterno, apellidoMaterno, especialidad, codigoCmp, email, celular, activo) VALUES
          ('Carlos', 'Gutiérrez', 'López', 'Cardiología', 'CMP12345', 'carlos.gutierrez@hospital.com', '987654321', TRUE),
          ('Ana', 'Martínez', 'Silva', 'Pediatría', 'CMP12346', 'ana.martinez@hospital.com', '987654322', TRUE),
          ('Luis', 'Rodríguez', 'Pérez', 'Dermatología', 'CMP12347', 'luis.rodriguez@hospital.com', '987654323', TRUE),
          ('María', 'García', 'Hernández', 'Ginecología', 'CMP12348', 'maria.garcia@hospital.com', '987654324', TRUE),
          ('Javier', 'López', 'Morales', 'Traumatología', 'CMP12349', 'javier.lopez@hospital.com', '987654325', TRUE)
        `);
        console.log('✅ 5 doctores de prueba creados');
      }
    } catch (countError) {
      console.log('ℹ️  No se pudo verificar/crear doctores:', countError.message);
    }

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error.message);
  }
};

module.exports = { checkAndCreateTables };