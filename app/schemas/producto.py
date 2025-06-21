from pydantic import BaseModel
from typing import Optional

class Producto(BaseModel):
    id: int
    nombre: str
    precio: float
    stock: int

class ProductoEnCarrito(BaseModel):
    producto_id: int
    cantidad: int