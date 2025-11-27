'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('citas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'doctores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fechaCita: {
        type: Sequelize.DATE,
        allowNull: false
      },
      horaCita: {
        type: Sequelize.TIME,
        allowNull: false
      },
      especialidad: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'completada', 'cancelada'),
        defaultValue: 'pendiente'
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
    await queryInterface.addIndex('citas', ['usuarioId']);
    await queryInterface.addIndex('citas', ['doctorId']);
    await queryInterface.addIndex('citas', ['fechaCita']);
    await queryInterface.addIndex('citas', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('citas');
  }
};