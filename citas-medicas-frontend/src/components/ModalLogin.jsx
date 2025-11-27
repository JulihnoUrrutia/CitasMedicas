import React, { useState, useEffect } from "react";
import apiService from "../services/apiService"; // ✅ CORREGIDO: import por defecto

const ModalLogin = ({ visible, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ CREDENCIALES CORREGIDAS - Usan el usuario REAL de tu base de datos
  const demoCredentials = {
    admin: {
      email: "admin@clinica.com",  // ← USUARIO REAL
      password: "Admin123$",       // ← PASSWORD REAL
      nombre: "Administrador del Sistema",
      role: "administrador"
    },
    paciente: {
      email: "paciente@test.com",
      password: "123456",
      nombre: "Paciente Demo", 
      role: "paciente"
    }
  };

  useEffect(() => {
    if (visible) {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({
          ...prev,
          email: rememberedEmail,
          rememberMe: true
        }));
      }
    }
  }, [visible]);

  const validateForm = () => {
    const newErrors = {};
    setGeneralError("");

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Por favor ingresa un email válido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");

    console.log("🔐 Iniciando proceso de login...");

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password
      };

      console.log("📤 Enviando credenciales al backend:", { 
        email: credentials.email, 
        password: "***" 
      });

      // ✅ CORREGIDO: Llamada correcta a apiService.login()
      const result = await apiService.login(credentials);
      
      console.log("📋 Respuesta completa del backend:", result);
      
      if (result.success && result.user) {
        console.log("✅ Login exitoso con backend real");
        
        // Guardar email si está marcado recordar
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // ✅ CORRECCIÓN: Manejar correctamente el rol del usuario
        const userRole = result.user.rol || result.user.role || 'paciente';
        const isAdmin = userRole === 'administrador' || userRole === 'admin';

        const userData = {
          ...result.user,
          id: result.user.id || result.user._id || Date.now(),
          email: result.user.email || formData.email,
          nombres: result.user.nombres || result.user.nombre || result.user.nombre_completo || 'Usuario',
          apellidoPaterno: result.user.apellidoPaterno || result.user.apellido || '',
          rol: userRole, // ✅ Usar 'rol' consistentemente
          isAdmin: isAdmin // ✅ Calcular correctamente
        };

        console.log("👤 Datos finales del usuario:", userData);

        // Enviar datos del usuario al componente padre
        onLoginSuccess(userData);

        // Resetear formulario
        setFormData({
          email: formData.rememberMe ? formData.email : "",
          password: "",
          rememberMe: formData.rememberMe
        });
        setErrors({});
        setGeneralError("");
        
      } else {
        const errorMessage = result.message || "Error en el inicio de sesión";
        console.log("❌ Error del backend:", errorMessage);
        setGeneralError(errorMessage);
        
        if (errorMessage.includes("credenciales") || errorMessage.includes("incorrect") || errorMessage.includes("inválidas")) {
          alert("❌ Credenciales incorrectas. Por favor, verifica tu email y contraseña.");
        }
      }
      
    } catch (error) {
      console.error("💥 Error en el proceso de login:", error);
      const errorMessage = error.message || "Error inesperado en el login";
      setGeneralError(errorMessage);
      
      if (error.message.includes("Failed to fetch")) {
        alert("🔌 No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:3001");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
    
    if (generalError) {
      setGeneralError("");
    }
  };

  const fillDemoCredentials = async (type) => {
    const credentials = type === 'admin' ? demoCredentials.admin : demoCredentials.paciente;
    
    console.log(`📝 Cargando credenciales ${type}:`, { 
      email: credentials.email, 
      password: "***" 
    });
    
    setFormData(prev => ({
      ...prev,
      email: credentials.email,
      password: credentials.password
    }));
    setErrors({});
    setGeneralError("");
    
    // Intentar login automáticamente con las credenciales demo
    setIsSubmitting(true);
    setGeneralError("");
    
    try {
      console.log("🔄 Intentando login automático con credenciales demo...");
      
      // ✅ CORREGIDO: Llamada correcta a apiService.login()
      const result = await apiService.login({
        email: credentials.email,
        password: credentials.password
      });
      
      if (result.success && result.user) {
        console.log("✅ Login demo exitoso");
        
        const userRole = result.user.rol || result.user.role || credentials.role;
        const isAdmin = userRole === 'administrador' || userRole === 'admin';

        const userData = {
          ...result.user,
          id: result.user.id || Date.now(),
          email: result.user.email || credentials.email,
          nombres: result.user.nombres || credentials.nombre,
          apellidoPaterno: result.user.apellidoPaterno || '',
          rol: userRole,
          isAdmin: isAdmin
        };

        onLoginSuccess(userData);
        setFormData({ email: "", password: "", rememberMe: false });
        
      } else {
        console.log("❌ Las credenciales demo no existen en el backend");
        setGeneralError("Las credenciales demo no están registradas en el sistema");
        
        // Mostrar información específica para admin
        if (type === 'admin') {
          alert(`🔐 Credenciales de Administrador:\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n\nEstas son las credenciales REALES de tu base de datos. Si no funcionan, verifica que el usuario exista.`);
        } else {
          alert(`📝 Credenciales de Paciente:\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n\nEstas credenciales son de ejemplo. Puedes registrarte con estos datos.`);
        }
      }
    } catch (error) {
      console.error("💥 Error en login demo:", error);
      setGeneralError("Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ✅ CORRECCIÓN: Detectar si es admin basado en el usuario REAL
  const isAdminDemo = formData.email === demoCredentials.admin.email;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 border-b border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
              {isAdminDemo ? "🛡️" : "🔐"}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAdminDemo ? "Acceso Administrador" : "Iniciar Sesión"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isAdminDemo 
                ? "Panel de control del sistema" 
                : "Accede a tu cuenta de paciente"
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Botones de demo - CON INFORMACIÓN MEJORADA */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3 text-center">
              💡 <strong>Credenciales pre-cargadas</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('paciente')}
                disabled={isSubmitting}
                className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Demo Paciente
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                disabled={isSubmitting}
                className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Admin Real ✅
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              El botón "Admin Real" usa las credenciales de tu base de datos
            </p>
          </div>

          {/* Información del sistema MEJORADA */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm mt-0.5">
                💡
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Credenciales de Administrador
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>Email:</strong> admin@clinica.com<br/>
                  <strong>Password:</strong> Admin123$
                </p>
              </div>
            </div>
          </div>

          {/* El resto del formulario se mantiene igual */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {generalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span className="text-sm">{generalError}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
                className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full border-2 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isSubmitting}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleChange('rememberMe', e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-gray-700 font-medium">Recordar mi usuario</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isAdminDemo 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Conectando...</span>
                </>
              ) : isAdminDemo ? (
                <>
                  <span>🛡️</span>
                  <span>Acceder como Administrador</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalLogin;