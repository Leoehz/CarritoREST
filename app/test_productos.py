from fastapi.testclient import TestClient
from app.main import app
from app.db.database import productos_db


client = TestClient(app)

def setup_function():
    productos_db.clear()

#GET
def test_get_productos():
    response = client.get("/productos")
    assert response.status_code == 200
    assert len(response.json()) == len(productos_db)