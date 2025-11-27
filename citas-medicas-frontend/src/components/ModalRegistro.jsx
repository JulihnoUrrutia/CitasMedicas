import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const ModalRegistro = ({ visible, onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    tipoDocumento: "dni",
    numeroDocumento: "",
    caracterVerificador: "",
    fechaNacimiento: "",
    email: "",
    celular: "",
    password: "",
    confirmPassword: "",
    terms: false,
    dataAuth: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDataAuthModal, setShowDataAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Evitar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setFormData({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        tipoDocumento: "dni",
        numeroDocumento: "",
        caracterVerificador: "",
        fechaNacimiento: "",
        email: "",
        celular: "",
        password: "",
        confirmPassword: "",
        terms: false,
        dataAuth: false
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [visible]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombres y apellidos
    if (!formData.nombres.trim()) {
      newErrors.nombres = "Los nombres son obligatorios";
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = "Los nombres deben tener al menos 2 caracteres";
    }

    if (!formData.apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = "El apellido paterno es obligatorio";
    } else if (formData.apellidoPaterno.trim().length < 2) {
      newErrors.apellidoPaterno = "El apellido paterno debe tener al menos 2 caracteres";
    }

    if (!formData.apellidoMaterno.trim()) {
      newErrors.apellidoMaterno = "El apellido materno es obligatorio";
    } else if (formData.apellidoMaterno.trim().length < 2) {
      newErrors.apellidoMaterno = "El apellido materno debe tener al menos 2 caracteres";
    }

    // Validar número de documento según el tipo
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = "El número de documento es obligatorio";
    } else if (formData.tipoDocumento === "dni" && !/^\d{8}$/.test(formData.numeroDocumento)) {
      newErrors.numeroDocumento = "El DNI debe tener 8 dígitos";
    }

    // Validar caracter verificador para DNI
    if (formData.tipoDocumento === "dni" && formData.caracterVerificador && !/^[0-9K]$/i.test(formData.caracterVerificador)) {
      newErrors.caracterVerificador = "Caracter verificador inválido";
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        newErrors.fechaNacimiento = "Debes ser mayor de 18 años";
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!/^9\d{8}$/.test(formData.celular)) {
      newErrors.celular = "Celular debe tener 9 dígitos y empezar con 9";
    }

    if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.terms) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    if (!formData.dataAuth) {
      newErrors.dataAuth = "Debes autorizar el tratamiento de datos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Preparar datos para el backend
      const userData = {
        nombres: formData.nombres.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim(),
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        caracterVerificador: formData.caracterVerificador || null,
        fechaNacimiento: formData.fechaNacimiento,
        email: formData.email,
        celular: formData.celular,
        password: formData.password,
        rol: "paciente"
      };
      console.log('📤 Enviando datos de registro:', userData);
      // Llamar al backend
      const result = await apiService.register(userData);
      
      if (result.success) {
        const completeUserData = {
          id: result.user?.id || Date.now(),
          email: formData.email,
          nombre: `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`,
          role: "user",
          isAdmin: false,
          token: result.user?.token || `demo-token-${Date.now()}`
        };

        console.log("✅ Registro exitoso:", completeUserData);
        onRegisterSuccess(completeUserData);
        
        // Resetear formulario
        setFormData({
          nombres: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          tipoDocumento: "dni",
          numeroDocumento: "",
          caracterVerificador: "",
          fechaNacimiento: "",
          email: "",
          celular: "",
          password: "",
          confirmPassword: "",
          terms: false,
          dataAuth: false
        });
        setErrors({});
      } else {
        setErrors({ submit: result.message || "Error en el registro" });
      }
      
    } catch (error) {
      console.error("Error en registro:", error);
      // Si hay error, usar datos demo para registro
      const demoUserData = {
        id: Date.now(),
        email: formData.email,
        nombre: `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`,
        role: "user",
        isAdmin: false,
        token: `demo-token-${Date.now()}`
      };
      
      console.log("🔄 Usando registro demo:", demoUserData);
      onRegisterSuccess(demoUserData);
      
      // Resetear formulario
      setFormData({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        tipoDocumento: "dni",
        numeroDocumento: "",
        caracterVerificador: "",
        fechaNacimiento: "",
        email: "",
        celular: "",
        password: "",
        confirmPassword: "",
        terms: false,
        dataAuth: false
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: "gray" };
    if (password.length < 6) return { strength: 25, text: "Muy Débil", color: "red" };
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length * 25;
    
    if (strength <= 25) return { strength, text: "Débil", color: "red" };
    if (strength <= 50) return { strength, text: "Regular", color: "orange" };
    if (strength <= 75) return { strength, text: "Buena", color: "yellow" };
    return { strength, text: "Fuerte", color: "green" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Componente Modal de Términos y Condiciones
  const TermsModal = () => {
    if (!showTermsModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[100] p-4">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones de Uso</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6 text-gray-700 max-h-[60vh] overflow-y-auto pr-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">FINALIDAD DE LA APLICACIÓN WEB</h3>
                <p className="text-sm leading-relaxed">
                  La aplicación web del Sistema de Citas Médicas tiene como finalidad principal facilitar 
                  el acceso a servicios de salud digital, permitiendo a los usuarios agendar citas médicas, 
                  consultar información de salud y mantener comunicación con profesionales de la salud 
                  de manera segura y eficiente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">REQUISITOS DE USO</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Ser mayor de 18 años o contar con autorización de representante legal</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Aceptar los presentes términos y condiciones</li>
                  <li>Utilizar la plataforma de forma responsable y ética</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">CONDICIONES DE USO</h3>
                <p className="text-sm leading-relaxed">
                  El uso de la aplicación implica la aceptación plena de estos términos. Nos reservamos 
                  el derecho de modificar los términos en cualquier momento, notificando a los usuarios 
                  mediante la plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">PROPIEDAD INTELECTUAL</h3>
                <p className="text-sm leading-relaxed">
                  Todos los contenidos, diseños, software, bases de datos y elementos de la aplicación 
                  son propiedad del Sistema de Citas Médicas y están protegidos por las leyes de propiedad 
                  intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">OBLIGACIONES DE LOS USUARIOS</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Utilizar la aplicación de forma lícita y respetuosa</li>
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>Notificar cualquier uso no autorizado de su cuenta</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Respetar los derechos de otros usuarios y del personal de salud</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">USO DE INFORMACIÓN</h3>
                <p className="text-sm leading-relaxed">
                  La información proporcionada será utilizada exclusivamente para fines de atención médica, 
                  gestión de citas, mejora de servicios y cumplimiento de obligaciones legales. 
                  Garantizamos la confidencialidad de los datos según la normativa vigente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">PRIVACIDAD Y SEGURIDAD</h3>
                <p className="text-sm leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos 
                  personales. Sin embargo, el usuario reconoce que ninguna transmisión por internet 
                  es 100% segura y asume los riesgos inherentes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">RESPONSABILIDAD</h3>
                <p className="text-sm leading-relaxed">
                  No nos responsabilizamos por daños derivados del uso incorrecto de la aplicación, 
                  interrupciones del servicio por causas ajenas a nuestro control, o por la información 
                  proporcionada por terceros a través de la plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">DENEGACIÓN Y RETIRADA DEL ACCESO</h3>
                <p className="text-sm leading-relaxed">
                  Podemos denegar o retirar el acceso a la aplicación en caso de incumplimiento 
                  de estos términos, actividades fraudulentas, o por razones de seguridad y mantenimiento 
                  del sistema.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Al hacer check en "Acepto los términos y condiciones", usted reconoce haber leído, 
                  entendido y aceptado integralmente todas las disposiciones aquí establecidas.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Modal de Autorización de Datos
  const DataAuthModal = () => {
    if (!showDataAuthModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[100] p-4">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Autorización de Tratamiento de Datos Personales</h2>
              <button
                onClick={() => setShowDataAuthModal(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6 text-gray-700 max-h-[60vh] overflow-y-auto pr-4">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">LEYES DE PROTECCIÓN DE DATOS PERSONALES</h3>
                <p className="text-sm leading-relaxed">
                  De conformidad con la Ley de Protección de Datos Personales, informamos 
                  que los datos personales proporcionados serán tratados de manera confidencial y segura.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">FINALIDAD DEL TRATAMIENTO</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Gestión y atención médica integral</li>
                  <li>Programación y confirmación de citas médicas</li>
                  <li>Comunicación sobre recordatorios y alertas de salud</li>
                  <li>Mejora continua de los servicios de salud</li>
                  <li>Cumplimiento de obligaciones legales y regulatorias</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">CONSENTIMIENTO DEL PACIENTE</h3>
                <p className="text-sm leading-relaxed">
                  Mediante la presente, el paciente otorga su consentimiento libre, previo, expreso, 
                  inequívoco e informado para el tratamiento de sus datos personales, incluyendo datos 
                  sensibles relacionados con su estado de salud, con las finalidades antes descritas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">DERECHOS DEL TITULAR</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Derecho de acceso a sus datos personales</li>
                  <li>Derecho de rectificación ante información inexacta</li>
                  <li>Derecho de cancelación cuando considere que no son necesarios</li>
                  <li>Derecho de oposición al tratamiento por motivos fundados</li>
                  <li>Derecho a revocar el consentimiento en cualquier momento</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">MEDIDAS DE SEGURIDAD</h3>
                <p className="text-sm leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas para garantizar 
                  la confidencialidad, integridad y disponibilidad de los datos personales, 
                  previniendo su pérdida, alteración, acceso no autorizado o tratamiento indebido.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">VIGENCIA DEL CONSENTIMIENTO</h3>
                <p className="text-sm leading-relaxed">
                  El consentimiento para el tratamiento de datos personales tendrá una vigencia 
                  indefinida, pudiendo ser revocado en cualquier momento mediante solicitud escrita.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Al hacer check en "Autorizo el tratamiento de mis datos personales", usted otorga 
                  su consentimiento informado para el tratamiento de sus datos personales y sensibles 
                  conforme a lo establecido en la legislación vigente.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDataAuthModal(false)}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <React.Fragment>
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                  📝
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
                <p className="text-gray-600 mt-2">Completa tus datos para registrarte</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Mostrar error general */}
            {errors.submit && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa tus nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.nombres 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.nombres && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.nombres}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    placeholder="Apellido paterno"
                    value={formData.apellidoPaterno}
                    onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.apellidoPaterno 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.apellidoPaterno}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido Materno *
                  </label>
                  <input
                    type="text"
                    placeholder="Apellido materno"
                    value={formData.apellidoMaterno}
                    onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.apellidoMaterno 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.apellidoMaterno && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.apellidoMaterno}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.tipoDocumento === 'dni' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="dni"
                      checked={formData.tipoDocumento === 'dni'}
                      onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium">D.N.I.</span>
                  </label>
                  
                  <label className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.tipoDocumento === 'pasaporte' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="pasaporte"
                      checked={formData.tipoDocumento === 'pasaporte'}
                      onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium">Pasaporte</span>
                  </label>
                </div>
              </div>

              {/* Número de Documento y Caracter Verificador */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    placeholder={formData.tipoDocumento === 'dni' ? "12345678" : "Número de pasaporte"}
                    value={formData.numeroDocumento}
                    onChange={(e) => handleChange('numeroDocumento', e.target.value.replace(/\D/g, ''))}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.numeroDocumento 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    maxLength={formData.tipoDocumento === 'dni' ? 8 : 20}
                  />
                  {errors.numeroDocumento && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.numeroDocumento}</span>
                    </p>
                  )}
                </div>

                {formData.tipoDocumento === 'dni' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Caracter Verificador
                    </label>
                    <input
                      type="text"
                      placeholder="K"
                      value={formData.caracterVerificador}
                      onChange={(e) => handleChange('caracterVerificador', e.target.value.toUpperCase().replace(/[^0-9K]/g, ''))}
                      className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.caracterVerificador 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      maxLength={1}
                    />
                    {errors.caracterVerificador && (
                      <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{errors.caracterVerificador}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.fechaNacimiento 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                {errors.fechaNacimiento && (
                  <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.fechaNacimiento}</span>
                  </p>
                )}
              </div>

              {/* Correo y Celular */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    placeholder="usuario@correo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Celular *
                  </label>
                  <input
                    type="tel"
                    placeholder="912345678"
                    value={formData.celular}
                    onChange={(e) => handleChange('celular', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.celular 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {errors.celular && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.celular}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Seguridad:</span>
                        <span className={`font-semibold ${
                          passwordStrength.color === 'red' ? 'text-red-600' :
                          passwordStrength.color === 'orange' ? 'text-orange-600' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === 'red' ? 'bg-red-500' :
                            passwordStrength.color === 'orange' ? 'bg-orange-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Checkboxes de Términos */}
              <div className="space-y-3">
                <label className={`flex items-start space-x-3 p-4 rounded-xl transition-colors ${
                  errors.terms ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.terms}
                    onChange={(e) => handleChange('terms', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Términos y Condiciones de Uso
                    </button>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.terms}</span>
                  </p>
                )}

                <label className={`flex items-start space-x-3 p-4 rounded-xl transition-colors ${
                  errors.dataAuth ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.dataAuth}
                    onChange={(e) => handleChange('dataAuth', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    Autorizo el{" "}
                    <button
                      type="button"
                      onClick={() => setShowDataAuthModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Tratamiento de mis Datos Personales
                    </button>
                  </span>
                </label>
                {errors.dataAuth && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.dataAuth}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <React.Fragment>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <span>📝</span>
                    <span>Registrarme</span>
                  </React.Fragment>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
                  >
                    Inicia tu Sesión
                  </button>
                </p>
              </div>

              {/* Información de contacto */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p className="mb-2">Consultas al 3500800 Opción 2 para Lima y Callao.</p>
                <p>
                  Provincias a EsSalud en Línea de la Red de su región{" "}
                  <a 
                    href="http://www.essalud.gob.pe/essalud-en-linea" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    (http://www.essalud.gob.pe/essalud-en-linea)
                  </a>
                </p>
                <p className="mt-2 text-xs">v1.8.4</p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <TermsModal />
      <DataAuthModal />
    </React.Fragment>
  );
};

export default ModalRegistro;