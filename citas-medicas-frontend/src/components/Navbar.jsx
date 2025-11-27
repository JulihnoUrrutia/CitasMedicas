import React from 'react';

export default function Navbar({ onLoginClick, onRegisterClick, onLogoutClick, isLoggedIn, user }) {
  console.log("🔧 Navbar props:", {
    onLoginClick: typeof onLoginClick,
    onRegisterClick: typeof onRegisterClick,
    isLoggedIn,
    user: user
  });

  const handleRegisterClick = () => {
    console.log("🎯 Botón Registrarse clickeado");
    console.log("📞 Llamando a onRegisterClick...");
    if (onRegisterClick && typeof onRegisterClick === 'function') {
      onRegisterClick();
    } else {
      console.error("❌ onRegisterClick no está definido o no es función");
    }
  };

  const handleLoginClick = () => {
    console.log("🎯 Botón Login clickeado");
    console.log("📞 Llamando a onLoginClick...");
    if (onLoginClick && typeof onLoginClick === 'function') {
      onLoginClick();
    } else {
      console.error("❌ onLoginClick no está definido o no es función");
    }
  };

  const getDisplayName = () => {
    if (!user) return 'Usuario';
    if (user.nombres) return user.nombres;
    if (user.nombre) return user.nombre;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const isAdmin = user?.rol === 'admin' || user?.isAdmin;

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              🏥
            </div>
            <span className="text-xl font-bold text-gray-900">Citas Médicas</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 font-medium">
                  Hola, {getDisplayName()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin ? 'Administrador' : 'Paciente'}
                </span>
                <button
                  onClick={onLogoutClick}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium hover:from-blue-700 hover:to-purple-700"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {getDisplayName()}
                </span>
                <button
                  onClick={onLogoutClick}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleLoginClick}
                  className="text-gray-700 px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Login
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Regístrate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}