from pydantic import BaseModel
from typing import List, Optional
from .producto import ProductoEnCarrito

# Modelo para la creación de un carrito (solo necesita el user_id)
class CarritoCreate(BaseModel):
    user_id: str

# Modelo base de un item en el carrito (para la entrada de datos en PATCH/PUT)
class ItemCarritoBase(BaseModel):
    producto_id: int
    cantidad: int

# Modelo completo del carrito (para devolver como respuesta)
class Carrito(BaseModel):
    id: str
    user_id: str
    items: List[ProductoEnCarrito] = []