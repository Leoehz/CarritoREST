# app/routers/carritos.py
from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid

# Importaciones locales
from app.db.database import carritos_db, productos_db
from app.schemas.carrito import Carrito, CarritoCreate, ItemCarritoBase
from app.schemas.producto import ProductoEnCarrito

router = APIRouter()

# --- Funciones de ayuda ---
def encontrar_carrito(carrito_id: str):
    for carrito in carritos_db:
        if carrito["id"] == carrito_id:
            return carrito
    return None

def encontrar_producto(producto_id: str):
    for producto in productos_db:
        if producto["id"] == producto_id:
            return producto
    return None

# --- Endpoints ---

@router.post("/carritos", response_model=Carrito, status_code=status.HTTP_201_CREATED, tags=["Carritos"])
def crear_carrito(carrito_data: CarritoCreate):
    """
    Crea un nuevo carrito de compra para un usuario.
    No permite crear más de un carrito simultáneo por usuario.
    """
    for carrito in carritos_db:
        if carrito["user_id"] == carrito_data.user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un carrito para este usuario")
    nuevo_carrito = {
        "id": str(uuid.uuid4()),
        "user_id": carrito_data.user_id,
        "items": []
    }
    carritos_db.append(nuevo_carrito)
    return nuevo_carrito

@router.get("/carritos/{carrito_id}", response_model=Carrito, tags=["Carritos"])
def get_carrito(carrito_id: str):
    """
    Devuelve un carrito de compra específico por su ID.
    """
    carrito = encontrar_carrito(carrito_id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")
    return carrito

@router.delete("/carritos/{carrito_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Carritos"])
def eliminar_carrito(carrito_id: str):
    """
    Elimina un carrito de compra por su ID.
    """
    carrito = encontrar_carrito(carrito_id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")
    carritos_db.remove(carrito)
    return

@router.put("/carritos/{carrito_id}", response_model=Carrito, tags=["Carritos"])
def sobreescribir_carrito(carrito_id: str, nuevos_items: List[ItemCarritoBase]):
    """
    Sobreescribe completamente la lista de productos de un carrito.
    Valida que no se exceda el stock disponible para ningún producto.
    """
    carrito = encontrar_carrito(carrito_id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")

    # Validar que todos los productos existen y que no se excede el stock
    for item in nuevos_items:
        producto = encontrar_producto(item.producto_id)
        if not producto:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {item.producto_id} no encontrado")
        if item.cantidad > producto["stock"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Stock insuficiente para el producto: {producto['nombre']}. Stock disponible: {producto['stock']}")

    carrito["items"] = [item.model_dump() for item in nuevos_items]
    return carrito


@router.patch("/carritos/{carrito_id}", response_model=Carrito, tags=["Carritos"])
def agregar_productos_al_carrito(carrito_id: str, items_a_agregar: List[ItemCarritoBase]):
    """
    Agrega una lista de productos a un carrito existente. Si un producto ya existe, actualiza la cantidad.
    Fraudes:
        -No puede haber un carrito con una lista de más de 15 ítems (sumando cantidades).
        -No puede haber más de 10 unidades de un mismo producto (sumando todas las tuplas con ese producto_id).
    """
    carrito = encontrar_carrito(carrito_id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")

    # Validar existencia de productos
    for item_nuevo in items_a_agregar:
        if not encontrar_producto(item_nuevo.producto_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {item_nuevo.producto_id} no encontrado")

    # Agrupar cantidades por producto (sumando lo que ya hay en el carrito y lo nuevo)
    cantidades_por_producto = {}
    for item in carrito["items"]:
        pid = item["producto_id"]
        cantidades_por_producto[pid] = cantidades_por_producto.get(pid, 0) + item["cantidad"]
    for item_nuevo in items_a_agregar:
        pid = item_nuevo.producto_id
        cantidades_por_producto[pid] = cantidades_por_producto.get(pid, 0) + item_nuevo.cantidad

    # Validar máximo 15 ítems en total
    total_cantidades = sum(cantidades_por_producto.values())
    if total_cantidades > 15:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puede haber más de 15 ítems en el carrito")

    # Validar máximo 10 unidades por producto
    for pid, total in cantidades_por_producto.items():
        if total > 10:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"No puede haber más de 10 unidades del producto {pid} en el carrito")

    # Actualizar el carrito agrupando por producto
    # Primero, crear un dict de items actuales
    items_dict = {item["producto_id"]: item for item in carrito["items"]}
    for item_nuevo in items_a_agregar:
        pid = item_nuevo.producto_id
        if pid in items_dict:
            items_dict[pid]["cantidad"] += item_nuevo.cantidad
        else:
            items_dict[pid] = item_nuevo.model_dump()
    # Actualizar la lista de items del carrito
    carrito["items"] = list(items_dict.values())

    return carrito


@router.get("/pago/{carrito_id}/", tags=["Pago"])
def pagar_carrito(carrito_id: str):
    """
    Procesa el pago de un carrito.
    - Verifica y resta el stock de los productos.
    - Elimina el carrito.
    - Devuelve un número de seguimiento.
    """
    carrito = encontrar_carrito(carrito_id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")

    if not carrito["items"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    # 1. Verificar stock
    for item_carrito in carrito["items"]:
        producto_db = encontrar_producto(item_carrito["producto_id"])
        if not producto_db:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {item_carrito['producto_id']} no encontrado en la base de datos de productos")
        if producto_db["stock"] < item_carrito["cantidad"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Stock insuficiente para el producto: {producto_db['nombre']}. Stock disponible: {producto_db['stock']}")

    # 2. Restar stock (si la verificación fue exitosa)
    for item_carrito in carrito["items"]:
        producto_db = encontrar_producto(item_carrito["producto_id"])
        # Esta doble verificación es redundante si la lista no cambia, pero es segura
        if producto_db:
            producto_db["stock"] -= item_carrito["cantidad"]

    # 3. Eliminar el carrito
    carritos_db.remove(carrito)

    # 4. Generar número de seguimiento
    numero_seguimiento = f"PEDIDO-{str(uuid.uuid4())[:8].upper()}"

    return {
        "mensaje": "Pago procesado exitosamente",
        "numero_seguimiento": numero_seguimiento
    }