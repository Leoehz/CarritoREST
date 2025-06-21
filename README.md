# API de Carrito de Compras - FastAPI

Este proyecto implementa una API REST para la gestión de un carrito de compras utilizando el framework **FastAPI**. La API está diseñada para ser robusta, incluyendo reglas de negocio específicas para el manejo de stock, prevención de fraudes y limpieza automática de recursos.

La implementación utiliza una base de datos en memoria (diccionarios de Python) para simular la persistencia de datos, lo que la hace ideal para demostraciones y pruebas sin necesidad de configurar una base de datos externa.

## Características Principales

  - **Gestión de Productos y Carritos**: Endpoints para listar productos y realizar operaciones CRUD completas sobre los carritos de compra.
  - **Reglas de Negocio Claras**: Lógica de negocio para prevenir fraudes, como límites de ítems y operaciones.
  - **Manejo de Stock en Tiempo Real**: El stock se valida y actualiza en las operaciones relevantes para evitar inconsistencias.
  - **Limpieza Automática de Carritos**: Los carritos inactivos o que exceden los límites de operaciones son eliminados automáticamente.
  - **Documentación Interactiva**: Gracias a FastAPI, la API cuenta con documentación automática (Swagger UI y ReDoc) para facilitar las pruebas.

## Modelos de Datos y Estructura

### Producto

Cada producto en el sistema se define por los siguientes atributos:

  - `producto_id` (integer): Identificador único del producto.
  - `nombre` (string): Nombre del producto.
  - `stock` (integer): Cantidad disponible del producto.

### Carrito

El contenido de un carrito se estructura de la siguiente manera:

  - `user_id` (integer): Identificador del usuario al que pertenece el carrito.
  - `carrito_id` (integer): Identificador único del carrito.
  - `items` (list): Una lista de productos, donde cada ítem contiene:
      - `producto_id` (integer): El ID del producto.
      - `cantidad` (integer): La cantidad de ese producto en el carrito.

### Implementación del Servidor

Para una gestión eficiente, el servidor mantiene dos estructuras de datos principales en memoria:

1.  **Diccionario de Carritos**: Un diccionario donde la clave es el `carrito_id`. El valor es otro diccionario que contiene toda la información del carrito:

      - `user_id` (integer)
      - `items` (list)
      - `operaciones` (integer): Contador de operaciones realizadas sobre el carrito.
      - `ultima_modificacion` (datetime): Fecha y hora de la última vez que se modificó el carrito.

2.  **Diccionario de Usuarios**: Un diccionario que mapea `user_id` a `carrito_id` para asegurar que cada usuario tenga solo un carrito activo a la vez.

### Respuesta del Pago

Al procesar un pago exitoso, la API devuelve un objeto con un único atributo:

  - `seguimiento_id` (integer): Un número único para el seguimiento del pedido.

## Reglas de Negocio y Manejo de Errores

La API implementa varias reglas críticas para garantizar la integridad de los datos y prevenir abusos.

| Regla | Descripción | Consecuencia / Error |
| :--- | :--- | :--- |
| **1. Carrito Único por Usuario** | Un usuario no puede tener más de un carrito de compras activo simultáneamente. | Si se intenta crear un carrito para un `user_id` que ya tiene uno, la API devolverá un error `409 Conflict`. |
| **2. Límite de Ítems por Carrito** | Un carrito no puede contener más de **15 ítems únicos** (diferentes `producto_id`). | Cualquier operación (`PUT`, `PATCH`) que resulte en más de 15 ítems será rechazada con un error `400 Bad Request`. |
| **3. Límite de Operaciones** | No se pueden realizar más de **20 operaciones** (`PUT`, `PATCH`) sobre un mismo carrito. | Al alcanzar la operación número 21, el carrito se considera fraudulento y es **eliminado automáticamente** del sistema. |
| **4. Límite de Cantidad por Producto**| La suma de las cantidades para un mismo `producto_id` no puede exceder las **10 unidades**. | Cualquier operación que intente superar este límite será rechazada con un error `400 Bad Request`. |
| **5. Expiración por Inactividad** | Un carrito que permanezca inactivo por más de **5 minutos** es eliminado automáticamente. | La inactividad se mide desde el campo `ultima_modificacion`. |
| **6. Control de Stock** | En todo momento, la cantidad de un producto en un carrito no puede exceder el stock disponible. | Operaciones como `PUT`, `PATCH` o `GET /pago` que violen esta regla devolverán un error `409 Conflict`. |

## API Endpoints

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/productos` | Devuelve la lista de todos los productos disponibles. |
| `POST` | `/carritos` | Crea un nuevo carrito. Falla si el usuario ya tiene uno (`409 Conflict`). |
| `GET` | `/carritos/<carrito_id>` | Devuelve los detalles de un carrito específico. |
| `PUT` | `/carritos/<carrito_id>` | Sobrescribe la lista de ítems. Valida stock, límite de ítems y cantidad. Incrementa el contador de operaciones. |
| `PATCH` | `/carritos/<carrito_id>` | Agrega ítems al carrito. Valida stock, límite de ítems y cantidad. Incrementa el contador de operaciones. |
| `DELETE`| `/carritos/<carrito_id>` | Elimina un carrito de compra específico. |
| `GET` | `/pago/<carrito_id>` | Procesa el pago, valida y decrementa el stock de productos, y elimina el carrito. Devuelve un ID de seguimiento. |

## Instalación y Ejecución

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/Leoehz/CarritoREST.git
    cd CarritoREST
    ```

2.  **(Opcional pero recomendado) Crear un entorno virtual:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    ```

3.  **Instalar dependencias:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Ejecutar el servidor:**

    ```bash
    uvicorn app.main:app --reload
    ```

5.  **Acceder a la documentación:**
    Abre tu navegador y visita [http://127.0.0.1:8000/docs](https://www.google.com/search?q=http://127.0.0.1:8000/docs) para ver la documentación interactiva de Swagger UI y probar los endpoints.

## Pruebas (Testing)

Se debe implementar una suite de tests de unidad (usando `pytest` y `httpx`) que cubra todas las reglas de negocio y casos de error. Las pruebas deben verificar obligatoriamente los siguientes escenarios:

  - **Creación de Carrito Único**:
      - Verificar que no se puede crear un segundo carrito para un mismo `user_id`.
      - Verificar que, tras eliminar (`DELETE`) un carrito, se puede crear uno nuevo para ese mismo usuario.
      - Verificar que, tras pagar (`GET /pago`) un carrito, se puede crear uno nuevo para ese mismo usuario.
  - **Actualización de Stock**:
      - Verificar que después de un pago exitoso, el `stock` de los productos correspondientes en la lista de productos se ha decrementado correctamente.
  - **Límites y Reglas de Fraude**:
      - Tests para el límite de 15 ítems.
      - Tests para el límite de 10 unidades por producto.
      - Tests para el límite de 20 operaciones que resulta en la eliminación del carrito.