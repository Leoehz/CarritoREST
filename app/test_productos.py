from fastapi.testclient import TestClient
from app.main import app
from app.db.database import productos_db


client = TestClient(app)

def setup_function():
    """
    Función de configuración (fixture) de Pytest.
    Se ejecuta antes de cada función de test en este archivo.
    Limpia la base de datos de productos para asegurar que cada test 
    comience en un estado limpio y no interfiera con otros.
    """
    productos_db.clear()

#GET
def test_get_productos():
    """
    Verifica que el endpoint de /productos este disponible.
    """
    response = client.get("/productos")
    assert response.status_code == 200
    assert len(response.json()) == len(productos_db)