import React, { useState } from "react";

export default function FormCita({ onAddCita }) {
  const [especialidad, setEspecialidad] = useState("");
  const [doctor, setDoctor] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!especialidad || !doctor || !fecha || !hora) {
      alert("Completa todos los campos");
      return;
    }

    onAddCita({ especialidad, doctor, fecha, hora, id: Date.now() });

    setEspecialidad("");
    setDoctor("");
    setFecha("");
    setHora("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3 border p-4 rounded shadow mb-4">
      <h3 className="font-bold text-blue-600">Agregar Nueva Cita</h3>

      <input
        type="text"
        placeholder="Especialidad"
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Nombre del Doctor"
        value={doctor}
        onChange={(e) => setDoctor(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="time"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
        Agregar Cita
      </button>
    </form>
  );
}
