import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      alert("Por favor, ingresa un correo válido con '@'.");
      return;
    }

    if (password.trim() === "") {
      alert("La contraseña no puede estar vacía.");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

    onLoginSuccess(email);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
