// src/models/Doctor.js
module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
      nombres: { type: DataTypes.STRING(100), allowNull: false, field: 'nombres' },
      apellidoPaterno: { type: DataTypes.STRING(100), allowNull: false, field: 'apellido_paterno' },
      apellidoMaterno: { type: DataTypes.STRING(100), allowNull: true, field: 'apellido_materno' },
      especialidad: { type: DataTypes.STRING(100), allowNull: false, field: 'especialidad' },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, field: 'email' },
      celular: { type: DataTypes.STRING(15), allowNull: true, field: 'celular' },
      consultorio: { type: DataTypes.STRING(50), allowNull: true, field: 'consultorio' },
      horarioTrabajo: { type: DataTypes.STRING(100), allowNull: true, field: 'horario_trabajo' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    },
    {
      tableName: 'doctores',
      timestamps: true // createdAt, updatedAt
    }
  );

  Doctor.associate = (models) => {
    Doctor.hasMany(models.Cita, { foreignKey: 'doctorId', as: 'citas' });
  };

  return Doctor;
};

