import React, { useState } from "react";

const especialidades = {
  Cardiología: ["Dr. Pérez", "Dr. García"],
  Pediatría: ["Dra. López", "Dra. Martínez"],
  Dermatología: ["Dr. Ramírez", "Dra. Torres"]
};

const sintomas = {
  Cardiología: ["Dolor en el pecho", "Palpitaciones", "Presión alta"],
  Pediatría: ["Fiebre", "Tos", "Dolor de garganta"],
  Dermatología: ["Acné", "Eczema", "Psoriasis"]
};

export default function FormCitaUsuario({ onAddCita, user }) {
  const [especialidad, setEspecialidad] = useState("");
  const [doctor, setDoctor] = useState("");
  const [selectedSintomas, setSelectedSintomas] = useState([]);

  const handleSintomaChange = (sintoma) => {
    if (selectedSintomas.includes(sintoma)) {
      setSelectedSintomas(selectedSintomas.filter((s) => s !== sintoma));
    } else {
      setSelectedSintomas([...selectedSintomas, sintoma]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!especialidad || !doctor || selectedSintomas.length === 0) {
      alert("Debes completar todos los campos.");
      return;
    }

    const nuevaCita = {
      usuario: user,
      especialidad,
      doctor,
      sintomas: selectedSintomas,
      fecha: new Date().toLocaleString()
    };

    onAddCita(nuevaCita);
    setEspecialidad("");
    setDoctor("");
    setSelectedSintomas([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border rounded shadow">
      <label>Especialidad</label>
      <select
        value={especialidad}
        onChange={(e) => {
          setEspecialidad(e.target.value);
          setDoctor("");
          setSelectedSintomas([]);
        }}
        className="border p-2 rounded"
      >
        <option value="">Seleccione especialidad</option>
        {Object.keys(especialidades).map((esp) => (
          <option key={esp} value={esp}>{esp}</option>
        ))}
      </select>

      {especialidad && (
        <>
          <label>Doctor</label>
          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Seleccione doctor</option>
            {especialidades[especialidad].map((doc) => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>

          <label>Síntomas / Motivo de la cita</label>
          <div className="flex flex-col gap-1">
            {sintomas[especialidad].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSintomas.includes(s)}
                  onChange={() => handleSintomaChange(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </>
      )}

      <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-2">
        Agregar Cita
      </button>
    </form>
  );
}
