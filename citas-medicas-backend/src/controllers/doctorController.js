const { Doctor } = require("../models");

const doctorController = {

  async getDoctores(req, res) {
    try {
      const doctores = await Doctor.findAll({
        where: { is_active: true },
        order: [['nombres', 'ASC']],
        attributes: [
          'id', 'nombres', 'apellido_paterno', 'apellido_materno',
          'especialidad', 'email', 'celular', 'consultorio',
          'horario_trabajo', 'is_active'
        ]
      });

      res.json({ success: true, data: doctores });

    } catch (error) {
      res.status(500).json({ success: false, message: "Error obteniendo doctores" });
    }
  },

  async createDoctor(req, res) {
    try {
      const {
        nombres,
        apellido_paterno,
        apellido_materno,
        especialidad,
        email,
        celular,
        consultorio,
        horario_trabajo
      } = req.body;

      const doctor = await Doctor.create({
        nombres,
        apellido_paterno,
        apellido_materno,
        especialidad,
        email,
        celular,
        consultorio,
        horario_trabajo,
        is_active: true
      });

      res.status(201).json({ success: true, data: doctor });

    } catch (error) {
      res.status(500).json({ success: false, message: "Error creando doctor" });
    }
  },

  async getDoctorById(req, res) {
    try {
      const { id } = req.params;

      const doctor = await Doctor.findByPk(id);

      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor no encontrado" });
      }

      res.json({ success: true, data: doctor });

    } catch (error) {
      res.status(500).json({ success: false, message: "Error obteniendo doctor" });
    }
  }
};

module.exports = doctorController;
