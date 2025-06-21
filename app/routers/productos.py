from fastapi import APIRouter
from typing import List
from app.schemas.producto import Producto
from app.db.database import productos_db

router = APIRouter()

@router.get("/productos", response_model=List[Producto], tags=["Productos"])
def get_productos():
    """
    Devuelve la lista completa de productos disponibles.
    """
    return productos_db
