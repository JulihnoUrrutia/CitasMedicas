import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

export default function DashboardUsuario({ user, onLogout }) {
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState("");
  const [dia, setDia] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [doctor, setDoctor] = useState("");
  const [sintomas, setSintomas] = useState([]);
  const [hora, setHora] = useState("");
  const [consultorio, setConsultorio] = useState("");
  const [notas, setNotas] = useState("");
  const [citaEditando, setCitaEditando] = useState(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctores, setDoctores] = useState([]);

  const userEmail = user?.email || 'Usuario';
  const userId = user?.id;

  const especialidades = [
    "Cardiología", "Dermatología", "Pediatría", "Neurología",
    "Oftalmología", "Ginecología", "Traumatología", "Medicina General"
  ];

  const sintomasPorEspecialidad = {
    Cardiología: ["Palpitaciones", "Dolor en el pecho", "Mareos", "Falta de aire", "Hinchazón piernas"],
    Dermatología: ["Erupción", "Picazón", "Acné", "Manchas", "Descamación"],
    Pediatría: ["Fiebre", "Tos", "Vómitos", "Diarrea", "Dolor abdominal"],
    Neurología: ["Dolor de cabeza", "Mareos", "Entumecimiento", "Visión borrosa", "Pérdida memoria"],
    Oftalmología: ["Visión borrosa", "Ojos rojos", "Dolor ocular", "Lagrimeo", "Sensibilidad luz"],
    Ginecología: ["Dolor abdominal", "Sangrado irregular", "Flujo vaginal", "Dolor relaciones", "Amenorrea"],
    Traumatología: ["Dolor articular", "Hinchazón", "Limitación movimiento", "Deformidad", "Crujidos"],
    "Medicina General": ["Fiebre", "Tos", "Dolor cabeza", "Cansancio", "Pérdida apetito"]
  };

  const consultorios = [
    "Hospital Central - Piso 3",
    "Clínica Norte - Consultorio 205",
    "Centro Médico Sur - Edificio B",
    "Policlínico Este - Ala Oeste",
    "Hospital Regional - Torre 2",
    "Hospital Central - Piso 2",
    "Clínica Norte - Consultorio 101",
    "Centro Médico Sur - Edificio A",
    "Clínica Norte - Consultorio 210",
    "Policlínico Este - Ala Este",
    "Hospital Regional - Torre 1",
    "Clínica Norte - Consultorio 105"
  ];

  const horasDisponibles = [
    "08:00", "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00", "17:00"
  ];

  // =====================================================================================
  // CARGAR CITAS Y DOCTORES
  // =====================================================================================

  useEffect(() => {
    const loadCitas = async () => {
      try {
        console.log('🔄 Cargando citas para usuario:', userId);
        const result = await apiService.getCitas(userId);
        if (result.success) {
          setCitas(result.data || []);
          console.log('✅ Citas cargadas:', result.data);
        } else {
          console.error('❌ Error cargando citas:', result.message);
        }
      } catch (err) {
        console.error("Error al cargar citas", err);
      } finally {
        setLoading(false);
      }
    };

    const loadDoctores = async () => {
      try {
        console.log('🔄 Cargando doctores...');
        const result = await apiService.getDoctores();
        if (result.success) {
          setDoctores(result.data || []);
          console.log('✅ Doctores cargados:', result.data);
        } else {
          console.error('❌ Error cargando doctores:', result.message);
        }
      } catch (err) {
        console.error("Error al cargar doctores", err);
      }
    };

    if (userId) {
      loadCitas();
      loadDoctores();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // =====================================================================================
  // MACHINE LEARNING MEJORADO (Algoritmo de predicción de riesgo)
  // =====================================================================================

  const predecirRiesgoAusencia = (cita) => {
    if (!cita) return 0.2;
    
    let riesgo = 0.2; // Riesgo base

    // Factores de riesgo con pesos mejorados
    const factores = {
      // Factores temporales
      lunes: 0.18,
      viernes: 0.15,
      finDeSemana: 0.25,
      primeraHora: 0.12,
      ultimaHora: 0.10,
      
      // Factores médicos
      especialidadCompleja: 0.20,
      muchosSintomas: 0.25,
      sintomasGraves: 0.35,
      
      // Factores logísticos
      ubicacionLejana: 0.15,
      consultorioComplejo: 0.10,
      
      // Factores históricos
      historialAusencias: 0.30
    };

    // Obtener datos de la cita
    const fechaCita = cita.fecha_cita || cita.fechaCita;
    const horaCita = cita.hora_cita || cita.horaCita;
    const diaCita = cita.dia;
    const sintomasArray = cita.sintomas ? (Array.isArray(cita.sintomas) ? cita.sintomas : cita.sintomas.split(", ")) : [];

    // 1. FACTORES TEMPORALES
    if (diaCita === "Lunes") riesgo += factores.lunes;
    if (diaCita === "Viernes") riesgo += factores.viernes;
    if (diaCita === "Sábado" || diaCita === "Domingo") riesgo += factores.finDeSemana;
    
    if (horaCita?.startsWith("08")) riesgo += factores.primeraHora;
    if (horaCita?.startsWith("17")) riesgo += factores.ultimaHora;

    // 2. FACTORES MÉDICOS
    const especialidadesComplejas = ["Neurología", "Cardiología", "Traumatología", "Ginecología"];
    if (especialidadesComplejas.includes(cita.especialidad)) {
      riesgo += factores.especialidadCompleja;
    }

    // Factor por cantidad de síntomas (progresivo)
    if (sintomasArray.length >= 5) riesgo += factores.muchosSintomas;
    else if (sintomasArray.length >= 3) riesgo += factores.muchosSintomas * 0.7;
    else if (sintomasArray.length >= 2) riesgo += factores.muchosSintomas * 0.4;

    // Factor por gravedad de síntomas
    const sintomasGraves = [
      "Dolor en el pecho", "Falta de aire", "Visión borrosa", 
      "Sangrado irregular", "Fiebre alta", "Dolor abdominal intenso",
      "Palpitaciones", "Entumecimiento", "Limitación movimiento"
    ];
    
    const tieneSintomasGraves = sintomasArray.some(s => sintomasGraves.includes(s));
    if (tieneSintomasGraves) riesgo += factores.sintomasGraves;

    // 3. FACTORES LOGÍSTICOS
    const ubicacionesLejanas = [
      "Hospital Regional - Torre 2", 
      "Centro Médico Sur - Edificio B",
      "Hospital Regional - Torre 1"
    ];
    
    if (ubicacionesLejanas.includes(cita.consultorio)) {
      riesgo += factores.ubicacionLejana;
    }

    const consultoriosComplejos = [
      "Hospital Central - Piso 3",
      "Hospital Regional - Torre 2",
      "Centro Médico Sur - Edificio B"
    ];
    
    if (consultoriosComplejos.includes(cita.consultorio)) {
      riesgo += factores.consultorioComplejo;
    }

    // 4. FACTORES HISTÓRICOS (si hay datos previos)
    if (citas.length > 0) {
      const citasPrevias = citas.filter(c => c.id !== cita.id);
      const ausenciasPrevias = citasPrevias.filter(c => c.ausente).length;
      const tasaAusenciaHistorica = ausenciasPrevias / citasPrevias.length;
      
      if (tasaAusenciaHistorica > 0.3) {
        riesgo += factores.historialAusencias;
      } else if (tasaAusenciaHistorica > 0.1) {
        riesgo += factores.historialAusencias * 0.5;
      }
    }

    // Ajuste final: pacientes con síntomas graves tienen MENOR probabilidad de ausentarse
    if (tieneSintomasGraves) {
      riesgo *= 0.6; // Reducir riesgo si hay síntomas graves
    }

    // Limitar entre 5% y 95%
    return Math.min(Math.max(riesgo, 0.05), 0.95);
  };

  const getSemaforoColor = (p) => {
    if (p < 0.3) return "#48BB78"; // Verde - bajo riesgo
    if (p < 0.6) return "#ECC94B"; // Amarillo - riesgo medio
    return "#F56565"; // Rojo - alto riesgo
  };

  const getRecomendacion = (p, sintomas = []) => {
    const sintomasGraves = [
      "Dolor en el pecho", "Falta de aire", "Visión borrosa", 
      "Sangrado irregular", "Fiebre alta", "Dolor abdominal intenso"
    ];
    
    const tieneSintomasGraves = sintomas.some(s => sintomasGraves.includes(s));

    if (tieneSintomasGraves) {
      return "🚨 ATENCIÓN: Síntomas graves detectados. Se recomienda atención prioritaria.";
    }
    
    if (p < 0.3) return "✅ Bajo riesgo de ausencia. Mantén tu cita programada.";
    if (p < 0.6) return "🟡 Riesgo medio. Establece recordatorios y confirma tu asistencia.";
    return "🔴 Alto riesgo de ausencia. Confirma tu disponibilidad o considera reagendar.";
  };

  // =====================================================================================
  // MANEJO DEL FORMULARIO
  // =====================================================================================

  const limpiarFormulario = () => {
    setFecha("");
    setDia("");
    setEspecialidad("");
    setDoctor("");
    setSintomas([]);
    setHora("");
    setConsultorio("");
    setNotas("");
    setCitaEditando(null);
  };

  const seleccionarSintoma = (s) => {
    if (sintomas.includes(s)) {
      setSintomas(sintomas.filter(x => x !== s));
    } else {
      setSintomas([...sintomas, s]);
    }
  };

  const cargarCitaParaEditar = (cita) => {
    setCitaEditando(cita);
    
    const fechaCita = cita.fecha_cita || cita.fechaCita;
    setFecha(fechaCita ? fechaCita.split('T')[0] : "");
    
    const horaCita = cita.hora_cita || cita.horaCita;
    setHora(horaCita ? horaCita.substring(0, 5) : "");
    
    setEspecialidad(cita.especialidad || "");
    
    const doctorId = cita.doctor_id || cita.doctorId;
    setDoctor(doctorId ? doctorId.toString() : "");
    
    setSintomas(cita.sintomas ? cita.sintomas.split(", ") : []);
    setConsultorio(cita.consultorio || "");
    setNotas(cita.notas || cita.observaciones || "");
    
    document.getElementById('formulario-cita')?.scrollIntoView({ behavior: 'smooth' });
  };

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cita?")) return;

    try {
      const res = await apiService.cancelarCita(id);
      if (res.success) {
        setCitas(citas.filter(c => c.id !== id));
        alert("Cita eliminada correctamente");
      } else {
        alert(res.message || "Error al eliminar la cita");
      }
    } catch (err) {
      console.error("Error al eliminar cita", err);
      alert("Error de conexión al eliminar la cita");
    }
  };

  // =====================================================================================
  // GUARDAR O ACTUALIZAR CITA - COMPLETAMENTE CORREGIDO
  // =====================================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !especialidad || !doctor || !hora || !consultorio || sintomas.length === 0) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // ✅ CORREGIDO: Enviar TODAS las posibles variaciones del campo notas
    const payload = {
      usuarioId: parseInt(userId),
      doctorId: parseInt(doctor),
      fechaCita: fecha,
      horaCita: hora + ":00",
      especialidad: especialidad,
      motivo: `Consulta de ${especialidad} - Síntomas: ${sintomas.join(", ")}`,
      sintomas: sintomas.join(", "),
      consultorio: consultorio,
      notas: notas.trim(), // ✅ SOLO ENVIAR 'notas' - EL BACKEND LO MANEJARÁ
      estado: 'pendiente'
    };
    console.log('📤 Enviando datos al backend:', payload);

    try {
      let result;

      if (citaEditando) {
        // ACTUALIZAR
        console.log('🔄 Actualizando cita existente:', citaEditando.id);
        result = await apiService.updateCita(citaEditando.id, payload);
      } else {
        // CREAR NUEVA CITA
        console.log('➕ Creando nueva cita');
        result = await apiService.createCita(payload);
      }

      if (result.success) {
        console.log('✅ Operación exitosa:', result.data);
        
        // Recargar las citas para obtener los datos actualizados del backend
        const citasResult = await apiService.getCitas(userId);
        if (citasResult.success) {
          setCitas(citasResult.data || []);
          console.log('🔄 Citas actualizadas después de guardar:', citasResult.data);
        }
        
        limpiarFormulario();
        alert(citaEditando ? "Cita actualizada correctamente" : "Cita creada correctamente");
      } else {
        console.error('❌ Error del backend:', result);
        alert(result.message || "Error al procesar la cita");
      }
    } catch (error) {
      console.error("💥 Error al enviar datos", error);
      alert("Error de conexión al guardar la cita");
    }
  };

  // =====================================================================================
  // CALCULAR ESTADÍSTICAS MEJORADAS
  // =====================================================================================

  const calcularEstadisticas = () => {
    const totalCitas = citas.length;
    const citasMedicinaGeneral = citas.filter(c => c.especialidad === "Medicina General").length;
    
    const citasRiesgoAlto = citas.filter(c => {
      const riesgo = predecirRiesgoAusencia(c);
      return riesgo >= 0.6;
    }).length;

    const citasConNotas = citas.filter(c => {
      const tieneNotas = c.notas || c.observaciones || c.nota_adicional || c.comentarios;
      return tieneNotas && tieneNotas.trim() !== '';
    }).length;

    return { 
      totalCitas, 
      citasMedicinaGeneral, 
      citasRiesgoAlto,
      citasConNotas 
    };
  };

  const estadisticas = calcularEstadisticas();

  // Función auxiliar para obtener las notas de una cita
  const obtenerNotasCita = (cita) => {
    return cita.notas || cita.observaciones || cita.nota_adicional || cita.comentarios || '';
  };

  // =====================================================================================
  // RENDERIZADO MEJORADO
  // =====================================================================================

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">
            Bienvenido, {user?.nombres || userEmail}
          </h2>
          <p className="text-gray-600">Sistema Inteligente de Gestión de Citas Médicas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {mostrarEstadisticas ? 'Ocultar Stats' : 'Ver Stats ML'}
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Estadísticas Mejoradas */}
      {mostrarEstadisticas && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">📊 Estadísticas con Machine Learning</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalCitas}</div>
              <div className="text-sm text-gray-600">Total Citas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{estadisticas.citasMedicinaGeneral}</div>
              <div className="text-sm text-gray-600">Medicina General</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.citasRiesgoAlto}</div>
              <div className="text-sm text-gray-600">Riesgo Alto</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.citasConNotas}</div>
              <div className="text-sm text-gray-600">Con Notas</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">🧠 Algoritmo ML Activo</h4>
            <p className="text-sm text-gray-600">
              Analizando: síntomas graves, factores temporales, ubicación y historial para predecir riesgo de ausencia.
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO DE CITA */}
      <form id="formulario-cita" onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {citaEditando ? "✏️ Editar Cita Médica" : "➕ Agendar Nueva Cita Médica"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* FECHA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                if (e.target.value) {
                  const dayName = new Date(e.target.value).toLocaleDateString("es-ES", { weekday: "long" });
                  setDia(dayName.charAt(0).toUpperCase() + dayName.slice(1));
                }
              }}
              required
            />
          </div>

          {/* HORA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <select 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={hora} 
              onChange={(e) => setHora(e.target.value)}
              required
            >
              <option value="">Seleccione una hora</option>
              {horasDisponibles.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* ESPECIALIDAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
            <select 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={especialidad} 
              onChange={(e) => {
                setEspecialidad(e.target.value);
                setDoctor("");
                setSintomas([]);
              }}
              required
            >
              <option value="">Seleccione especialidad</option>
              {especialidades.map((esp, i) => (
                <option key={i} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          {/* DOCTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
            <select 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={doctor} 
              onChange={(e) => setDoctor(e.target.value)}
              disabled={!especialidad}
              required
            >
              <option value="">Seleccione doctor</option>
              {doctores
                .filter(d => d.especialidad === especialidad)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.nombres} {d.apellidoPaterno || d.apellido_paterno} - {d.especialidad}
                  </option>
                ))}
            </select>
            {doctores.filter(d => d.especialidad === especialidad).length === 0 && especialidad && (
              <p className="text-sm text-red-500 mt-1">No hay doctores disponibles para esta especialidad</p>
            )}
          </div>

          {/* CONSULTORIO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultorio *</label>
            <select 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={consultorio} 
              onChange={(e) => setConsultorio(e.target.value)}
              required
            >
              <option value="">Seleccione consultorio</option>
              {consultorios.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* NOTAS - MEJORADO */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales 📝
              <span className="text-green-600 ml-2">(Se guardarán en la base de datos)</span>
            </label>
            <textarea
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones importantes, medicamentos actuales, alergias, historial médico relevante, etc."
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Esta información ayudará al médico a brindarte una mejor atención.
            </p>
          </div>

          {/* SÍNTOMAS */}
          {especialidad && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Síntomas * 
                <span className="text-blue-600 ml-2">(El ML analizará el riesgo basado en estos síntomas)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(sintomasPorEspecialidad[especialidad] || []).map((s, i) => (
                  <label key={i} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded border border-gray-200">
                    <input
                      type="checkbox"
                      value={s}
                      checked={sintomas.includes(s)}
                      onChange={() => seleccionarSintoma(s)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
              {sintomas.length === 0 && especialidad && (
                <p className="text-sm text-red-500 mt-1">Selecciona al menos un síntoma</p>
              )}
              {sintomas.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ {sintomas.length} síntoma(s) seleccionado(s). El sistema calculará el riesgo automáticamente.
                </p>
              )}
            </div>
          )}

          {/* BOTONES */}
          <div className="md:col-span-2 flex gap-2 mt-4">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition flex-1 font-semibold"
            >
              {citaEditando ? "🔄 Actualizar Cita" : "💾 Agendar Cita"}
            </button>

            {citaEditando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* LISTADO DE CITAS DEL USUARIO */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">📋 Tus Citas Médicas</h3>
          <span className="text-sm text-gray-600">
            {citas.length} citas registradas
          </span>
        </div>

        {citas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No tienes citas médicas registradas.</p>
            <p className="text-gray-500">Agenda tu primera cita usando el formulario superior.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {citas.map((cita) => {
              const fechaCita = cita.fecha_cita || cita.fechaCita;
              const horaCita = cita.hora_cita || cita.horaCita;
              const doctorId = cita.doctor_id || cita.doctorId;
              
              const sintomasLista = cita.sintomas ? (Array.isArray(cita.sintomas) ? cita.sintomas : cita.sintomas.split(", ")) : [];
              const riesgo = predecirRiesgoAusencia(cita);
              const colorRiesgo = getSemaforoColor(riesgo);
              const recomendacion = getRecomendacion(riesgo, sintomasLista);

              const doctorCita = doctores.find(d => d.id === doctorId);
              const nombreDoctor = doctorCita ? 
                `Dr. ${doctorCita.nombres} ${doctorCita.apellidoPaterno || doctorCita.apellido_paterno}` : 
                'Doctor no especificado';

              // ✅ CORREGIDO: Usar la función auxiliar para obtener notas
              const notasCita = obtenerNotasCita(cita);

              return (
                <div
                  key={cita.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {cita.especialidad || 'Especialidad no especificada'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Con {nombreDoctor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorRiesgo }}
                        title={`Riesgo de ausencia: ${Math.round(riesgo * 100)}%`}
                      />
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                        {Math.round(riesgo * 100)}% riesgo
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="font-semibold">Fecha:</span> {fechaCita ? new Date(fechaCita).toLocaleDateString() : 'No especificada'}
                    </div>
                    <div>
                      <span className="font-semibold">Hora:</span> {horaCita ? horaCita.substring(0, 5) : 'No especificada'}
                    </div>
                    <div>
                      <span className="font-semibold">Motivo:</span> {cita.motivo || 'Consulta de ' + cita.especialidad}
                    </div>
                    <div>
                      <span className="font-semibold">Consultorio:</span> {cita.consultorio || 'No especificado'}
                    </div>
                  </div>

                  {sintomasLista.length > 0 && (
                    <div className="mb-3">
                      <span className="font-semibold text-sm">Síntomas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sintomasLista.map((sintoma, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {sintoma}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ✅ CORREGIDO: Mostrar notas usando la función auxiliar */}
                  {notasCita && notasCita.trim() !== '' && (
                    <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                      <span className="font-semibold text-sm text-green-700">📝 Notas del paciente:</span>
                      <p className="text-sm text-gray-700 mt-1">{notasCita}</p>
                    </div>
                  )}

                  <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">{recomendacion}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <button
                      onClick={() => cargarCitaParaEditar(cita)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarCita(cita.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}