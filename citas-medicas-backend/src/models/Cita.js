// src/models/Cita.js
module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define(
    'Cita',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },

      usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
      doctorId: { type: DataTypes.INTEGER, allowNull: false, field: 'doctor_id' },

      fechaCita: { type: DataTypes.DATE, allowNull: false, field: 'fecha_cita' },
      horaCita: { type: DataTypes.TIME, allowNull: false, field: 'hora_cita' },

      especialidad: { type: DataTypes.STRING(100), allowNull: false, field: 'especialidad' },
      motivo: { type: DataTypes.TEXT, allowNull: true, field: 'motivo' },
      sintomas: { type: DataTypes.TEXT, allowNull: true, field: 'sintomas' },
      consultorio: { type: DataTypes.STRING(100), allowNull: true, field: 'consultorio' },

      estado: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'pendiente', field: 'estado' },
      ausente: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, field: 'ausente' },
      observaciones: { type: DataTypes.TEXT, allowNull: true, field: 'observaciones' },
      notas: { type: DataTypes.TEXT, allowNull: true, field: 'notas' }
    },
    {
      tableName: 'citas',
      timestamps: true // createdAt, updatedAt
    }
  );

  Cita.associate = (models) => {
    Cita.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
    Cita.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  };

  return Cita;
};
