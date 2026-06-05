import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo backend/.env
load_dotenv()

# Obtención de credenciales con valores por defecto si no existen
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "estudiantes_db")

# Cadena de conexión JDBC/SQLAlchemy para PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Motor de base de datos (Engine)
engine = create_engine(DATABASE_URL)

# Fábrica de sesiones (SessionLocal) para interactuar con la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base ORM declarativa de la que heredarán nuestros modelos
Base = declarative_base()

# Dependencia para abrir y cerrar la sesión en cada petición API de forma segura
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
