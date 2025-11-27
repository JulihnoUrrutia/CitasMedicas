import React, { useState } from "react";
import FormCita from "./FormCita.jsx";
import ListaCitas from "./ListaCitasUsuario.jsx";

export default function DashboardCitas({ user, onLogout }) {
  const [citas, setCitas] = useState([]);

  const agregarCita = (nuevaCita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">
          Bienvenido, {user}
        </h2>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormCita onAgregarCita={agregarCita} />
        <ListaCitas citas={citas} />
      </div>
    </div>
  );
}
