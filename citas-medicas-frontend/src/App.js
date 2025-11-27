import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import ModalLogin from "./components/ModalLogin.jsx";
import ModalRegistro from "./components/ModalRegistro.jsx";
import DashboardUsuario from "./components/DashboardUsuario.jsx";
import DashboardAdmin from "./components/DashboardAdmin.jsx";
import "./App.css";
function App() {
    // Estado de usuario tipado correctamente
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);
    // -------------------------------------------------
    // Manejo del login correcto
    // -------------------------------------------------
    const handleLoginSuccess = (userData) => {
        setUser({
            ...userData,
            isAdmin: userData.rol === "admin",
        });
        setShowLogin(false);
    };
    // -------------------------------------------------
    // Cerrar sesión
    // -------------------------------------------------
    const handleLogout = () => {
        setUser(null);
    };
    // -------------------------------------------------
    // Verificar sesión al cargar
    // -------------------------------------------------
    useEffect(() => {
        const verificarSesion = async () => {
            try {
                const stored = localStorage.getItem("usuario");
                if (!stored)
                    return;
                const userData = JSON.parse(stored);
                setUser({
                    ...userData,
                    isAdmin: userData.rol === "admin",
                });
            }
            catch (error) {
                console.error("Error verificando sesión:", error);
            }
        };
        verificarSesion();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, { user: user, onLogin: () => setShowLogin(true), onLogout: handleLogout }), _jsx(ModalLogin, { show: showLogin, onClose: () => setShowLogin(false), onSuccess: handleLoginSuccess }), _jsx(ModalRegistro, { show: showRegistro, onClose: () => setShowRegistro(false) }), user ? (user.isAdmin ? (_jsx(DashboardAdmin, { user: user })) : (_jsx(DashboardUsuario, { user: user }))) : (_jsxs("div", { className: "container mt-5 text-center", children: [_jsx("h2", { children: "Bienvenido al sistema de citas m\u00E9dicas" }), _jsx("p", { children: "Inicia sesi\u00F3n o reg\u00EDstrate para continuar." })] }))] }));
}
export default App;
