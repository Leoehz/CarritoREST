# app/main.py
from fastapi import FastAPI
from .routers import productos, carritos

app = FastAPI(
    title="API de Carrito de Compras",
    description="Una API para gestionar productos y carritos de compra.",
    version="1.0.0"
)

# Incluir los routers
app.include_router(productos.router)
app.include_router(carritos.router)

@app.get("/", tags=["Home"])
def read_root():
    return {"mensaje": "Bienvenido a la API del Carrito de Compras. Visita 127.0.0.1/docs para ver el listado de endpoints disponible."}