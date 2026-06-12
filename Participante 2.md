# Participante 2 — Flujo del Panel de Administracion

## Requisitos previos

1. Backend corriendo en `http://localhost:8080`
2. Frontend corriendo en `http://localhost:3000`
3. La base de datos debe tener el admin creado (ejecutar `database/init.sql`)

---

## Paso a paso para probar el panel admin

### 1. Iniciar sesion como admin

- Ir a http://localhost:3000/admin/login
- Ingresar:
  - Usuario: `antonela_admin`
  - Contrasena: `Antonela2025`
- Hacer clic en "Ingresar"
- Te redirige al Dashboard del admin

### 2. Dashboard — Vista general

- En http://localhost:3000/admin se ve el Dashboard
- **Tarjetas de estadisticas**: Citas Hoy, Clientes Registrados, Productos Activos, Ordenes de Compra
- **Accesos Rapidos**: enlaces a Calendario, Servicios, Inventario, Clientes
- **Notificaciones**: aparecen aqui los pedidos nuevos y citas creadas, con contador de no leidas. Hacer clic en una notificacion la marca como leida

### 3. Calendario — Gestionar citas

- Ir a http://localhost:3000/admin/calendar
- Seleccionar un rango de fechas (desde / hasta)
- Se muestra una tabla con todas las citas en ese rango:
  - Hora, Cliente, Servicio, Telefono, Estado
- **Acciones disponibles**:
  - "Confirmar" — cambia estado de `pendiente` a `confirmada`
  - "Completar" — cambia a `completada`
  - "Cancelar" — cambia a `cancelada`
  - "Reagendar" — abre un modal para cambiar fecha y hora
- Los cambios de estado envian notificaciones automaticas al cliente (WhatsApp o email)

### 4. Servicios — CRUD de servicios

- Ir a http://localhost:3000/admin/services
- Se listan todos los servicios con: nombre, descripcion, precio minimo, precio maximo, activo/inactivo
- **Crear**: formulario con nombre, descripcion, precio min, precio max, duracion, activo
- **Editar**: clic en el lapiz, se abre el mismo formulario precargado
- **Eliminar**: clic en el icono de papelera (confirma antes de borrar)

### 5. Inventario — CRUD de productos

- Ir a http://localhost:3000/admin/inventory
- Se listan todos los productos con: nombre, descripcion, precio, disponible, stock, imagen
- **Crear**: formulario con nombre, descripcion, precio, disponible, stock
- **Editar**: clic en el lapiz
- **Eliminar**: clic en papelera
- Las imagenes de productos se representan con iconos de Bootstrap (no archivos reales)

### 6. Ordenes — Gestionar pedidos

- Ir a http://localhost:3000/admin/orders
- Tabla con todas las ordenes de todos los clientes:
  - ID de transaccion, Cliente, Productos, Total, Metodo de pago, Estado, Fecha
- **Cambiar estado**: usar el selector en cada fila para elegir `pendiente`, `completada` o `cancelada`
- El cambio es inmediato via `PUT /api/admin/orders/{id}/status`

### 7. Galeria — CRUD de imagenes

- Ir a http://localhost:3000/admin/gallery
- Se listan las imagenes de la galeria con: titulo, descripcion, imagen
- **Subir**: formulario para agregar nueva imagen con titulo, descripcion y archivo
- **Editar**: modificar titulo, descripcion o imagen
- **Eliminar**: borrar imagen

### 8. Clientes — Ver datos de clientes

- Ir a http://localhost:3000/admin/clients
- Tabla con todos los clientes: nombre, correo, telefono, fecha de registro
- Hacer clic en "Ver Detalle" para:
  - Datos del cliente
  - Lista de citas del cliente
  - Lista de ordenes del cliente

### 9. Tareas — Gestion de tareas internas

- Ir a http://localhost:3000/admin/tasks
- Se listan las tareas con: titulo, descripcion, estado, fecha de vencimiento
- **Crear**: formulario para nueva tarea
- **Editar**: modificar tarea existente
- **Eliminar**: borrar tarea
- **Completar**: marcar tarea como completada

---

## Como funciona el codigo del admin

### Backend

#### Seguridad

**SecurityConfig.java** — Configuracion de Spring Security:
- Las rutas `/api/admin/login` y `/api/webhook/**` son publicas (sin autenticacion)
- Todas las demas rutas `/api/**` requieren token JWT
- Las rutas `/api/admin/**` requieren rol de admin
- El login de admin usa `POST /api/admin/login` con `{ usuario, contrasena }` y devuelve un JWT

#### Controladores del admin

**AdminDashboardController.java** (`/api/admin/dashboard`)
- `GET /api/admin/dashboard` — Retorna estadisticas: `citasHoy`, `totalClientes`, `productosActivos`, `totalOrdenes`
- `GET /api/admin/dashboard/notifications` — Retorna todas las notificaciones admin ordenadas por fecha descendente
- `POST /api/admin/dashboard/notifications/{id}/read` — Marca una notificacion como leida

**AdminCitaController.java** (`/api/admin/appointments`)
- `GET /api/admin/appointments` — Lista citas con filtro opcional por rango de fechas (`desde`, `hasta`)
- `GET /api/admin/appointments/{id}` — Detalle de una cita
- `PUT /api/admin/appointments/{id}/status` — Cambia estado (`pendiente`, `confirmada`, `completada`, `cancelada`). Al cambiar estado, envia notificacion al cliente (WhatsApp/email)
- `PUT /api/admin/appointments/{id}/reschedule` — Reagenda cita con nueva `fecha` y `hora`. Envia notificacion de reagendamiento

**AdminServicioController.java** (`/api/admin/services`)
- CRUD completo: `GET`, `POST`, `PUT /{id}`, `DELETE /{id}`
- `GET /api/services` (publico) — Para que los clientes vean servicios disponibles

**AdminProductoController.java** (`/api/admin/products`)
- CRUD completo: `GET`, `POST`, `PUT /{id}`, `DELETE /{id}`
- `GET /api/products` (publico) — Catalogo para clientes

**AdminOrdenController.java** (`/api/admin/orders`)
- `GET /api/admin/orders` — Lista todas las ordenes (con cliente, productos, estado)
- `PUT /api/admin/orders/{id}/status` — Cambia estado de una orden

**AdminClienteController.java** (`/api/admin/clients`)
- `GET /api/admin/clients` — Lista todos los clientes
- `GET /api/admin/clients/{id}` — Detalle de cliente
- `GET /api/admin/clients/{id}/appointments` — Citas del cliente
- `GET /api/admin/clients/{id}/orders` — Ordenes del cliente

**AdminGaleriaController.java** (`/api/admin/gallery`)
- CRUD completo para imagenes de galeria

**AdminTareaController.java** (`/api/admin/tasks`)
- CRUD completo para tareas internas

#### Entidades principales del admin

| Entidad | Tabla | Uso |
|---------|-------|-----|
| `Cita` | `citas` | Citas agendadas por clientes |
| `Servicio` | `servicios` | Servicios ofrecidos (cortes, tintes, etc.) |
| `Producto` | `productos` | Productos en venta |
| `OrdenCompra` | `ordenes_compra` | Pedidos de productos |
| `Cliente` | `clientes` | Usuarios registrados |
| `Galeria` | `galeria` | Imagenes del portafolio |
| `Tarea` | `tareas` | Tareas internas del salon |
| `NotificacionAdmin` | `notificaciones_admin` | Notificaciones para el dashboard |
| `UsuarioAdmin` | `usuarios_admin` | Credenciales de administradores |
| `Pago` | `pagos` | Registro de pagos (citas y ordenes) |

### Frontend

#### Paginas del admin

Todas las paginas admin estan en `frontend/src/pages/admin/`:

| Pagina | Ruta | Archivo |
|--------|------|---------|
| Login | `/admin/login` | `AdminLogin.tsx` |
| Dashboard | `/admin` | `AdminDashboard.tsx` |
| Calendario | `/admin/calendar` | `AdminCalendar.tsx` |
| Servicios | `/admin/services` | `AdminServices.tsx` |
| Inventario | `/admin/inventory` | `AdminInventory.tsx` |
| Ordenes | `/admin/orders` | `AdminOrders.tsx` |
| Galeria | `/admin/gallery` | `AdminGallery.tsx` |
| Clientes | `/admin/clients` | `AdminClients.tsx` |
| Tareas | `/admin/tasks` | `AdminTasks.tsx` |

#### Layout y proteccion de rutas

**AdminLayout.tsx** — Layout con sidebar fijo a la izquierda:
- Logo "Antonela Admin"
- Navegacion con iconos de Bootstrap
- Footer con nombre del admin y boton de cerrar sesion
- El contenido principal se renderiza via `<Outlet />`

**AdminAuthGuard.tsx** — Componente que protege las rutas admin:
- Verifica si hay un token JWT de admin en el contexto
- Si no hay, redirige a `/admin/login`
- Si hay, renderiza el contenido hijo

**AdminLogin.tsx** — Pagina de login:
- Formulario con campos de usuario y contrasena
- Llama a `POST /api/admin/login`
- Guarda el token JWT en `localStorage`
- El placeholder del campo usuario muestra `antonela_admin`

#### Como se estila el admin

- Misma paleta de colores que el frontend publico: variables CSS `--gold`, `--cream`, `--dark`, `--white`
- Tipografia: Cormorant Garamond para titulos, DM Sans para texto
- Tarjetas con bordes suaves, sombras sutiles y bordes redondeados (16px)
- La sidebar tiene fondo blanco con borde derecho dorado
- Los enlaces activos tienen un gradiente dorado de fondo

#### Comunicacion con el backend

Todas las llamadas del admin pasan por `api.ts` — una instancia de Axios que:
- Usa `baseURL` vacia (el proxy de Vite redirige `/api/*` a `http://localhost:8080`)
- Incluye el token JWT del admin en el header `Authorization: Bearer <token>`
- El token se obtiene de `localStorage` (clave `admin_token`)

---

## Diagrama del flujo admin

```
[Admin login] --POST /api/admin/login--> [JWT token]
       |
       v
[AdminLayout + AdminAuthGuard]
       |
       +---> /admin (Dashboard)
       |       GET /api/admin/dashboard
       |       GET /api/admin/dashboard/notifications
       |       POST /api/admin/dashboard/notifications/{id}/read
       |
       +---> /admin/calendar
       |       GET /api/admin/appointments
       |       PUT /api/admin/appointments/{id}/status
       |       PUT /api/admin/appointments/{id}/reschedule
       |
       +---> /admin/services
       |       CRUD /api/admin/services
       |
       +---> /admin/inventory
       |       CRUD /api/admin/products
       |
       +---> /admin/orders
       |       GET /api/admin/orders
       |       PUT /api/admin/orders/{id}/status
       |
       +---> /admin/gallery
       |       CRUD /api/admin/gallery
       |
       +---> /admin/clients
       |       GET /api/admin/clients
       |       GET /api/admin/clients/{id}/appointments
       |       GET /api/admin/clients/{id}/orders
       |
       +---> /admin/tasks
               CRUD /api/admin/tasks
```

## Notas importantes

- Las credenciales de admin estan hardcodeadas en `init.sql` con hash BCrypt
- Si se cambia la contrasena, hay que actualizar el hash en `init.sql` y en `AdminLogin.tsx` (placeholder)
- Las notificaciones del dashboard se crean automaticamente cuando un cliente crea una cita o se confirma un pedido
- El webhook de Stripe tambien genera notificaciones admin cuando un pago se completa
