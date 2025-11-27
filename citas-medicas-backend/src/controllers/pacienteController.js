const Paciente = require('../models/Usuario');


exports.getPacientes = async (req, res) => {
const pacientes = await Paciente.findAll();
res.json(pacientes);
};


exports.createPaciente = async (req, res) => {
const paciente = await Paciente.create(req.body);
res.json(paciente);
};