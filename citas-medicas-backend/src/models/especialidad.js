const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Especialidad extends Model {
    static associate(models) {
      Especialidad.hasMany(models.Doctor, {
        foreignKey: 'especialidadId',
        as: 'doctores',
        onDelete: 'CASCADE',
      });
    }
  }

  Especialidad.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    sequelize,
    modelName: "Especialidad",
    tableName: "especialidades",
    timestamps: true,
  });

  return Especialidad;
};