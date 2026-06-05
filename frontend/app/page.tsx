"use client";

import { useEffect, useState } from "react";

// =====================================================================
// DEFINICIONES DE TIPOS (TYPESCRIPT)
// =====================================================================

interface Asignatura {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface Nota {
  id: number;
  asignatura_id: number;
  valor: number;
  asignatura: Asignatura;
}

interface Estudiante {
  id: number;
  nombre: string;
  email: string;
  edad: number;
  notas: Nota[];
}

export default function Home() {
  // Pestaña activa del sistema: "estudiantes" o "asignaturas"
  const [activeTab, setActiveTab] = useState<"estudiantes" | "asignaturas">("estudiantes");

  // Estados que almacenan la información del Servidor (FastAPI + PostgreSQL)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados locales para el Formulario de Estudiantes (Modo Crear o Editar)
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentNombre, setStudentNombre] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentEdad, setStudentEdad] = useState("");

  // Estados locales para el Formulario de Asignaturas (Modo Crear o Editar)
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [subjectNombre, setSubjectNombre] = useState("");
  const [subjectDescripcion, setSubjectDescripcion] = useState("");

  // Estados para la carga de calificaciones en la tarjeta académica lateral
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState("");
  const [notaValor, setNotaValor] = useState("");

  // =====================================================================
  // CONSUMO DE API: Cargar toda la información desde el Backend
  // =====================================================================
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Solicitud en paralelo para obtener alumnos y materias simultáneamente
      const [resEstudiantes, resAsignaturas] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/estudiantes"),
        fetch("http://127.0.0.1:8000/api/asignaturas"),
      ]);

      if (!resEstudiantes.ok || !resAsignaturas.ok) {
        throw new Error("No se pudo obtener información del servidor principal.");
      }

      const dataEstudiantes = await resEstudiantes.json();
      const dataAsignaturas = await resAsignaturas.json();

      setEstudiantes(dataEstudiantes);
      setAsignaturas(dataAsignaturas);

      // Si tenemos un estudiante seleccionado en el panel, actualizar sus datos también
      if (selectedStudent) {
        const estActualizado = dataEstudiantes.find((s: Estudiante) => s.id === selectedStudent.id);
        setSelectedStudent(estActualizado || null);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API de FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // =====================================================================
  // OPERACIONES CRUD: ESTUDIANTES
  // =====================================================================

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNombre.trim() || !studentEmail.trim() || !studentEdad) {
      alert("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombre: studentNombre,
      email: studentEmail,
      edad: parseInt(studentEdad),
    };

    try {
      let res;
      if (studentId) {
        // ACTUALIZAR (PUT)
        res = await fetch(`http://127.0.0.1:8000/api/estudiantes/${studentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREAR (POST)
        res = await fetch("http://127.0.0.1:8000/api/estudiantes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el guardado de datos.");
      }

      // Limpiar estados e inputs del formulario
      setStudentId(null);
      setStudentNombre("");
      setStudentEmail("");
      setStudentEdad("");
      loadData(); // Refrescar lista principal
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEditStudent = (est: Estudiante) => {
    setStudentId(est.id);
    setStudentNombre(est.nombre);
    setStudentEmail(est.email);
    setStudentEdad(est.edad.toString());
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("¿Realmente deseas dar de baja a este estudiante? Se perderán todas sus calificaciones registradas.")) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/estudiantes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo procesar la baja del estudiante.");
      
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =====================================================================
  // OPERACIONES CRUD: ASIGNATURAS
  // =====================================================================

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectNombre.trim()) {
      alert("El nombre de la asignatura es requerido.");
      return;
    }

    const payload = {
      nombre: subjectNombre,
      descripcion: subjectDescripcion || null,
    };

    try {
      let res;
      if (subjectId) {
        // ACTUALIZAR (PUT)
        res = await fetch(`http://127.0.0.1:8000/api/asignaturas/${subjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREAR (POST)
        res = await fetch("http://127.0.0.1:8000/api/asignaturas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el guardado de la asignatura.");
      }

      setSubjectId(null);
      setSubjectNombre("");
      setSubjectDescripcion("");
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEditSubject = (asig: Asignatura) => {
    setSubjectId(asig.id);
    setSubjectNombre(asig.nombre);
    setSubjectDescripcion(asig.descripcion || "");
  };

  const handleDeleteSubject = async (id: number, confirmExplicita: boolean = false) => {
    try {
      // Si confirmExplicita es true, enviamos la query de confirmación para saltear la validación de seguridad del backend
      const url = `http://127.0.0.1:8000/api/asignaturas/${id}${confirmExplicita ? "?confirm=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) throw new Error("No se pudo eliminar la asignatura.");

      const data = await res.json();
      
      // Si la API indica que requiere confirmación (porque existen alumnos con notas en esa materia)
      if (data.requiere_confirmacion) {
        if (confirm(`${data.message}\n\n¿Estás seguro de que deseas forzar la eliminación? Esta acción no se puede deshacer.`)) {
          // Volver a llamar a la función indicando confirmación explícita
          handleDeleteSubject(id, true);
        }
      } else {
        loadData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // =====================================================================
  // OPERACIONES: GESTIÓN DE NOTAS ACADÉMICAS
  // =====================================================================

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!selectedAsignaturaId || !notaValor) {
      alert("Selecciona una asignatura y escribe una calificación.");
      return;
    }

    const valor = parseFloat(notaValor);
    if (isNaN(valor) || valor < 0 || valor > 10) {
      alert("La nota debe ser un número decimal entre 0.0 y 10.0");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/estudiantes/${selectedStudent.id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asignatura_id: parseInt(selectedAsignaturaId),
          valor: valor,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al guardar la calificación.");
      }

      setNotaValor("");
      setSelectedAsignaturaId("");
      loadData(); // Refresca las listas principales y actualiza el panel del estudiante
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteGrade = async (notaId: number) => {
    if (!selectedStudent) return;
    if (!confirm("¿Eliminar esta calificación?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/estudiantes/${selectedStudent.id}/notas/${notaId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("No se pudo eliminar la nota.");

      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Lógica auxiliar para calcular el promedio de calificaciones
  const calcularPromedio = (notas: Nota[]) => {
    if (notas.length === 0) return "S/N"; // Sin notas registradas
    const suma = notas.reduce((acc, curr) => acc + curr.valor, 0);
    return (suma / notas.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 text-emerald-950 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera Principal del Dashboard */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Control Académico Escolar
            </h1>
            <p className="text-sm text-emerald-800/80">
              Panel administrativo para gestión de alumnos, asignaturas y registros de notas en PostgreSQL.
            </p>
          </div>
          
          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("estudiantes")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "estudiantes"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-500"
                  : "bg-white text-emerald-700 hover:text-emerald-900 border border-emerald-200/60"
              }`}
            >
              🎓 Alumnos
            </button>
            <button
              onClick={() => setActiveTab("asignaturas")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "asignaturas"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-500"
                  : "bg-white text-emerald-700 hover:text-emerald-900 border border-emerald-200/60"
              }`}
            >
              📚 Asignaturas
            </button>
            <button
              onClick={loadData}
              title="Refrescar base de datos"
              className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-600 hover:text-emerald-800 transition-all active:scale-95 shadow-sm"
            >
              🔄
            </button>
          </div>
        </header>

        {/* Panel de error de conexión a la Base de Datos */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <p className="font-bold">⚠️ Error al conectar con PostgreSQL</p>
            <p className="text-xs text-rose-700">{error}</p>
            <p className="text-xs text-rose-600">
              Asegúrate de que PostgreSQL esté corriendo en el puerto 5432, que la base de datos coincida con tu archivo <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-700">backend/.env</code> y que el servidor de FastAPI esté activo.
            </p>
          </div>
        )}

        {/* Pantalla de Carga de API */}
        {loading && estudiantes.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-emerald-800 text-sm">Cargando esquema relacional desde PostgreSQL...</p>
          </div>
        )}

        {/* COMPONENTE PRINCIPAL (GRILLA) */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA FORMULARIOS (1/3 Ancho) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Formulario para Estudiantes */}
              {activeTab === "estudiantes" && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    {studentId ? "📝 Editar Estudiante" : "👤 Inscribir Estudiante"}
                  </h2>
                  <form onSubmit={handleSaveStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={studentNombre}
                        onChange={(e) => setStudentNombre(e.target.value)}
                        placeholder="Ej. Sofía Rodríguez"
                        className="w-full bg-emerald-50/20 border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Email del Estudiante
                      </label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="sofia@colegio.com"
                        className="w-full bg-emerald-50/20 border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Edad (Entre 5 y 100 años)
                      </label>
                      <input
                        type="number"
                        required
                        min="5"
                        max="100"
                        value={studentEdad}
                        onChange={(e) => setStudentEdad(e.target.value)}
                        placeholder="Ej. 18"
                        className="w-full bg-emerald-50/20 border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        {studentId ? "Guardar" : "Inscribir Alumno"}
                      </button>
                      {studentId && (
                        <button
                          type="button"
                          onClick={() => {
                            setStudentId(null);
                            setStudentNombre("");
                            setStudentEmail("");
                            setStudentEdad("");
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Formulario para Asignaturas */}
              {activeTab === "asignaturas" && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    {subjectId ? "📝 Editar Materia" : "📚 Crear Asignatura"}
                  </h2>
                  <form onSubmit={handleSaveSubject} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Nombre de la Asignatura
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectNombre}
                        onChange={(e) => setSubjectNombre(e.target.value)}
                        placeholder="Ej. Matemáticas I"
                        className="w-full bg-emerald-50/20 border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Descripción General
                      </label>
                      <textarea
                        rows={3}
                        value={subjectDescripcion}
                        onChange={(e) => setSubjectDescripcion(e.target.value)}
                        placeholder="Temario, objetivos..."
                        className="w-full bg-emerald-50/20 border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-4 py-2.5 text-sm transition-all outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        {subjectId ? "Actualizar" : "Registrar Materia"}
                      </button>
                      {subjectId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSubjectId(null);
                            setSubjectNombre("");
                            setSubjectDescripcion("");
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Panel Lateral de Calificaciones del Alumno Seleccionado */}
              {activeTab === "estudiantes" && selectedStudent && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Ficha Académica de:</span>
                      <h3 className="text-md font-bold text-emerald-900">{selectedStudent.nombre}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs text-emerald-500 hover:text-emerald-700 font-bold"
                    >
                      Cerrar [x]
                    </button>
                  </div>

                  <div className="w-full border-t border-emerald-100 my-2"></div>

                  {/* Formulario para agregar/sobrescribir notas */}
                  <form onSubmit={handleAddGrade} className="space-y-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800">Registrar / Editar Nota</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          required
                          value={selectedAsignaturaId}
                          onChange={(e) => setSelectedAsignaturaId(e.target.value)}
                          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-2 py-2 text-xs transition-all outline-none"
                        >
                          <option value="">-- Materia --</option>
                          {asignaturas.map((asig) => (
                            <option key={asig.id} value={asig.id}>
                              {asig.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          required
                          min="0"
                          max="10"
                          value={notaValor}
                          onChange={(e) => setNotaValor(e.target.value)}
                          placeholder="Nota (0-10)"
                          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-900 rounded-xl px-2 py-2 text-xs transition-all outline-none"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Asignar Calificación
                    </button>
                  </form>

                  {/* Listado de asignaturas y calificaciones actuales del alumno */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800">Materias en curso:</p>
                    {selectedStudent.notas.length === 0 ? (
                      <p className="text-xs text-emerald-600/60 italic">El estudiante no registra notas actualmente.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {selectedStudent.notas.map((n) => (
                          <div 
                            key={n.id} 
                            className="flex justify-between items-center bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all text-xs"
                          >
                            <div>
                              <p className="font-semibold text-emerald-900">{n.asignatura.nombre}</p>
                              <p className="text-[10px] text-emerald-600/70">Calificación ID: {n.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                n.valor >= 6.0 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50" 
                                  : "bg-rose-100 text-rose-800 border border-rose-200/50"
                              }`}>
                                {n.valor.toFixed(1)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteGrade(n.id)}
                                className="text-emerald-600/70 hover:text-rose-600 transition-colors"
                                title="Eliminar nota"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMNA TABLAS Y LISTADOS (2/3 Ancho) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tabla de Estudiantes */}
              {activeTab === "estudiantes" && (
                <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                      👥 Estudiantes Registrados ({estudiantes.length})
                    </h2>
                  </div>
                  
                  {estudiantes.length === 0 ? (
                    <div className="p-12 text-center text-emerald-700/60 text-sm">
                      No hay estudiantes registrados. Registra el primero desde el formulario.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Estudiante</th>
                            <th className="p-4">Contacto</th>
                            <th className="p-4 text-center">Edad</th>
                            <th className="p-4 text-center">Materias</th>
                            <th className="p-4 text-center">Promedio</th>
                            <th className="p-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 text-sm text-emerald-950">
                          {estudiantes.map((est) => (
                            <tr 
                              key={est.id} 
                              className={`hover:bg-emerald-50/30 transition-all ${
                                selectedStudent?.id === est.id ? "bg-emerald-50/50" : ""
                              }`}
                            >
                              <td className="p-4">
                                <p className="font-bold text-emerald-900">{est.nombre}</p>
                                <p className="text-[10px] text-emerald-600/70 font-mono">ID: {est.id}</p>
                              </td>
                              <td className="p-4 text-emerald-800/80 text-xs">{est.email}</td>
                              <td className="p-4 text-center font-medium text-emerald-800">{est.edad} años</td>
                              <td className="p-4 text-center">
                                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 border border-emerald-200/40 font-semibold">
                                  {est.notas.length}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                                  est.notas.length === 0 
                                    ? "bg-slate-100 text-slate-600 border border-slate-200" 
                                    : parseFloat(calcularPromedio(est.notas)) >= 6.0 
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                      : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}>
                                  {calcularPromedio(est.notas)}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => setSelectedStudent(est)}
                                  className="text-xs bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-all font-semibold"
                                >
                                  📝 Notas
                                </button>
                                <button
                                  onClick={() => handleEditStudent(est)}
                                  className="text-xs bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 px-2 py-1.5 rounded-lg border border-emerald-200/50 transition-all"
                                  title="Editar Alumno"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(est.id)}
                                  className="text-xs bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 px-2 py-1.5 rounded-lg transition-all"
                                  title="Dar de baja"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla de Asignaturas */}
              {activeTab === "asignaturas" && (
                <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-emerald-100">
                    <h2 className="text-lg font-bold text-emerald-900">
                      📚 Asignaturas Disponibles ({asignaturas.length})
                    </h2>
                  </div>

                  {asignaturas.length === 0 ? (
                    <div className="p-12 text-center text-emerald-700/60 text-sm">
                      No hay asignaturas creadas en la escuela.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">ID de Materia</th>
                            <th className="p-4">Nombre de Materia</th>
                            <th className="p-4">Descripción del Programa</th>
                            <th className="p-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 text-sm text-emerald-950">
                          {asignaturas.map((asig) => (
                            <tr key={asig.id} className="hover:bg-emerald-50/30 transition-all">
                              <td className="p-4 font-mono text-xs text-teal-650"># {asig.id}</td>
                              <td className="p-4 font-bold text-emerald-900">{asig.nombre}</td>
                              <td className="p-4 text-emerald-800/80 text-xs max-w-xs truncate">
                                {asig.descripcion || <span className="italic text-emerald-600/40">Sin descripción registrada</span>}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleEditSubject(asig)}
                                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200/40 transition-all font-semibold"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(asig.id)}
                                  className="text-xs bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Sección Explicativa de Conceptos Fullstack */}
        <footer className="border-t border-emerald-250 pt-8 mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-emerald-800/60">
          <div className="space-y-1.5">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider">🔗 Integridad Relacional SQL</h4>
            <p>El uso de <code className="text-emerald-750 font-mono">ForeignKey</code> con restricciones de eliminación asegura la salud lógica. Las tablas se comunican de forma consistente en PostgreSQL.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider">🗛 Confirmación de Borrado</h4>
            <p>Si borras una materia que tiene calificaciones asignadas, la API retorna una advertencia. El frontend intercepta esta respuesta y solicita la aprobación del usuario.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider">🛡️ Validaciones Rigurosas</h4>
            <p>Los datos ingresados se auditan en dos capas: validación rápida de HTML5/React en el cliente y validación estricta de esquema y tipos con Pydantic en FastAPI.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider">⚡ React State & Sync</h4>
            <p>Al agregar calificaciones se actualiza reactivamente el promedio del estudiante, demostrando cómo sincronizar estados cruzados en interfaces dinámicas.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}