from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# ==========================================
# ESQUEMAS PARA ASIGNATURA (SUBJECT)
# ==========================================

class AsignaturaBase(BaseModel):
    nombre: str = Field(
        ..., 
        min_length=2, 
        max_length=50, 
        description="Nombre descriptivo de la asignatura",
        examples=["Matemáticas"]
    )
    descripcion: Optional[str] = Field(
        None, 
        max_length=200, 
        description="Breve descripción del programa de estudio",
        examples=["Álgebra y cálculo elemental"]
    )

class AsignaturaCreate(AsignaturaBase):
    pass

class AsignaturaUpdate(AsignaturaBase):
    pass

class AsignaturaResponse(AsignaturaBase):
    id: int

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS PARA NOTA (GRADE)
# ==========================================

class NotaBase(BaseModel):
    asignatura_id: int = Field(..., description="ID de la asignatura correspondiente")
    valor: float = Field(
        ..., 
        ge=0.0, 
        le=10.0, 
        description="Calificación del estudiante (Debe ser un valor flotante entre 0.0 y 10.0)",
        examples=[8.5]
    )

class NotaCreate(NotaBase):
    pass

class NotaResponse(NotaBase):
    id: int
    asignatura: AsignaturaResponse  # Permite ver los detalles de la asignatura en la respuesta

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS PARA ESTUDIANTE (STUDENT)
# ==========================================

class EstudianteBase(BaseModel):
    nombre: str = Field(
        ..., 
        min_length=2, 
        max_length=100, 
        description="Nombre y apellidos del estudiante",
        examples=["Juan Pérez"]
    )
    email: EmailStr = Field(
        ..., 
        description="Correo electrónico único del estudiante para notificaciones",
        examples=["juan.perez@universidad.com"]
    )
    edad: int = Field(
        ..., 
        ge=5, 
        le=100, 
        description="Edad en años cumplidos",
        examples=[20]
    )

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteUpdate(EstudianteBase):
    pass

class EstudianteResponse(EstudianteBase):
    id: int
    notas: List[NotaResponse] = []  # Listado completo de asignaturas cursadas y calificaciones

    class Config:
        from_attributes = True
