from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import database

# Creación de tablas de forma automática al iniciar la app.
# Nota: Si el esquema cambia, se recomienda usar Alembic para migraciones.
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Advertencia: No se pudo conectar a la base de datos PostgreSQL durante el arranque.")
    print(f"Error detallado: {e}")
    print("Asegúrate de configurar correctamente las variables de entorno en el archivo .env")

app = FastAPI(
    title="API de Gestión Escolar",
    description="Backend en FastAPI para gestionar Estudiantes, Asignaturas y Calificaciones con PostgreSQL."
)

# Habilitar CORS para permitir solicitudes del Frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Ruta raíz para verificar la salud del backend.
    """
    return {
        "status": "API de Gestión Escolar activa y lista",
        "tecnologias": ["FastAPI", "SQLAlchemy", "PostgreSQL", "Pydantic"]
    }

# =====================================================================
# SECCIÓN: ASIGNATURAS (SUBJECTS)
# =====================================================================

@app.get("/api/asignaturas", response_model=List[schemas.AsignaturaResponse])
def get_asignaturas(db: Session = Depends(database.get_db)):
    """
    Obtener el listado completo de asignaturas registradas.
    """
    return db.query(models.Asignatura).all()

@app.post("/api/asignaturas", response_model=schemas.AsignaturaResponse, status_code=201)
def create_asignatura(asignatura: schemas.AsignaturaCreate, db: Session = Depends(database.get_db)):
    """
    Crear una nueva asignatura verificando que no exista una con el mismo nombre.
    """
    db_asignatura = db.query(models.Asignatura).filter(models.Asignatura.nombre == asignatura.nombre).first()
    if db_asignatura:
        raise HTTPException(status_code=400, detail="Ya existe una asignatura con este nombre")
    
    nueva_asignatura = models.Asignatura(
        nombre=asignatura.nombre,
        descripcion=asignatura.descripcion
    )
    db.add(nueva_asignatura)
    db.commit()
    db.refresh(nueva_asignatura)
    return nueva_asignatura

@app.put("/api/asignaturas/{id}", response_model=schemas.AsignaturaResponse)
def update_asignatura(id: int, updated: schemas.AsignaturaUpdate, db: Session = Depends(database.get_db)):
    """
    Actualizar los datos de una asignatura por su ID.
    """
    db_asignatura = db.query(models.Asignatura).filter(models.Asignatura.id == id).first()
    if not db_asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
    
    # Validar si el nuevo nombre colisiona con el de otra asignatura
    if updated.nombre != db_asignatura.nombre:
        exists = db.query(models.Asignatura).filter(models.Asignatura.nombre == updated.nombre).first()
        if exists:
            raise HTTPException(status_code=400, detail="Ya existe otra asignatura con este nombre")
            
    db_asignatura.nombre = updated.nombre
    db_asignatura.descripcion = updated.descripcion
    db.commit()
    db.refresh(db_asignatura)
    return db_asignatura

@app.delete("/api/asignaturas/{id}")
def delete_asignatura(id: int, confirm: bool = Query(False), db: Session = Depends(database.get_db)):
    """
    Eliminar una asignatura. Si está vinculada a calificaciones de estudiantes,
    el endpoint exige confirmación explícita (?confirm=true) antes del borrado.
    """
    db_asignatura = db.query(models.Asignatura).filter(models.Asignatura.id == id).first()
    if not db_asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
    
    # Contar calificaciones vinculadas a la materia
    notas_vinculadas = db.query(models.Nota).filter(models.Nota.asignatura_id == id).count()
    if notas_vinculadas > 0 and not confirm:
        return {
            "requiere_confirmacion": True,
            "notas_vinculadas": notas_vinculadas,
            "message": f"Atención: Existen {notas_vinculadas} calificaciones asociadas a esta asignatura. ¿Realmente deseas eliminarla? Se perderán todos esos registros."
        }
        
    db.delete(db_asignatura)
    db.commit()
    return {"status": "success", "message": "Asignatura y calificaciones asociadas eliminadas con éxito"}


# =====================================================================
# SECCIÓN: ESTUDIANTES (STUDENTS)
# =====================================================================

@app.get("/api/estudiantes", response_model=List[schemas.EstudianteResponse])
def get_estudiantes(db: Session = Depends(database.get_db)):
    """
    Obtener listado de estudiantes incluyendo sus calificaciones vinculadas.
    """
    return db.query(models.Estudiante).all()

@app.post("/api/estudiantes", response_model=schemas.EstudianteResponse, status_code=201)
def create_estudiante(estudiante: schemas.EstudianteCreate, db: Session = Depends(database.get_db)):
    """
    Registrar un nuevo estudiante asegurando un correo electrónico único.
    """
    db_estudiante = db.query(models.Estudiante).filter(models.Estudiante.email == estudiante.email).first()
    if db_estudiante:
        raise HTTPException(status_code=400, detail="Ya existe un estudiante registrado con este correo")
    
    nuevo_estudiante = models.Estudiante(
        nombre=estudiante.nombre,
        email=estudiante.email,
        edad=estudiante.edad
    )
    db.add(nuevo_estudiante)
    db.commit()
    db.refresh(nuevo_estudiante)
    return nuevo_estudiante

@app.put("/api/estudiantes/{id}", response_model=schemas.EstudianteResponse)
def update_estudiante(id: int, updated: schemas.EstudianteUpdate, db: Session = Depends(database.get_db)):
    """
    Actualizar datos básicos de un estudiante.
    """
    db_estudiante = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not db_estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    # Validar si cambia de correo y si el nuevo ya está en uso
    if updated.email != db_estudiante.email:
        exists = db.query(models.Estudiante).filter(models.Estudiante.email == updated.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Ya existe otro estudiante con este correo")
            
    db_estudiante.nombre = updated.nombre
    db_estudiante.email = updated.email
    db_estudiante.edad = updated.edad
    db.commit()
    db.refresh(db_estudiante)
    return db_estudiante

@app.delete("/api/estudiantes/{id}")
def delete_estudiante(id: int, db: Session = Depends(database.get_db)):
    """
    Eliminar un estudiante y sus notas asociadas (en cascada).
    """
    db_estudiante = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not db_estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    db.delete(db_estudiante)
    db.commit()
    return {"status": "success", "message": "Estudiante y registros eliminados con éxito"}


# =====================================================================
# SECCIÓN: NOTAS / CALIFICACIONES (GRADES)
# =====================================================================

@app.post("/api/estudiantes/{estudiante_id}/notas", response_model=schemas.NotaResponse)
def add_or_update_nota(estudiante_id: int, nota: schemas.NotaCreate, db: Session = Depends(database.get_db)):
    """
    Registrar una calificación de un estudiante en una asignatura.
    Si ya existía una nota para esa asignatura, se sobrescribe con el nuevo valor.
    """
    # 1. Comprobar que el estudiante existe
    estudiante = db.query(models.Estudiante).filter(models.Estudiante.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    # 2. Comprobar que la asignatura existe
    asignatura = db.query(models.Asignatura).filter(models.Asignatura.id == nota.asignatura_id).first()
    if not asignatura:
        raise HTTPException(status_code=404, detail="La asignatura especificada no existe")
        
    # 3. Comprobar si ya existe una nota para este par estudiante-asignatura
    db_nota = db.query(models.Nota).filter(
        models.Nota.estudiante_id == estudiante_id,
        models.Nota.asignatura_id == nota.asignatura_id
    ).first()
    
    if db_nota:
        # Actualización de nota existente
        db_nota.valor = nota.valor
    else:
        # Creación de nueva calificación
        db_nota = models.Nota(
            estudiante_id=estudiante_id,
            asignatura_id=nota.asignatura_id,
            valor=nota.valor
        )
        db.add(db_nota)
        
    db.commit()
    db.refresh(db_nota)
    return db_nota

@app.delete("/api/estudiantes/{estudiante_id}/notas/{nota_id}")
def delete_nota(estudiante_id: int, nota_id: int, db: Session = Depends(database.get_db)):
    """
    Eliminar una calificación específica de un estudiante.
    """
    db_nota = db.query(models.Nota).filter(
        models.Nota.id == nota_id,
        models.Nota.estudiante_id == estudiante_id
    ).first()
    if not db_nota:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
        
    db.delete(db_nota)
    db.commit()
    return {"status": "success", "message": "Calificación eliminada correctamente"}