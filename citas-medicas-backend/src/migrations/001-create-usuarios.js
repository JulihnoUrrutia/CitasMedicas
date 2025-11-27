// migrations/001-create-usuarios.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido_paterno: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido_materno: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tip_documento: {
        type: Sequelize.ENUM('dni', 'pasaporte'),
        defaultValue: 'dni'
      },
      numero_documento: { // 🔥 CAMBIAR a camelCase
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      caracterVerificador: {
        type: Sequelize.STRING(1),
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      celular: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('paciente', 'admin', 'medico'),
        defaultValue: 'paciente'
      },
      fechaRegistro: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fechaActualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices
    await queryInterface.addIndex('usuarios', ['email']);
    await queryInterface.addIndex('usuarios', ['numeroDocumento']); // 🔥 camelCase
    await queryInterface.addIndex('usuarios', ['rol']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};