# Participante 1 — Flujo de Productos, Carrito y Pago con Stripe

## Requisitos previos

1. Backend corriendo en `http://localhost:8080`
2. Frontend corriendo en `http://localhost:3000`
3. Las claves de Stripe deben estar configuradas en `backend/src/main/resources/application.properties`:
   ```
   stripe.secret-key=sk_test_tu_clave_secreta
   stripe.publishable-key=pk_test_tu_clave_publicable
   ```
4. La base de datos PostgreSQL debe tener productos cargados (ejecutar `database/init.sql` si es necesario)

---

## Paso a paso para probar el flujo completo

### 1. Registrar un cliente nuevo

- Ir a http://localhost:3000/register
- Llenar:
  - Nombre Completo: por ejemplo `Juan Perez`
  - Correo Electronico: por ejemplo `juan@test.com`
  - Telefono: por ejemplo `999888777`
  - Contrasena: por ejemplo `123456`
- Hacer clic en "Crear Cuenta"
- Te redirige automaticamente al login

### 2. Iniciar sesion

- En http://localhost:3000/login, ingresar con el correo y contrasena que registraste
- Hacer clic en "Iniciar Sesion"
- La barra de navegacion ahora muestra el nombre del cliente y las opciones de cliente

### 3. Navegar al catalogo de productos

- Ir a http://localhost:3000/products
- Se muestra una cuadricula con los productos disponibles (con iconos de Bootstrap, imagenes reales no hay)
- Cada producto muestra: nombre, descripcion, precio y un boton "Agregar"

### 4. Agregar productos al carrito

- Hacer clic en "Agregar" en uno o varios productos
- Aparece un carrito lateral (sidebar) con los productos seleccionados
- Se puede ajustar la cantidad desde el sidebar
- Tambien se puede ir a http://localhost:3000/cart para ver el carrito en pantalla completa

### 5. Ir al checkout

- Estando en el carrito (http://localhost:3000/cart), hacer clic en "Ir a Pagar"
- Te lleva a http://localhost:3000/shop/checkout
- Aqui se ve el resumen de la compra: lista de productos, cantidades y total

### 6. Pagar con Stripe

- En la pagina de checkout, hacer clic en "Pagar con Stripe"
- El navegador redirige a la pagina de pago de Stripe (sandbox/test)
- Usar la tarjeta de prueba: `4242 4242 4242 4242`
- Fecha de expiracion: cualquier fecha futura (ej. `12/28`)
- CVC: cualquier numero de 3 digitos (ej. `123`)
- Hacer clic en "Pagar"

### 7. Confirmacion de pago exitoso

- Stripe redirige de vuelta a http://localhost:3000/shop/confirmacion?status=success&session_id=...
- Se muestra un icono de check verde y el mensaje "Pago Exitoso"
- El carrito se limpia automaticamente (localStorage)
- Botones para "Volver al Catalogo" o "Ir al Inicio"

### 8. Ver historial de ordenes

- Ir a http://localhost:3000/shop/historial
- Se muestra una tabla con todas las ordenes del cliente: ID, productos, metodo de pago, estado, total, fecha

### 9. Ver ordenes desde el panel admin

- Ir a http://localhost:3000/admin/login
- Ingresar con: `antonela_admin` / `Antonela2025`
- En el menu lateral, hacer clic en "Ordenes"
- Se ve una tabla con todas las ordenes de todos los clientes
- Se puede cambiar el estado de cada orden con un selector (pendiente / completada / cancelada)
- Las notificaciones de pedidos nuevos aparecen en el Dashboard

---

## Como funciona el codigo

### Backend

#### Entities

**OrdenCompra.java** — Representa una orden de compra en la base de datos (tabla `ordenes_compra`).
- `id` — identificador autoincremental
- `cliente` — relacion ManyToOne con el cliente que compra
- `productos` — campo JSONB que almacena los productos como JSON (ej. `[{"nombre":"Mascarilla Capilar","precio":28,"cantidad":1}]`)
- `montoTotal` — suma total de la compra
- `metodoPago` — string que indica el metodo (hoy dia siempre `"stripe"`)
- `estado` — string: `"pendiente"` (recien creada), `"completada"` (pagada), `"cancelada"`
- `idTransaccionSimulada` — ID legible estilo `"STRIPE-1718112345"`
- `creadoEn` — timestamp de creacion

#### Controladores

**CheckoutController.java** (`/api/cart`)
- `POST /api/cart/create-checkout-session` — Recibe la lista de productos del carrito, crea la `OrdenCompra` con estado `"pendiente"`, llama a `StripeService.crearSesionProductos()` para crear una sesion de checkout en Stripe, devuelve `{ url, sessionId, ordenId }`. El frontend redirige a esa `url`.
- `POST /api/cart/checkout` — Para pagos simulados (efectivo o tarjeta simulada), no usa Stripe.
- `GET /api/cart/client/orders` — Devuelve las ordenes del cliente autenticado.

**WebhookController.java** (`/api/webhook/stripe`)
- `POST /api/webhook/stripe` — Stripe envia eventos aqui cuando un pago se completa. Escucha el evento `checkout.session.completed`, extrae el `client_reference_id` (que es el ID de la orden), y llama a `StripeService.procesarPagoExitoso()` para marcar la orden como `"completada"` y enviar la notificacion.

**AdminOrdenController.java** (`/api/admin/orders`)
- `GET /api/admin/orders` — Lista todas las ordenes (solo admin).
- `PUT /api/admin/orders/{id}/status` — Cambia el estado de una orden (body: `{ "estado": "completada" }`). No requiere webhook, es manual (para cuando el admin quiere forzar un cambio).

#### Servicios

**StripeService.java**
- `crearSesionProductos(cliente, items, total, ordenId)` — Construye los `SessionCreateParams` de Stripe con cada producto como un line item, asigna la URL de exito a `/shop/confirmacion?status=success`, la URL de cancelacion a `/shop/confirmacion?status=canceled`, y vincula la orden mediante `client_reference_id`. Crea la sesion con `Session.create(params)`.
- `procesarPagoExitoso(clientReferenceId, paymentIntentId)` — Si el `clientReferenceId` empieza con `cita_` procesa una cita; si no, lo trata como ID de orden: busca la orden, cambia su estado a `"completada"`, guarda el `paymentIntentId`, y llama a `NotificacionService.enviarConfirmacionPedido()`.

**NotificacionService.java**
- `enviarConfirmacionPedido(OrdenCompra)` — Envia un mensaje de WhatsApp (via Twilio) al cliente con los detalles de la orden. Si falla, intenta enviar un email. Tambien crea una notificacion en la tabla `notificaciones_admin` para que aparezca en el Dashboard del admin.

### Frontend

#### Paginas principales

**Cart.tsx** (`/cart`)
- Muestra los productos del carrito leyendo del `CartContext` (que mantiene el estado en React) y de `localStorage` (claves `cart_items`, `carrito_salon`, `carrito`) como fallback.
- Cada item muestra nombre, precio, cantidad (con botones + y -) y total por item.
- Abajo muestra el total general y un boton "Ir a Pagar" que navega a `/shop/checkout`.
- Usa iconos de Bootstrap (`bi-trash`, `bi-dash`, `bi-plus`, etc.).

**Checkout.tsx** (`/shop/checkout`)
- Solo accesible si hay items en el carrito.
- Muestra el resumen de la compra: cada producto con su subtotal y el total general.
- El boton "Pagar con Stripe" hace un `POST /api/cart/create-checkout-session` con los productos del carrito.
- Cuando la respuesta llega con `{ url }`, redirige el navegador a esa URL de Stripe con `window.location.href = url`.
- Guarda el `ordenId` en `localStorage` como `stripe_orden_id` para tracking.

**Confirmacion.tsx** (`/shop/confirmacion`)
- Lee los parametros de la URL: `status` (`success`, `canceled`, `failure`) y `type` (`cita` o no).
- Si `status=success` y no es una cita, limpia el carrito del `localStorage`.
- Muestra icono y mensaje segun el estado:
  - `success` → check verde + "Pago Exitoso"
  - `canceled` → X rojo + "Pago Cancelado"
  - `failure` → X rojo + "Pago Rechazado"
- Botones contextuales: si es exito, "Volver al Catalogo" e "Ir al Inicio". Si es fallo, tambien "Volver al Carrito".
- Si `type=cita`, los botones cambian a "Mis Citas" e "Ir al Inicio".

#### Estado global del carrito

**CartContext.tsx** — Contexto de React que mantiene:
- `items: ArticuloCarrito[]` — los productos en el carrito
- `addItem(producto)`, `removeItem(productoId)`, `updateCantidad(productoId, cantidad)`, `clearCart()`
- Persiste en `localStorage` bajo la clave `cart_items`

**api.ts** — Instancia de Axios con `baseURL` configurada para que todas las peticiones `/api/...` se proxeen al backend en `http://localhost:8080` (configurado en `vite.config.ts`). Incluye automaticamente el token JWT en el header `Authorization` si el usuario esta autenticado.

---

## Diagrama del flujo

```
[Productos] --agregar--> [Carrito] --Ir a Pagar--> [Checkout]
                                                        |
                                                        | POST /api/cart/create-checkout-session
                                                        v
                                              [Se crea OrdenCompra]
                                              estado="pendiente"
                                                        |
                                                        | StripeService.crearSesionProductos()
                                                        v
                                              [Stripe Checkout Page]
                                                        |
                                                        | Usuario paga con 4242...
                                                        v
                                              [Webhook: checkout.session.completed]
                                                        |
                                                        | StripeService.procesarPagoExitoso()
                                                        | OrdenCompra.estado = "completada"
                                                        | NotificacionService.enviarConfirmacionPedido()
                                                        v
                                              [Redireccion al navegador]
                                                        |
                                                        v
                                         /shop/confirmacion?status=success
                                              "Pago Exitoso" ✓
```

## Tarjeta de prueba de Stripe

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| Cualquier fecha futura, cualquier CVC de 3 digitos | — |
