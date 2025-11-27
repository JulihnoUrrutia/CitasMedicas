import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import ModalLogin from "./components/ModalLogin.jsx";
import ModalRegistro from "./components/ModalRegistro.jsx";
import DashboardUsuario from "./components/DashboardUsuario.jsx";
import DashboardAdmin from "./components/DashboardAdmin.jsx";
import apiService from "./services/apiService"; 
import DashboardML from './components/DashboardML';

function App() {
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalRegistroOpen, setIsModalRegistroOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        
        if (token && savedUser) {
          try {
            // Verificar token con el backend
            const result = await apiService.verifyToken();
            if (result.success && result.user) {
              const userData = {
                ...result.user,
                isAdmin: result.user.rol === 'admin'
              };
              setUser(userData);
              setIsLoggedIn(true);
              console.log("✅ Usuario autenticado desde API:", userData);
            } else {
              // Fallback: usar datos del localStorage
              const parsedUser = JSON.parse(savedUser);
              const userData = {
                ...parsedUser,
                isAdmin: parsedUser.rol === 'admin'
              };
              setUser(userData);
              setIsLoggedIn(true);
              console.log("🔄 Usuario cargado desde localStorage:", userData);
            }
          } catch (error) {
            console.error("Error verificando token:", error);
            // Fallback: usar datos del localStorage
            const parsedUser = JSON.parse(savedUser);
            const userData = {
              ...parsedUser,
              isAdmin: parsedUser.rol === 'admin'
            };
            setUser(userData);
            setIsLoggedIn(true);
            console.log("🔄 Usuario cargado desde localStorage (fallback):", userData);
          }
        }
      } catch (error) {
        console.error("Error en checkAuthStatus:", error);
        // Limpiar datos corruptos
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log("🔑 Datos recibidos en handleLoginSuccess:", userData);
    
    const normalizedUser = {
      id: userData.id,
      email: userData.email,
      nombres: userData.nombres,
      apellidoPaterno: userData.apellidoPaterno,
      rol: userData.rol || 'paciente',
      isAdmin: userData.rol === 'admin'
    };
    
    console.log("👤 Usuario normalizado:", normalizedUser);
    console.log("🛡️ ¿Es administrador?:", normalizedUser.isAdmin);
    console.log("🎭 Rol:", normalizedUser.rol);
    
    setUser(normalizedUser);
    setIsLoggedIn(true);
    setIsModalLoginOpen(false);
    
    // Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const handleRegisterSuccess = (userData) => {
    console.log("📝 Registro exitoso:", userData);
    handleLoginSuccess(userData);
    setIsModalRegistroOpen(false);
  };

  const handleLogout = () => {
    try {
      apiService.logout();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("🚪 Sesión cerrada");
    }
  };

  const handleOpenLogin = () => {
    console.log("🔄 Abriendo modal de login");
    setIsModalLoginOpen(true);
    setIsModalRegistroOpen(false);
  };

  const handleOpenRegister = () => {
    console.log("🔄 Abriendo modal de registro");
    setIsModalRegistroOpen(true);
    setIsModalLoginOpen(false);
  };

  const shouldShowAdminDashboard = () => {
    if (!user) {
      console.log("❌ No hay usuario");
      return false;
    }
    
    const isAdmin = user.rol === 'admin';
    console.log("🔍 Verificando dashboard:", {
      userEmail: user.email,
      userRol: user.rol,
      finalDecision: isAdmin ? "ADMIN" : "USER"
    });
    
    return isAdmin;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar
        onLoginClick={handleOpenLogin}
        onRegisterClick={handleOpenRegister}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        user={user}
      />

      <ModalLogin
        visible={isModalLoginOpen}
        onClose={() => setIsModalLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <ModalRegistro
        visible={isModalRegistroOpen}
        onClose={() => setIsModalRegistroOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <main className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          // PANTALLA DE INICIO - NO AUTENTICADO
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg">
                  🏥
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Sistema de Citas 
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Médicas</span>
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Plataforma inteligente para gestionar tus citas médicas de forma eficiente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                    📊
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Gestión de Citas</h3>
                  <p className="text-gray-600">
                    Agenda y administra tus citas médicas de forma rápida y organizada.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                    ⚡
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Fácil de Usar</h3>
                  <p className="text-gray-600">
                    Interfaz intuitiva que facilita la gestión de tus consultas médicas.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                    🎯
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Seguimiento</h3>
                  <p className="text-gray-600">
                    Mantén el control de todas tus citas y consultas médicas.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button 
                  onClick={handleOpenLogin}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:-translate-y-1 flex items-center space-x-3"
                >
                  <span className="group-hover:scale-110 transition-transform">🔐</span>
                  <span>Iniciar Sesión</span>
                </button>
                
                <button 
                  onClick={handleOpenRegister}
                  className="group bg-white text-gray-900 border-2 border-gray-300 px-10 py-4 rounded-xl hover:border-blue-600 hover:shadow-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:-translate-y-1 flex items-center space-x-3"
                >
                  <span className="group-hover:scale-110 transition-transform">✨</span>
                  <span>Crear Cuenta</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mr-3">
                    💡
                  </div>
                  <h3 className="text-lg font-bold text-amber-900">¿Primera vez aquí?</h3>
                </div>
                <p className="text-amber-800 text-sm">
                  Crea una cuenta para empezar a gestionar tus citas médicas. 
                  Es rápido, fácil y seguro.
                </p>
              </div>
            </div>
          </div>
        ) : shouldShowAdminDashboard() ? (
          // DASHBOARD ADMIN
          <div>
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">👑</span>
                <div>
                  <p className="text-green-800 font-semibold">
                    Panel de Administración
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Usuario: {user?.email} | Rol: {user?.rol}
                  </p>
                </div>
              </div>
            </div>
            <DashboardAdmin user={user} onLogout={handleLogout} />
          </div>
        ) : (
          // DASHBOARD USUARIO
          <div>
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <p className="text-blue-800 font-semibold">
                    Mi Panel de Citas
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Bienvenido, {user?.nombres} {user?.apellidoPaterno} | {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <DashboardUsuario user={user} onLogout={handleLogout} />
          </div>
        )}
      </main>

      {!isLoggedIn && (
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                © 2025 Sistema de Citas Médicas. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Desarrollado con React y Node.js
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;