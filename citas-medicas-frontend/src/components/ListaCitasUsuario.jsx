import React from "react";

export default function ListaCitasUsuario({ citas }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-xl font-bold text-blue-600 mb-3">Mis Citas</h3>
      {citas.length === 0 ? (
        <p>No tienes citas aún</p>
      ) : (
        <ul className="space-y-2">
          {citas.map((cita, index) => (
            <li key={index} className="border p-2 rounded flex flex-col space-y-1">
              <span><strong>Especialidad:</strong> {cita.especialidad}</span>
              <span><strong>Doctor:</strong> {cita.doctor}</span>
              <span><strong>Fecha:</strong> {cita.fecha} <strong>Hora:</strong> {cita.hora}</span>
              {cita.comentarios && <span><strong>Comentarios:</strong> {cita.comentarios}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
