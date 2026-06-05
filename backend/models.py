from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Asignatura(Base):
    """
    Representa una asignatura académica (materia/curso).
    """
    __tablename__ = "asignaturas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    descripcion = Column(String, nullable=True)

    # Relación uno-a-muchos con Notas
    # cascade="all, delete-orphan" asegura que si eliminamos la asignatura,
    # se borren automáticamente todas las notas registradas en esta materia.
    notas = relationship("Nota", back_populates="asignatura", cascade="all, delete-orphan")


class Estudiante(Base):
    """
    Representa un estudiante con sus datos de contacto y académicos.
    """
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    edad = Column(Integer, nullable=False)

    # Relación uno-a-muchos con Notas
    # Si se elimina un estudiante, se eliminan todas sus calificaciones asociadas
    notas = relationship("Nota", back_populates="estudiante", cascade="all, delete-orphan")


class Nota(Base):
    """
    Representa la calificación obtenida por un estudiante en una asignatura específica.
    """
    __tablename__ = "notas"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id", ondelete="CASCADE"), nullable=False)
    asignatura_id = Column(Integer, ForeignKey("asignaturas.id", ondelete="CASCADE"), nullable=False)
    valor = Column(Float, nullable=False)

    # Relaciones de navegación inversa para acceder a las entidades completas
    estudiante = relationship("Estudiante", back_populates="notas")
    asignatura = relationship("Asignatura", back_populates="notas")

    # Restricción Única: Un estudiante no puede tener más de una nota para la misma asignatura
    __table_args__ = (
        UniqueConstraint('estudiante_id', 'asignatura_id', name='_estudiante_asignatura_uc'),
    )
