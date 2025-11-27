// src/models/Usuario.js
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombres: { type: DataTypes.STRING(100), allowNull: false, field: 'nombres' },
      apellidoPaterno: { type: DataTypes.STRING(50), allowNull: false, field: 'apellido_paterno' },
      apellidoMaterno: { type: DataTypes.STRING(50), allowNull: false, field: 'apellido_materno' },
      tipoDocumento: { type: DataTypes.ENUM('dni', 'pasaporte'), field: 'tipo_documento', defaultValue: 'dni' },
      numeroDocumento: { type: DataTypes.STRING(20), allowNull: false, unique: true, field: 'numero_documento' },
      caracterVerificador: { type: DataTypes.STRING(1), allowNull: true, field: 'caracter_verificador' },
      fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_nacimiento' },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, field: 'email' },
      celular: { type: DataTypes.STRING(20), allowNull: false, field: 'celular' },
      password: { type: DataTypes.STRING(255), allowNull: false, field: 'password' },
      rol: { type: DataTypes.ENUM('paciente', 'medico', 'admin'), defaultValue: 'paciente', field: 'rol' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
      // ✅ TODOS los campos se mantienen
    },
    {
      tableName: 'usuarios',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      // ✅ AGREGAR esta configuración para reducir índices automáticos:
      indexes: [
        // Solo índices esenciales - mantener únicos necesarios
        { unique: true, fields: ['numero_documento'] },
        { unique: true, fields: ['email'] }
      ]
    }
  );

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Cita, { foreignKey: 'usuarioId', as: 'citas' });
  };

  return Usuario;
};
