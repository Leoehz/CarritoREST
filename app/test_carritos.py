from fastapi.testclient import TestClient
from app.main import app
from app.db.database import carritos_db

client = TestClient(app)

def setup_function():
    carritos_db.clear()

#CREATE
def test_crear_carrito():
    response = client.post("/carritos", json={"user_id": "123"})
    assert response.status_code == 201
    assert response.json()["user_id"] == "123"

def test_dos_carritos_simultaneos_para_mismo_usuario():
    response1 = client.post("/carritos", json={"user_id": "TestSimultaneo"})
    assert response1.status_code == 201
    carrito1 = response1.json()

    response2 = client.post("/carritos", json={"user_id": "TestSimultaneo"})
    assert response2.status_code == 409

def test_crear_otro_carrito_tras_eliminar_o_pagar():
    # Crear primer carrito para user_id 'abc'
    response1 = client.post("/carritos", json={"user_id": "TestOtroCarrito"})
    assert response1.status_code == 201
    carrito1 = response1.json()

    # Eliminar el primer carrito
    del_response = client.delete(f"/carritos/{carrito1['id']}")
    assert del_response.status_code == 204

    # Ahora debería poder crear otro carrito para el mismo usuario
    response2 = client.post("/carritos", json={"user_id": "TestOtroCarrito"})
    assert response2.status_code == 201
    carrito2 = response2.json()
    assert carrito1["id"] != carrito2["id"]

    # Pagar el segundo carrito
    from app.db.database import productos_db
    productos_db.clear()
    productos_db.append({"id": 1, "nombre": "TestProd", "precio": 10.0, "stock": 5})
    patch_response = client.patch(f"/carritos/{carrito2['id']}", json=[{"producto_id": 1, "cantidad": 2}])
    assert patch_response.status_code == 200
    pago_response = client.get(f"/pago/{carrito2['id']}/")
    assert pago_response.status_code == 200
    assert "numero_seguimiento" in pago_response.json()

    # Ahora debería poder crear otro carrito para el mismo usuario
    response3 = client.post("/carritos", json={"user_id": "abc"})
    assert response3.status_code == 201
    carrito3 = response3.json()
    assert carrito3["id"] != carrito2["id"]

#GET
def test_get_carrito_existente():
    response = client.post("/carritos", json={"user_id": "TestGet"})
    carrito_id = response.json()["id"]
    response = client.get(f"/carritos/{carrito_id}")
    assert response.status_code == 200
    assert response.json()["id"] == carrito_id

def test_get_carrito_inexistente():
    response = client.get("/carritos/123456789")
    assert response.status_code == 404

#DELETE
def test_eliminar_carrito():
    response = client.post("/carritos", json={"user_id": "TestDelete"})
    
    carrito_id = response.json()["id"]
    del_response = client.delete(f"/carritos/{carrito_id}")
    assert del_response.status_code == 204

    del_response2 = client.delete(f"/carritos/{carrito_id}")
    assert del_response2.status_code == 404

#PATCH
def test_agregar_productos_al_carrito():
    from app.db.database import productos_db
    productos_db.clear()
    productos_db.append({"id": 100, "nombre": "ProdPatch1", "precio": 10.0, "stock": 20})
    productos_db.append({"id": 200, "nombre": "ProdPatch2", "precio": 15.0, "stock": 30})

    # Crear carrito
    response = client.post("/carritos", json={"user_id": "user_patch"})
    assert response.status_code == 201
    carrito_id = response.json()["id"]

    # Agregar primer producto
    patch_response1 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 100, "cantidad": 2}])
    assert patch_response1.status_code == 200
    items = patch_response1.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 100
    assert items[0]["cantidad"] == 2

    # Agregar el mismo producto (debe sumar la cantidad)
    patch_response2 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 100, "cantidad": 3}])
    assert patch_response2.status_code == 200
    items = patch_response2.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 100
    assert items[0]["cantidad"] == 5

    # Agregar un producto diferente
    patch_response3 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 200, "cantidad": 1}])
    assert patch_response3.status_code == 200
    items = patch_response3.json()["items"]
    assert len(items) == 2
    cantidades = {item["producto_id"]: item["cantidad"] for item in items}
    assert cantidades[100] == 5
    assert cantidades[200] == 1

#PAGO
def test_stock_decrementa_correctamente_tras_pago():
    # Setup: producto con stock 10
    from app.db.database import productos_db
    productos_db.clear()
    productos_db.append({"id": 2, "nombre": "ProdStock", "precio": 20.0, "stock": 10})

    # Crear carrito y agregar producto
    response = client.post("/carritos", json={"user_id": "userstock"})
    carrito_id = response.json()["id"]
    patch_response = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 2, "cantidad": 4}])
    assert patch_response.status_code == 200

    # Pagar carrito
    pago_response = client.get(f"/pago/{carrito_id}/")
    assert pago_response.status_code == 200

    # Verificar que el stock se decrementó
    assert productos_db[0]["stock"] == 6

#PUT
def test_sobreescribir_items_carrito():
    # Setup: crear producto y carrito
    from app.db.database import productos_db
    productos_db.clear()
    productos_db.append({"id": 10, "nombre": "Prod1", "precio": 5.0, "stock": 100})
    productos_db.append({"id": 20, "nombre": "Prod2", "precio": 15.0, "stock": 50})

    response = client.post("/carritos", json={"user_id": "user_put"})
    assert response.status_code == 201
    carrito_id = response.json()["id"]

    # Agregar un producto al carrito
    patch_response = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 10, "cantidad": 2}])
    assert patch_response.status_code == 200
    assert len(patch_response.json()["items"]) == 1

    # Sobreescribir los items con un nuevo producto
    put_response = client.put(f"/carritos/{carrito_id}", json=[{"producto_id": 20, "cantidad": 3}])
    assert put_response.status_code == 200
    items = put_response.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 20
    assert items[0]["cantidad"] == 3
