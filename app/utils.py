from datetime import datetime, timezone, timedelta
from app.db.database import carritos_db, productos_db

# Funcion para setear el timestamp en un carrito
def timestamp_utc():
    return datetime.now(timezone.utc)

# Funcion para saber si un carrito estuvo inactivo por mas de 3 minutos
def carrito_inactivo(carrito, limite_minutos=3):
    hora_actual = timestamp_utc()
    duracion_inactividad = hora_actual - carrito["actualizado_en"]
    return duracion_inactividad.total_seconds() > limite_minutos * 60

# Funcion para comprobar un carrito existente
def encontrar_carrito(carrito_id: str):
    for carrito in carritos_db:
        if carrito["id"] == carrito_id:
            return carrito
    return None

# Funcion para comprobar un producto existente
def encontrar_producto(producto_id: str):
    for producto in productos_db:
        if producto["id"] == producto_id:
            return producto
    return None