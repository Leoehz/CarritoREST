# Importaciones necesarias para las pruebas
from fastapi.testclient import TestClient
from app.main import app  # La instancia de la aplicación FastAPI
from app.db.database import carritos_db, productos_db # Simulación de la base de datos en memoria
from app.utils import carrito_inactivo, timestamp_utc, timedelta # Utilidades para pruebas de inactividad

# Creación de un cliente de prueba que interactuará con la API
client = TestClient(app)

def setup_function():
    """
    Función de configuración (fixture) de Pytest.
    Se ejecuta antes de cada función de test en este archivo.
    Limpia la base de datos de carritos para asegurar que cada test 
    comience en un estado limpio y no interfiera con otros.
    """
    carritos_db.clear()

# --- Tests para la CREACIÓN de carritos (POST /carritos) ---

def test_crear_carrito():
    """
    Verifica el "camino feliz" para la creación de un carrito.
    Asegura que la API responde con un código 201 (Creado) y que
    el carrito devuelto contiene el user_id correcto.
    """
    response = client.post("/carritos", json={"user_id": "123"})
    assert response.status_code == 201
    assert response.json()["user_id"] == "123"

def test_dos_carritos_simultaneos_para_mismo_usuario():
    """
    Valida la regla de negocio: "Un usuario no puede tener dos carritos activos al mismo tiempo".
    1. Crea un primer carrito para un usuario.
    2. Intenta crear un segundo carrito para el MISMO usuario.
    3. Verifica que la segunda petición falla con un código 409 (Conflicto).
    """
    response1 = client.post("/carritos", json={"user_id": "TestSimultaneo"})
    assert response1.status_code == 201

    response2 = client.post("/carritos", json={"user_id": "TestSimultaneo"})
    assert response2.status_code == 409

def test_crear_otro_carrito_tras_eliminar_o_pagar():
    """
    Verifica que la restricción de un carrito por usuario se levanta 
    correctamente después de que el carrito es eliminado o pagado.
    
    Parte 1: Probar después de eliminar
    """
    # Crear un primer carrito para el usuario 'TestOtroCarrito'
    response1 = client.post("/carritos", json={"user_id": "TestOtroCarrito"})
    assert response1.status_code == 201
    carrito1 = response1.json()

    # Eliminar el carrito recién creado
    del_response = client.delete(f"/carritos/{carrito1['id']}")
    assert del_response.status_code == 204 # 204 No Content es la respuesta estándar para un DELETE exitoso

    # Ahora, el mismo usuario debería poder crear un nuevo carrito
    response2 = client.post("/carritos", json={"user_id": "TestOtroCarrito"})
    assert response2.status_code == 201
    carrito2 = response2.json()
    assert carrito1["id"] != carrito2["id"] # Asegura que es un carrito nuevo

    """
    Parte 2: Probar después de pagar
    """
    # Preparar el entorno para el pago: un producto con stock
    productos_db.clear()
    productos_db.append({"id": 1, "nombre": "TestProd", "precio": 10.0, "stock": 5})
    # Agregar el producto al carrito 2
    patch_response = client.patch(f"/carritos/{carrito2['id']}", json=[{"producto_id": 1, "cantidad": 2}])
    assert patch_response.status_code == 200
    # Pagar el carrito
    pago_response = client.get(f"/pago/{carrito2['id']}/")
    assert pago_response.status_code == 200
    assert "numero_seguimiento" in pago_response.json()

    # Después de pagar, el mismo usuario debería poder crear otro carrito
    response3 = client.post("/carritos", json={"user_id": "TestOtroCarrito"})
    assert response3.status_code == 201
    carrito3 = response3.json()
    assert carrito3["id"] != carrito2["id"]


# --- Tests para OBTENER carritos (GET /carritos/{carrito_id}) ---

def test_get_carrito_existente():
    """
    Verifica que se puede obtener un carrito existente por su ID.
    """
    response = client.post("/carritos", json={"user_id": "TestGet"})
    carrito_id = response.json()["id"]
    get_response = client.get(f"/carritos/{carrito_id}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == carrito_id

def test_get_carrito_inexistente():
    """
    Verifica que la API maneja correctamente la petición de un carrito 
    que no existe, devolviendo un error 404 (No Encontrado).
    """
    response = client.get("/carritos/id_que_no_existe")
    assert response.status_code == 404

# --- Tests para ELIMINAR carritos (DELETE /carritos/{carrito_id}) ---

def test_eliminar_carrito():
    """
    Verifica el proceso de eliminación de un carrito.
    1. Crea un carrito.
    2. Lo elimina y verifica que la operación es exitosa (204).
    3. Intenta eliminarlo de nuevo y verifica que ahora da un error 404,
       porque el recurso ya no existe.
    """
    response = client.post("/carritos", json={"user_id": "TestDelete"})
    carrito_id = response.json()["id"]
    
    del_response = client.delete(f"/carritos/{carrito_id}")
    assert del_response.status_code == 204

    del_response2 = client.delete(f"/carritos/{carrito_id}")
    assert del_response2.status_code == 404

# --- Tests para MODIFICAR carritos (PATCH /carritos/{carrito_id}) ---

def test_agregar_productos_al_carrito():
    """
    Valida la lógica de agregar productos a un carrito con PATCH.
    1. Agrega un producto nuevo.
    2. Agrega más cantidad del MISMO producto (debe sumar las cantidades).
    3. Agrega un producto diferente (debe añadirse a la lista de ítems).
    """
    # Preparar productos en la "base de datos"
    productos_db.clear()
    productos_db.append({"id": 100, "nombre": "ProdPatch1", "precio": 10.0, "stock": 20})
    productos_db.append({"id": 200, "nombre": "ProdPatch2", "precio": 15.0, "stock": 30})

    # Crear el carrito
    response = client.post("/carritos", json={"user_id": "user_patch"})
    assert response.status_code == 201
    carrito_id = response.json()["id"]

    # 1. Agregar primer producto
    patch_response1 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 100, "cantidad": 2}])
    assert patch_response1.status_code == 200
    items = patch_response1.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 100 and items[0]["cantidad"] == 2

    # 2. Agregar el mismo producto (debe sumar la cantidad de 2 a 5)
    patch_response2 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 100, "cantidad": 3}])
    assert patch_response2.status_code == 200
    items = patch_response2.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 100 and items[0]["cantidad"] == 5

    # 3. Agregar un producto diferente
    patch_response3 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 200, "cantidad": 1}])
    assert patch_response3.status_code == 200
    items = patch_response3.json()["items"]
    assert len(items) == 2
    
def test_no_se_puede_superar_limite_de_cantidad_por_producto():
    """
    Valida la regla de negocio: "La cantidad de un mismo producto no puede exceder 10 unidades".
    1. Agrega 10 unidades de un producto (límite permitido).
    2. Intenta agregar más unidades del mismo producto.
    3. Verifica que la API responde con un error 400 (Bad Request).
    """
    productos_db.clear()
    productos_db.append({"id": 101, "nombre": "ProdA", "precio": 10.0, "stock": 100})

    # Crear carrito
    response = client.post("/carritos", json={"user_id": "user_limite"})
    assert response.status_code == 201
    carrito_id = response.json()["id"]

    # Agregar 10 unidades del producto 101 (debería funcionar)
    patch_response1 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 101, "cantidad": 10}])
    assert patch_response1.status_code == 200
    assert patch_response1.json()["items"][0]["cantidad"] == 10

    # Intentar agregar 1 unidad más del mismo producto (debería fallar)
    patch_response2 = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 101, "cantidad": 1}])
    assert patch_response2.status_code == 400
    assert "No puede haber más de 10 unidades" in patch_response2.json()["detail"]


# --- Tests para el PAGO de carritos (GET /pago/{carrito_id}) ---

def test_stock_decrementa_correctamente_tras_pago():
    """
    Valida una de las lógicas más críticas: la actualización del stock.
    1. Prepara un producto con un stock inicial conocido (10).
    2. Crea un carrito y agrega una cantidad de ese producto (4).
    3. Procesa el pago.
    4. Verifica que el stock del producto en la base de datos se ha 
       reducido correctamente (de 10 a 6).
    """
    productos_db.clear()
    productos_db.append({"id": 2, "nombre": "ProdStock", "precio": 20.0, "stock": 10})

    # Crear carrito y agregar 4 unidades del producto
    response = client.post("/carritos", json={"user_id": "userstock"})
    carrito_id = response.json()["id"]
    patch_response = client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 2, "cantidad": 4}])
    assert patch_response.status_code == 200

    # Pagar el carrito
    pago_response = client.get(f"/pago/{carrito_id}/")
    assert pago_response.status_code == 200

    # Verificar que el stock se decrementó
    assert productos_db[0]["stock"] == 6

# --- Tests para SOBREESCRIBIR carritos (PUT /carritos/{carrito_id}) ---

def test_sobreescribir_items_carrito():
    """
    Verifica la funcionalidad de PUT para reemplazar completamente los
    ítems de un carrito.
    1. Agrega un producto inicial.
    2. Usa PUT con una lista de ítems diferente.
    3. Comprueba que el contenido del carrito es exactamente el que se envió en la petición PUT.
    """
    # Preparar productos
    productos_db.clear()
    productos_db.append({"id": 10, "nombre": "Prod1", "precio": 5.0, "stock": 100})
    productos_db.append({"id": 20, "nombre": "Prod2", "precio": 15.0, "stock": 50})

    # Crear carrito y agregar un ítem inicial
    response = client.post("/carritos", json={"user_id": "user_put"})
    carrito_id = response.json()["id"]
    client.patch(f"/carritos/{carrito_id}", json=[{"producto_id": 10, "cantidad": 2}])
    
    # Sobreescribir con PUT
    put_response = client.put(f"/carritos/{carrito_id}", json=[{"producto_id": 20, "cantidad": 3}])
    assert put_response.status_code == 200
    items = put_response.json()["items"]
    assert len(items) == 1
    assert items[0]["producto_id"] == 20 and items[0]["cantidad"] == 3

def test_sobreescribir_items_con_mas_unidades_que_stock():
    """
    Verifica que la validación de stock también se aplica al usar PUT.
    Intenta reemplazar los ítems del carrito con una cantidad de un 
    producto que excede el stock disponible y espera un error 409.
    """
    productos_db.clear()
    productos_db.append({"id": 30, "nombre": "ProdStockPUT", "precio": 50.0, "stock": 4})

    response = client.post("/carritos", json={"user_id": "user_put_stock"})
    carrito_id = response.json()["id"]

    # Intentar sobreescribir con 6 unidades cuando solo hay 4 en stock
    put_response = client.put(f"/carritos/{carrito_id}", json=[{"producto_id": 30, "cantidad": 6}])
    assert put_response.status_code == 409
    assert "stock" in put_response.json()["detail"].lower()


# --- Tests Unitarios para la lógica de INACTIVIDAD ---

def test_carrito_no_expirado():
    """
    Prueba unitaria para la función 'carrito_inactivo'.
    Simula un carrito que fue actualizado hace 30 segundos y verifica
    que la función correctamente lo identifica como NO inactivo 
    (con un límite de 1 minuto).
    """
    carrito_fresco = {
        "actualizado_en": timestamp_utc() - timedelta(minutes=0, seconds=30)
    }
    assert not carrito_inactivo(carrito_fresco, limite_minutos=1)

def test_carrito_expirado():
    """
    Prueba unitaria para la función 'carrito_inactivo'.
    Simula un carrito que fue actualizado hace 1 minuto y 5 segundos y
    verifica que la función correctamente lo identifica como SÍ inactivo
    (con un límite de 1 minuto).
    """
    carrito_viejo = {
        "actualizado_en": timestamp_utc() - timedelta(minutes=1, seconds=5)
    }
    assert carrito_inactivo(carrito_viejo, limite_minutos=1)

