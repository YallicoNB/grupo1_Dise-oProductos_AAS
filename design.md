# Documento de Diseño: Sistema Antonela Art Salon

## Resumen General

El sistema Antonela Art es una aplicación web full-stack que integra una plataforma pública de comercio electrónico y reservas con un panel administrativo completo para la gestión de un salón de belleza. El sistema está diseñado para ser desarrollado por un equipo de 4 personas, con una arquitectura modular que permite el trabajo paralelo en diferentes componentes.

### Objetivos del Sistema

- Proporcionar una experiencia de usuario elegante y moderna para clientes que exploran servicios y productos
- Facilitar la reserva de citas en línea sin fricción
- Permitir compras de productos de belleza con un carrito de compras intuitivo
- Ofrecer herramientas administrativas completas para gestionar el negocio
- Garantizar persistencia de datos confiable y segura
- Mantener una arquitectura escalable y mantenible

### Stack Tecnológico

- **Frontend**: TypeScript con React
- **Backend**: Java con Spring Boot
- **Base de Datos**: PostgreSQL (nombres de tablas y columnas en español)
- **Autenticación**: JWT (JSON Web Tokens) con Spring Security
- **Estilos**: CSS moderno (CSS Modules, Styled Components, o Tailwind CSS)
- **ORM**: Spring Data JPA / Hibernate

## Arquitectura

### Arquitectura de Alto Nivel

El sistema sigue una arquitectura cliente-servidor de tres capas:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  Public Website      │  │   Admin Panel        │    │
│  │  - Service Catalog   │  │   - Calendar Mgmt    │    │
│  │  - Gallery           │  │   - Price Updates    │    │
│  │  - Shopping Cart     │  │   - Inventory Mgmt   │    │
│  │  - Booking Form      │  │   - Task Management  │    │
│  │  - Client Auth       │  │                      │    │
│  │  - Client Panel      │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
│         TypeScript + React                               │
└─────────────────────────────────────────────────────────┘
                          │
                    HTTPS/REST API
                          │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Java + Spring Boot Server                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │ Booking    │  │ Inventory  │  │   Admin   │  │  │
│  │  │ Module     │  │ Module     │  │   Module  │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │   Auth     │  │   Public   │  │  Client   │  │  │
│  │  │  Module    │  │   Module   │  │  Module   │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  │  ┌────────────┐  ┌────────────┐                 │  │
│  │  │  Payment   │  │  Refund    │                 │  │
│  │  │  Module    │  │  Module    │                 │  │
│  │  └────────────┘  └────────────┘                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                      JPA/Hibernate
                          │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│              PostgreSQL Database                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │servicios │ │productos │ │  citas   │ │  tareas  │  │
│  │          │ │          │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ usuarios │ │ clientes │ │imagenes_ │ │  pagos   │  │
│  │ _admin   │ │          │ │galeria   │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │reembolsos│ │politica_ │ │ tokens_  │               │
│  │          │ │cancelacion│ │recupera- │               │
│  │          │ │          │ │cion_con- │               │
│  │          │ │          │ │ trasena  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Organización de Módulos

El sistema se divide en 6 módulos principales para facilitar el desarrollo en equipo:

1. **Public Frontend Module**: Interfaz pública (catálogo, galería, carrito, formulario de reserva)
2. **Client Module**: Autenticación de clientes, panel de cliente, gestión de perfil
3. **Booking Module**: Lógica de reservas y gestión de calendario
4. **Inventory Module**: Gestión de productos y servicios (precios, disponibilidad)
5. **Admin Module**: Panel administrativo, autenticación, y gestión de tareas
6. **Payment & Refund Module**: SIMULACIÓN de pagos y reembolsos (sin integraciones reales de pago ni costos externos)

### Patrones de Comunicación

- **Frontend ↔ Backend**: REST API con JSON
- **Backend ↔ Database**: JPA/Hibernate con Spring Data
- **Authentication**: JWT tokens en headers HTTP (Authorization: Bearer <token>) con Spring Security
- **State Management**: Frontend mantiene estado local para carrito y formularios usando React Context o Redux

## Componentes e Interfaces

### Componentes Frontend

#### Componentes del Sitio Web Público

**Componente CatalogoServicios**
- **Propósito**: Mostrar todos los servicios disponibles con precios
- **Props**: `servicios: Servicio[]`
- **Estado**: Ninguno (sin estado, recibe datos del backend)
- **Eventos**: Ninguno
- **Renderizado**: Grid layout responsive con cards de servicios

**Componente Galeria**
- **Propósito**: Mostrar galería de imágenes de trabajos realizados
- **Props**: `imagenes: ImagenGaleria[]`
- **Estado**: `imagenSeleccionada: ImagenGaleria | null` (para modal de imagen completa)
- **Eventos**: `alClickImagen(imagen)` - abre modal con imagen en tamaño completo
- **Renderizado**: Grid de imágenes con lightbox modal

**Componente CatalogoProductos**
- **Propósito**: Mostrar productos disponibles para compra
- **Props**: `productos: Producto[]`, `alAgregarAlCarrito: (producto, cantidad) => void`
- **Estado**: Ninguno
- **Eventos**: `alAgregarAlCarrito` - añade producto al carrito
- **Renderizado**: Grid de productos con botón "Añadir al carrito"

**Componente CarritoCompras**
- **Propósito**: Gestionar carrito de compras
- **Props**: `articulosCarrito: ArticuloCarrito[]`, `alActualizarCantidad`, `alEliminarArticulo`
- **Estado**: `estaAbierto: boolean` (para mostrar/ocultar carrito)
- **Eventos**: 
  - `alActualizarCantidad(idProducto, nuevaCantidad)` - actualiza cantidad
  - `alEliminarArticulo(idProducto)` - elimina producto
- **Renderizado**: Sidebar o modal con lista de productos y total

**Componente FormularioReserva**
- **Propósito**: Formulario de reserva de citas
- **Props**: `servicios: Servicio[]`, `alEnviar: (reserva) => Promise<void>`
- **Estado**: 
  - `datosFormulario: { nombre, telefono, idServicio, fecha, hora }`
  - `franjasDisponibles: FranjaHoraria[]`
  - `errores: ErroresValidacion`
- **Eventos**: 
  - `alCambiarFecha(fecha)` - carga franjas disponibles
  - `alEnviar()` - envía reserva al backend
- **Validación**: Campos requeridos, formato de teléfono, fecha futura
- **Renderizado**: Formulario multi-paso con validación en tiempo real

#### Componentes del Panel Administrativo

**Componente FormularioLogin**
- **Propósito**: Autenticación de administrador
- **Props**: `alIniciarSesion: (credenciales) => Promise<void>`
- **Estado**: `{ nombreUsuario, contrasena, error }`
- **Eventos**: `alEnviar()` - envía credenciales
- **Renderizado**: Formulario simple con campos de usuario y contraseña

**Componente VistaCalendario**
- **Propósito**: Visualizar y gestionar citas
- **Props**: `citas: Cita[]`, `alCambiarEstado`, `alCancelar`
- **Estado**: `fechaSeleccionada: Date`, `rangoFiltro: RangoFecha`
- **Eventos**:
  - `alMarcarCompletada(idCita)` - marca cita como completada
  - `alCancelar(idCita)` - cancela cita
  - `alFiltrarFecha(rango)` - filtra por rango de fechas
- **Renderizado**: Vista de calendario con citas organizadas por fecha/hora

**Componente GestorPrecios**
- **Propósito**: Actualizar precios de servicios
- **Props**: `servicios: Servicio[]`, `alActualizarPrecio: (idServicio, nuevoPrecio) => Promise<void>`
- **Estado**: `idServicioEditando: number | null`, `precioTemporal: number`
- **Eventos**: `alGuardar(idServicio, precio)` - guarda nuevo precio
- **Validación**: Precio debe ser número positivo
- **Renderizado**: Lista de servicios con campos editables

**Componente GestorInventario**
- **Propósito**: Gestionar productos (precio y disponibilidad)
- **Props**: `productos: Producto[]`, `alActualizar: (idProducto, actualizaciones) => Promise<void>`
- **Estado**: `idProductoEditando: number | null`
- **Eventos**: 
  - `alActualizarPrecio(idProducto, precio)` - actualiza precio
  - `alCambiarDisponibilidad(idProducto)` - cambia disponibilidad
- **Validación**: Precio positivo
- **Renderizado**: Tabla de productos con controles inline

**Componente ListaTareas**
- **Propósito**: Gestionar tareas administrativas
- **Props**: `tareas: Tarea[]`, `alCrear`, `alCambiarCompletada`, `alEliminar`
- **Estado**: `descripcionNuevaTarea: string`, `filtro: 'todas' | 'pendientes' | 'completadas'`
- **Eventos**:
  - `alCrear(descripcion)` - crea nueva tarea
  - `alCambiarCompletada(idTarea)` - marca como completada/pendiente
  - `alEliminar(idTarea)` - elimina tarea
- **Renderizado**: Lista con separación de tareas pendientes y completadas

#### Componentes de Autenticación de Clientes

**Componente FormularioRegistroCliente**
- **Propósito**: Registro de nuevos clientes
- **Props**: `alRegistrar: (datosCliente) => Promise<void>`
- **Estado**: `{ nombreCompleto, correoElectronico, telefono, contrasena, confirmarContrasena, errores }`
- **Eventos**: `alEnviar()` - envía datos de registro
- **Validación**: Campos requeridos, formato de correo, contraseñas coinciden, teléfono válido
- **Renderizado**: Formulario con validación en tiempo real

**Componente FormularioLoginCliente**
- **Propósito**: Inicio de sesión de clientes
- **Props**: `alIniciarSesion: (credenciales) => Promise<void>`
- **Estado**: `{ correoElectronico, contrasena, error }`
- **Eventos**: `alEnviar()` - envía credenciales
- **Renderizado**: Formulario simple con campos de correo y contraseña

**Componente RutaProtegidaCliente**
- **Propósito**: Proteger rutas que requieren autenticación de cliente
- **Props**: `children: ReactNode`
- **Estado**: `estaAutenticado: boolean`
- **Eventos**: Ninguno
- **Renderizado**: Renderiza children si está autenticado, redirige a login si no

**Componente FormularioRecuperacionContrasena**
- **Propósito**: Solicitar recuperación de contraseña (SIMULADO - muestra enlace en pantalla)
- **Props**: Ninguno
- **Estado**: `{ correoElectronico, enviado, enlaceRestablecimiento, error, cargando }`
- **Eventos**: `alEnviar()` - envía solicitud de recuperación y recibe enlace en respuesta
- **Validación**: Formato de correo válido
- **Renderizado**: Formulario con campo de correo y mensaje mostrando el enlace de restablecimiento generado (en lugar de "revisa tu email")

**Componente FormularioRestablecerContrasena**
- **Propósito**: Restablecer contraseña con token
- **Props**: `token: string` (desde URL params)
- **Estado**: `{ nuevaContrasena, confirmarContrasena, tokenValido, error, cargando }`
- **Eventos**: 
  - `alMontar()` - valida token al cargar componente
  - `alEnviar()` - envía nueva contraseña
- **Validación**: Contraseña mínimo 8 caracteres, contraseñas coinciden, token válido
- **Renderizado**: Formulario con campos de contraseña o mensaje de error si token inválido

#### Componentes del Panel de Cliente

**Componente PanelCliente**
- **Propósito**: Dashboard principal del cliente autenticado
- **Props**: `cliente: Cliente`
- **Estado**: `seccionActiva: 'citas' | 'perfil' | 'historial'`
- **Eventos**: `alCambiarSeccion(seccion)` - cambia la sección activa
- **Renderizado**: Layout con navegación y contenido dinámico

**Componente ListaCitasCliente**
- **Propósito**: Mostrar citas del cliente organizadas por estado
- **Props**: `citas: Cita[]`, `alCancelar: (idCita) => Promise<void>`
- **Estado**: `categoriaActiva: 'activas' | 'historial' | 'canceladas'`
- **Eventos**: 
  - `alCambiarCategoria(categoria)` - cambia la categoría mostrada
  - `alCancelarCita(idCita)` - inicia proceso de cancelación
- **Renderizado**: Tabs con tres categorías, lista de citas con detalles completos

**Componente DetalleCita**
- **Propósito**: Mostrar detalles completos de una cita
- **Props**: `cita: Cita`
- **Estado**: Ninguno
- **Eventos**: Ninguno
- **Renderizado**: Card con servicio, fecha, hora, estado, monto pagado, monto reembolsado

**Componente ModalCancelacionCita**
- **Propósito**: Confirmar cancelación y mostrar monto de reembolso
- **Props**: `cita: Cita`, `montoReembolso: number`, `porcentajeReembolso: number`, `alConfirmar`, `alCancelar`
- **Estado**: `cargando: boolean`
- **Eventos**:
  - `alConfirmar()` - confirma la cancelación
  - `alCancelar()` - cierra el modal sin cancelar
- **Renderizado**: Modal con información de reembolso y botones de confirmación

**Componente PoliticaCancelacion**
- **Propósito**: Mostrar política de cancelación antes del pago
- **Props**: `alAceptar: (aceptado: boolean) => void`
- **Estado**: `aceptado: boolean`
- **Eventos**: `alCambiarCheckbox(valor)` - actualiza estado de aceptación
- **Renderizado**: Texto de política con checkbox obligatorio

**Componente FormularioCheckout**
- **Propósito**: Procesar checkout del carrito de compras
- **Props**: `articulosCarrito: ArticuloCarrito[]`, `alCheckoutExitoso: () => void`
- **Estado**: `{ metodoPago, cargando, error }`
- **Eventos**: 
  - `alSeleccionarMetodoPago(metodo)` - selecciona método de pago
  - `alEnviar()` - procesa checkout llamando a POST /api/cart/checkout
- **Validación**: Método de pago requerido, carrito no vacío
- **Renderizado**: Resumen de productos, total, selector de método de pago, botón "Finalizar compra"

**Componente ConfirmacionCompra**
- **Propósito**: Mostrar confirmación de compra exitosa
- **Props**: `ordenId: string`, `montoTotal: number`
- **Estado**: Ninguno
- **Eventos**: Ninguno
- **Renderizado**: Mensaje de éxito con ID de orden y monto total

**Componente HistorialOrdenes**
- **Propósito**: Mostrar historial de órdenes de compra del cliente
- **Props**: Ninguno
- **Estado**: `{ ordenes, cargando, error }`
- **Eventos**: `alMontar()` - carga órdenes llamando a GET /api/client/orders
- **Renderizado**: Lista de órdenes con detalles (ID, fecha, productos, total)

**Componente EditarPerfil**
- **Propósito**: Permitir al cliente editar su nombre, teléfono y correo electrónico
- **Props**: `cliente: Cliente`, `alActualizar: (datos) => Promise<void>`
- **Estado**: `{ nombreCompleto, telefono, correoElectronico, errores, cargando }`
- **Eventos**: `alEnviar()` - llama a PUT /api/client/profile
- **Validación**: Formato de correo válido, correo único (409 si ya existe)
- **Renderizado**: Formulario con campos pre-cargados del perfil actual, botón "Guardar cambios"

**Componente NotificacionesAdmin**
- **Propósito**: Mostrar notificaciones del sistema en el header del Panel_Admin
- **Props**: Ninguno
- **Estado**: `{ notificaciones, cargando }`
- **Eventos**: 
  - `alMontar()` - carga notificaciones llamando a GET /api/admin/notifications
  - `alMarcarLeida(id)` - llama a PATCH /api/admin/notifications/:id/read
- **Renderizado**: Icono de campana con badge de cantidad no leídas; dropdown con lista de notificaciones al hacer clic

### Backend API Endpoints

#### Public Endpoints (No authentication required)

**GET /api/services**
- **Purpose**: Obtener catálogo de servicios
- **Response**: `{ services: Service[] }`
- **Status Codes**: 200 OK, 500 Internal Server Error

**GET /api/products**
- **Purpose**: Obtener productos disponibles
- **Query Params**: `available=true` (opcional, filtra solo disponibles)
- **Response**: `{ products: Product[] }`
- **Status Codes**: 200 OK, 500 Internal Server Error

**GET /api/gallery**
- **Purpose**: Obtener imágenes de galería
- **Response**: `{ images: GalleryImage[] }`
- **Status Codes**: 200 OK, 500 Internal Server Error

**POST /api/appointments**
- **Purpose**: Crear nueva cita
- **Request Body**: 
  ```json
  {
    "clientName": "string",
    "clientPhone": "string",
    "serviceId": "number",
    "date": "YYYY-MM-DD",
    "time": "HH:MM"
  }
  ```
- **Response**: `{ appointment: Appointment, message: "Cita reservada exitosamente" }`
- **Validation**: Todos los campos requeridos, fecha futura, slot disponible
- **Status Codes**: 201 Created, 400 Bad Request, 409 Conflict (slot no disponible), 500 Internal Server Error

**GET /api/appointments/available-slots**
- **Purpose**: Obtener slots disponibles para una fecha
- **Query Params**: `date=YYYY-MM-DD`, `serviceId=number`
- **Response**: `{ slots: TimeSlot[] }`
- **Status Codes**: 200 OK, 400 Bad Request, 500 Internal Server Error

#### Admin Endpoints (Authentication required)

**POST /api/admin/login**
- **Purpose**: Autenticar administrador
- **Request Body**: `{ username: "string", password: "string" }`
- **Response**: `{ token: "jwt_token", user: { id, username } }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**GET /api/admin/appointments**
- **Purpose**: Obtener todas las citas
- **Query Params**: `startDate`, `endDate` (opcional, para filtrar)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ appointments: Appointment[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**PATCH /api/admin/appointments/:id/status**
- **Purpose**: Actualizar estado de cita
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ status: "completed" | "cancelled" }`
- **Response**: `{ appointment: Appointment }`
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**PUT /api/admin/services/:id/price**
- **Purpose**: Actualizar precio de servicio
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ price: number }`
- **Validation**: Precio debe ser positivo
- **Response**: `{ service: Service }`
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**PUT /api/admin/products/:id**
- **Purpose**: Actualizar producto (precio y/o disponibilidad)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ price?: number, available?: boolean }`
- **Validation**: Si se incluye precio, debe ser positivo
- **Response**: `{ product: Product }`
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**GET /api/admin/tasks**
- **Purpose**: Obtener todas las tareas
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status=pending|completed` (opcional)
- **Response**: `{ tasks: Task[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**POST /api/admin/tasks**
- **Purpose**: Crear nueva tarea
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ description: "string" }`
- **Response**: `{ task: Task }`
- **Status Codes**: 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

**PATCH /api/admin/tasks/:id**
- **Purpose**: Actualizar estado de tarea
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ completed: boolean }`
- **Response**: `{ task: Task }`
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**DELETE /api/admin/tasks/:id**
- **Purpose**: Eliminar tarea
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Tarea eliminada" }`
- **Status Codes**: 200 OK, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**GET /api/admin/notifications**
- **Purpose**: Obtener notificaciones del panel admin
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `leida=true|false` (opcional)
- **Response**: `{ notificaciones: Notificacion[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**PATCH /api/admin/notifications/:id/read**
- **Purpose**: Marcar notificación como leída
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ mensaje: "Notificación marcada como leída" }`
- **Status Codes**: 200 OK, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### Client Authentication Endpoints

**POST /api/client/register**
- **Purpose**: Registrar nuevo cliente
- **Request Body**: 
  ```json
  {
    "nombreCompleto": "string",
    "correoElectronico": "string",
    "telefono": "string",
    "contrasena": "string"
  }
  ```
- **Validation**: Todos los campos requeridos, correo único, formato de correo válido, contraseña mínimo 8 caracteres
- **Response**: `{ token: "jwt_token", cliente: { id, nombreCompleto, correoElectronico, telefono } }`
- **Status Codes**: 201 Created, 400 Bad Request (validación), 409 Conflict (correo ya existe), 500 Internal Server Error

**POST /api/client/login**
- **Purpose**: Autenticar cliente
- **Request Body**: `{ correoElectronico: "string", contrasena: "string" }`
- **Response**: `{ token: "jwt_token", cliente: { id, nombreCompleto, correoElectronico, telefono } }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**POST /api/client/logout**
- **Purpose**: Cerrar sesión de cliente (opcional, invalida token)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Sesión cerrada exitosamente" }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**POST /api/client/forgot-password**
- **Purpose**: Solicitar recuperación de contraseña (SIMULADO - sin envío real de email)
- **Request Body**: `{ correoElectronico: "string" }`
- **Response**: `{ message: "Si el correo existe, recibirás un enlace de recuperación", enlaceRestablecimiento: "http://localhost:3000/reset-password?token=abc-123-def" }`
- **Status Codes**: 200 OK (siempre, por seguridad), 500 Internal Server Error
- **Side Effects**: 
  - Si el correo existe, genera token único con expiración de 1 hora
  - Almacena token en tabla tokens_recuperacion_contrasena
  - MUESTRA el enlace de restablecimiento EN LA RESPUESTA JSON (en lugar de enviarlo por email)
  - Registra el enlace en los logs del servidor
  - NOTA: En un entorno real esto se enviaría por email, pero en este proyecto es simulado para evitar costos

**GET /api/client/validate-reset-token**
- **Purpose**: Validar si un token de recuperación es válido
- **Query Params**: `token=string`
- **Response**: `{ valido: boolean, mensaje?: "string" }`
- **Status Codes**: 200 OK, 400 Bad Request
- **Validation**: Token existe, no ha expirado, no ha sido usado

**POST /api/client/reset-password**
- **Purpose**: Restablecer contraseña con token válido
- **Request Body**: `{ token: "string", nuevaContrasena: "string" }`
- **Validation**: Token válido, contraseña mínimo 8 caracteres
- **Response**: `{ message: "Contraseña restablecida exitosamente" }`
- **Status Codes**: 200 OK, 400 Bad Request (token inválido/expirado), 500 Internal Server Error
- **Side Effects**:
  - Actualiza contraseña con hash BCrypt
  - Marca token como usado
  - MUESTRA mensaje en pantalla confirmando el cambio Y registra la confirmación en los logs del servidor (sin envío real de email)
  - Invalida todas las sesiones activas del cliente

#### Client Panel Endpoints (Authentication required)

**GET /api/client/appointments**
- **Purpose**: Obtener todas las citas del cliente autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `estado=pendiente|completada|cancelada` (opcional)
- **Response**: `{ citas: Cita[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**GET /api/client/appointments/:id**
- **Purpose**: Obtener detalles de una cita específica del cliente
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ cita: Cita }`
- **Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden (cita no pertenece al cliente), 404 Not Found, 500 Internal Server Error

**GET /api/client/profile**
- **Purpose**: Obtener perfil del cliente autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ cliente: Cliente }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**PUT /api/client/profile**
- **Purpose**: Actualizar perfil del cliente autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: 
  ```json
  {
    "nombreCompleto": "string (opcional)",
    "telefono": "string (opcional)",
    "correoElectronico": "string (opcional)"
  }
  ```
- **Validation**: Si se incluye correoElectronico, debe ser único (no registrado por otro cliente)
- **Response**: `{ cliente: Cliente, mensaje: "Perfil actualizado exitosamente" }`
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 409 Conflict (correo ya registrado), 500 Internal Server Error

#### Cancellation & Refund Endpoints (Authentication required)

**GET /api/cancellation/policy**
- **Purpose**: Obtener política de cancelación actual
- **Response**: `{ politicas: PoliticaCancelacion[] }`
- **Status Codes**: 200 OK, 500 Internal Server Error

**POST /api/cancellation/calculate-refund**
- **Purpose**: Calcular monto de reembolso para una cita
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ idCita: number }`
- **Response**: 
  ```json
  {
    "porcentaje": 100,
    "monto": 50.00,
    "horasRestantes": 48,
    "descripcion": "Cancelación con 24 horas o más de anticipación - Reembolso completo"
  }
  ```
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

**POST /api/cancellation/cancel-appointment**
- **Purpose**: Cancelar cita y SIMULAR procesamiento de reembolso automático (sin procesamiento real de reembolso)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ idCita: number }`
- **Response**: 
  ```json
  {
    "exitoso": true,
    "cita": { ...citaCancelada },
    "reembolso": { ...detallesReembolso },
    "mensaje": "Cita cancelada exitosamente. Reembolso procesado (simulado)."
  }
  ```
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
- **Side Effects**: 
  - Actualiza estado de cita a 'cancelada'
  - Crea registro de reembolso con estado 'procesado (simulado)' y ID de transacción simulado (formato: SIM-{timestamp}-{random})
  - SIMULA reembolso (solo actualiza base de datos, sin procesamiento real)
  - MUESTRA mensaje en pantalla (toast/alert) con detalles del reembolso Y registra la confirmación en los logs del servidor (sin envío real de email)
  - Si el proceso falla, registra el error en los logs del servidor Y muestra notificación visual en el Panel_Admin (sin envío de email al admin)

**GET /api/refund/status/:idReembolso**
- **Purpose**: Consultar estado de un reembolso
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ reembolso: Reembolso }`
- **Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### Payment Endpoints (Authentication required)

**POST /api/payment/process**
- **Purpose**: SIMULAR procesamiento de pago de una cita (sin integración real de pago)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: 
  ```json
  {
    "idCita": number,
    "monto": number,
    "metodoPago": "efectivo" | "simulado_credito",
    "aceptaPoliticaCancelacion": boolean
  }
  ```
- **Validation**: aceptaPoliticaCancelacion debe ser true, metodoPago solo acepta "efectivo" o "simulado_credito"
- **Response**: `{ pago: Pago, mensaje: "Pago procesado exitosamente (simulado)" }`
- **Side Effects**: Genera ID de transacción simulado con formato SIM-{timestamp}-{random}
- **Status Codes**: 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

**GET /api/payment/history**
- **Purpose**: Obtener historial de pagos del cliente
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ pagos: Pago[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

**POST /api/cart/checkout**
- **Purpose**: Procesar checkout del carrito de compras (SIMULADO - sin integración real de pago)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: 
  ```json
  {
    "metodoPago": "efectivo" | "simulado_credito"
  }
  ```
- **Validation**: metodoPago solo acepta "efectivo" o "simulado_credito", carrito no puede estar vacío
- **Response**: `{ resultado: ResultadoCheckout }`
- **Side Effects**: 
  - Genera ID de orden con formato ORD-{timestamp}-{random}
  - Genera ID de transacción simulado con formato SIM-{timestamp}-{random}
  - Crea registro en tabla ordenes_compra con productos como JSONB
  - Vacía el carrito del cliente
- **Status Codes**: 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

**GET /api/client/orders**
- **Purpose**: Obtener historial de órdenes de compra del cliente
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ ordenes: OrdenCompra[] }`
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

### Servicios Backend (Spring Boot)

**ServicioAutenticacionAdmin**
- **Métodos**:
  - `iniciarSesionAdmin(nombreUsuario: String, contrasena: String): TokenRespuesta` - Valida credenciales de admin y genera JWT
  - `verificarToken(token: String): Usuario` - Verifica y decodifica JWT
  - `encriptarContrasena(contrasena: String): String` - Hash de contraseña con BCrypt
  - `compararContrasena(textoPlano: String, encriptada: String): boolean` - Compara contraseñas

**ServicioAutenticacionCliente**
- **Métodos**:
  - `registrarCliente(datosCliente: DatosRegistroCliente): Cliente` - Registra nuevo cliente
  - `iniciarSesionCliente(correo: String, contrasena: String): TokenRespuesta` - Valida credenciales de cliente y genera JWT
  - `verificarTokenCliente(token: String): Cliente` - Verifica y decodifica JWT de cliente
  - `validarCorreoUnico(correo: String): boolean` - Verifica que el correo no esté registrado
  - `cerrarSesion(token: String): void` - Invalida token (opcional, con blacklist)
  - `solicitarRecuperacionContrasena(correo: String): String` - Genera token de recuperación y RETORNA el enlace de restablecimiento (en lugar de enviarlo por email). También registra el enlace en logs del servidor.
  - `validarTokenRecuperacion(token: String): boolean` - Verifica si token es válido (existe, no expirado, no usado)
  - `restablecerContrasena(token: String, nuevaContrasena: String): void` - Actualiza contraseña y marca token como usado
  - `generarTokenRecuperacion(cliente: Cliente): String` - Genera token único y seguro con UUID
  - `registrarEnlaceRecuperacion(correo: String, token: String): void` - Registra el enlace de restablecimiento en los logs del servidor (SIMULACIÓN de envío de email)
  - `registrarConfirmacionCambio(correo: String): void` - Registra confirmación de cambio de contraseña en los logs del servidor (SIMULACIÓN de envío de email)
  - `actualizarPerfil(idCliente: Long, datos: ActualizacionPerfilDTO): Cliente` - Actualiza nombre, teléfono y/o correo del cliente; valida que el nuevo correo no esté registrado por otro cliente

**ServicioNotificacionesAdmin**
- **Métodos**:
  - `crearNotificacion(mensaje: String, tipo: String): Notificacion` - Crea una nueva notificación para el admin
  - `obtenerNotificaciones(soloNoLeidas: boolean): List<Notificacion>` - Obtiene notificaciones del admin
  - `marcarComoLeida(id: Long): void` - Marca una notificación como leída

**ServicioReservas**
- **Métodos**:
  - `crearCita(idCliente: Long, datosCita: DatosCita): Cita` - Crea nueva cita asociada al cliente
  - `obtenerFranjasDisponibles(fecha: LocalDate, idServicio: Long): List<FranjaHoraria>` - Calcula franjas disponibles
  - `obtenerCitasCliente(idCliente: Long): List<Cita>` - Obtiene todas las citas de un cliente
  - `obtenerCitasPorEstado(idCliente: Long, estado: EstadoCita): List<Cita>` - Filtra citas por estado
  - `actualizarEstadoCita(idCita: Long, estado: EstadoCita): Cita` - Actualiza estado
  - `estaFranjaDisponible(fecha: LocalDate, hora: LocalTime): boolean` - Verifica disponibilidad

**ServicioCancelacion**
- **Métodos**:
  - `calcularMontoReembolso(idCita: Long): MontoReembolso` - Calcula reembolso según política
  - `cancelarCita(idCita: Long, idCliente: Long): ResultadoCancelacion` - Cancela cita y procesa reembolso
  - `obtenerPoliticaCancelacion(): PoliticaCancelacion` - Retorna política actual
  - `validarTiempoAnticipacion(fechaCita: LocalDateTime): TipoReembolso` - Determina tipo de reembolso
  - `registrarCancelacion(idCita: Long, montoReembolsado: BigDecimal): void` - Registra cancelación en auditoría

**ServicioReembolso**
- **Métodos**:
  - `procesarReembolso(idPago: Long, monto: BigDecimal): ResultadoReembolso` - SIMULA procesamiento de reembolso (solo actualiza base de datos con ID de transacción simulado, sin procesamiento real)
  - `verificarEstadoReembolso(idReembolso: Long): EstadoReembolso` - Consulta estado del reembolso
  - `notificarErrorReembolso(idCita: Long, error: String): void` - Registra error en logs del servidor Y crea notificación en tabla notificaciones_admin para mostrar en Panel_Admin (sin envío de email)
  - `mostrarConfirmacionReembolso(idCliente: Long, detalles: DetallesReembolso): void` - Muestra mensaje en pantalla (toast/alert) Y registra en logs del servidor (sin envío de email)
  - `generarIdTransaccionSimulado(): String` - Genera ID único para transacción de reembolso simulada

**ServicioInventario**
- **Métodos**:
  - `obtenerServicios(): List<Servicio>` - Obtiene todos los servicios
  - `actualizarPrecioServicio(id: Long, precio: BigDecimal): Servicio` - Actualiza precio de servicio
  - `obtenerProductos(soloDisponibles: boolean): List<Producto>` - Obtiene productos
  - `actualizarProducto(id: Long, actualizaciones: ActualizacionProducto): Producto` - Actualiza producto

**ServicioTareas**
- **Métodos**:
  - `obtenerTareas(estado: EstadoTarea): List<Tarea>` - Obtiene tareas filtradas
  - `crearTarea(descripcion: String): Tarea` - Crea nueva tarea
  - `actualizarEstadoTarea(id: Long, completada: boolean): Tarea` - Actualiza estado
  - `eliminarTarea(id: Long): void` - Elimina tarea

**ServicioGaleria**
- **Métodos**:
  - `obtenerImagenes(): List<ImagenGaleria>` - Obtiene imágenes de galería
  - `subirImagen(archivo: MultipartFile, categoria: String): ImagenGaleria` - Sube nueva imagen

**ServicioPago**
- **Métodos**:
  - `procesarPago(idCliente: Long, montoPago: BigDecimal, metodoPago: MetodoPago): ResultadoPago` - SIMULA procesamiento de pago (genera ID de transacción simulado con formato SIM-{timestamp}-{random}, sin integración real de pago)
  - `registrarPago(idCita: Long, idPagoSimulado: String, monto: BigDecimal): Pago` - Registra pago simulado en BD
  - `obtenerHistorialPagos(idCliente: Long): List<Pago>` - Obtiene historial de pagos del cliente
  - `generarIdTransaccionSimulado(): String` - Genera ID único para transacción simulada

**ServicioCheckout**
- **Métodos**:
  - `procesarCheckout(idCliente: Long, items: List<ItemCarrito>, metodoPago: String): ResultadoCheckout` - SIMULA procesamiento de checkout (genera IDs simulados, sin integración real de pago)
  - `obtenerHistorialOrdenes(idCliente: Long): List<OrdenCompra>` - Obtiene historial de órdenes del cliente
  - `generarIdTransaccionSimulado(): String` - Genera ID único para transacción simulada (formato: SIM-{timestamp}-{random})
  - `generarIdOrden(): String` - Genera ID único para orden (formato: ORD-{timestamp}-{random})

## Modelos de Datos

### Esquema de Base de Datos

#### Tabla servicios
```sql
CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio_minimo DECIMAL(10, 2) NOT NULL,
  precio_maximo DECIMAL(10, 2),
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `nombre`: Nombre del servicio (ej: "Planchado", "Laminado")
- `precio_minimo`: Precio mínimo del servicio
- `precio_maximo`: Precio máximo (opcional, para rangos de precio)
- `descripcion`: Descripción del servicio
- `creado_en`, `actualizado_en`: Timestamps de auditoría

#### Tabla productos
```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  url_imagen VARCHAR(500),
  disponible BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `nombre`: Nombre del producto
- `descripcion`: Descripción del producto
- `precio`: Precio actual
- `url_imagen`: URL de la imagen del producto
- `disponible`: Indica si está disponible para compra
- `creado_en`, `actualizado_en`: Timestamps de auditoría

#### Tabla clientes
```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(200) NOT NULL,
  correo_electronico VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  version_contrasena INTEGER DEFAULT 1 NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `nombre_completo`: Nombre completo del cliente
- `correo_electronico`: Correo electrónico único para autenticación
- `telefono`: Número de teléfono de contacto
- `contrasena_hash`: Hash bcrypt de la contraseña
- `version_contrasena`: Versión de contraseña, se incrementa en cada cambio para invalidar todos los tokens JWT activos
- `creado_en`, `actualizado_en`: Timestamps de auditoría

#### Tabla citas
```sql
CREATE TABLE citas (
  id SERIAL PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES clientes(id),
  id_servicio INTEGER NOT NULL REFERENCES servicios(id),
  fecha_cita DATE NOT NULL,
  hora_cita TIME NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  monto_pagado DECIMAL(10, 2),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cita_unica UNIQUE (fecha_cita, hora_cita)
);
```

**Campos**:
- `id`: Identificador único
- `id_cliente`: Referencia al cliente autenticado que reservó la cita
- `id_servicio`: Referencia al servicio reservado
- `fecha_cita`: Fecha de la cita
- `hora_cita`: Hora de la cita
- `estado`: Estado ('pendiente', 'completada', 'cancelada')
- `monto_pagado`: Monto pagado por la cita
- `creado_en`, `actualizado_en`: Timestamps de auditoría
- **Constraint**: `cita_unica` previene doble reserva del mismo slot

#### Tabla pagos
```sql
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  id_cita BIGINT NOT NULL REFERENCES citas(id),
  id_cliente BIGINT NOT NULL REFERENCES clientes(id),
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  id_transaccion_simulada VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'completado',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `id_cita`: Referencia a la cita pagada
- `id_cliente`: Referencia al cliente que realizó el pago
- `monto`: Monto pagado
- `metodo_pago`: Método de pago utilizado (solo "efectivo" o "simulado_credito")
- `id_transaccion_simulada`: ID de transacción simulado (formato: SIM-{timestamp}-{random})
- `estado`: Estado del pago ('completado', 'fallido', 'reembolsado')
- `creado_en`: Timestamp de creación

#### Tabla reembolsos
```sql
CREATE TABLE reembolsos (
  id SERIAL PRIMARY KEY,
  id_cita BIGINT NOT NULL REFERENCES citas(id),
  id_pago BIGINT NOT NULL REFERENCES pagos(id),
  monto_reembolsado DECIMAL(10, 2) NOT NULL,
  porcentaje_reembolso INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'procesando',
  id_transaccion_simulada VARCHAR(255),
  mensaje_error TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  procesado_en TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `id_cita`: Referencia a la cita cancelada
- `id_pago`: Referencia al pago original
- `monto_reembolsado`: Monto reembolsado al cliente
- `porcentaje_reembolso`: Porcentaje aplicado (100, 50, o 0)
- `estado`: Estado del reembolso ('procesando', 'completado', 'fallido')
- `id_transaccion_simulada`: ID de transacción simulado del reembolso (formato: SIM-{timestamp}-{random})
- `mensaje_error`: Mensaje de error si el reembolso falló
- `creado_en`: Timestamp de creación
- `procesado_en`: Timestamp de procesamiento exitoso

#### Tabla politica_cancelacion
```sql
CREATE TABLE politica_cancelacion (
  id SERIAL PRIMARY KEY,
  horas_anticipacion_minimas INTEGER NOT NULL,
  porcentaje_reembolso INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  activa BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `horas_anticipacion_minimas`: Horas mínimas de anticipación para este nivel de reembolso
- `porcentaje_reembolso`: Porcentaje de reembolso (100, 50, 0)
- `descripcion`: Descripción de la regla
- `activa`: Indica si la regla está activa
- `creado_en`: Timestamp de creación

**Datos iniciales**:
```sql
INSERT INTO politica_cancelacion (horas_anticipacion_minimas, porcentaje_reembolso, descripcion) VALUES
  (24, 100, 'Cancelación con 24 horas o más de anticipación - Reembolso completo'),
  (1, 50, 'Cancelación con menos de 24 horas pero más de 1 hora - Reembolso del 50%'),
  (0, 0, 'Cancelación el mismo día o inasistencia - Sin reembolso');
```

#### Tabla tareas
```sql
CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  completada BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `descripcion`: Descripción de la tarea
- `completada`: Indica si está completada
- `creado_en`, `actualizado_en`: Timestamps de auditoría

#### Tabla usuarios_admin
```sql
CREATE TABLE usuarios_admin (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `nombre_usuario`: Nombre de usuario único
- `contrasena_hash`: Hash bcrypt de la contraseña
- `rol`: Rol del usuario (por ahora solo 'admin')
- `creado_en`: Timestamp de creación

#### Tabla imagenes_galeria
```sql
CREATE TABLE imagenes_galeria (
  id SERIAL PRIMARY KEY,
  url_imagen VARCHAR(500) NOT NULL,
  categoria VARCHAR(100),
  id_servicio INTEGER REFERENCES servicios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `url_imagen`: URL de la imagen
- `categoria`: Categoría de la imagen (opcional)
- `id_servicio`: Referencia al servicio relacionado (opcional)
- `creado_en`: Timestamp de creación

#### Tabla tokens_recuperacion_contrasena
```sql
CREATE TABLE tokens_recuperacion_contrasena (
  id SERIAL PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES clientes(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expira_en TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `id_cliente`: Referencia al cliente que solicitó la recuperación
- `token`: Token único y seguro para validar la solicitud
- `expira_en`: Timestamp de expiración del token (1 hora después de creación)
- `usado`: Indica si el token ya fue utilizado
- `creado_en`: Timestamp de creación

#### Tabla ordenes_compra
```sql
CREATE TABLE ordenes_compra (
  id SERIAL PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES clientes(id),
  productos JSONB NOT NULL,
  monto_total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  id_transaccion_simulada VARCHAR(255) NOT NULL,
  estado VARCHAR(20) DEFAULT 'completada',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único de la orden
- `id_cliente`: Referencia al cliente que realizó la compra
- `productos`: Array JSON con los productos comprados: `[{id, nombre, cantidad, precio_unitario, subtotal}]`
- `monto_total`: Monto total de la compra
- `metodo_pago`: Método de pago ("efectivo" o "simulado_credito")
- `id_transaccion_simulada`: ID de transacción simulado (formato: SIM-{timestamp}-{random})
- `estado`: Estado de la orden ("completada", "cancelada")
- `creado_en`: Timestamp de creación

#### Tabla notificaciones_admin
```sql
CREATE TABLE notificaciones_admin (
  id SERIAL PRIMARY KEY,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  leida BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: Identificador único
- `mensaje`: Texto de la notificación
- `tipo`: Tipo de notificación ('error', 'warning', 'info', 'success')
- `leida`: Indica si la notificación fue leída por el admin
- `creado_en`: Timestamp de creación

### Interfaces TypeScript/JavaScript

```typescript
interface Servicio {
  id: number;
  nombre: string;
  precioMinimo: number;
  precioMaximo?: number;
  descripcion?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  disponible: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface Cita {
  id: number;
  nombreCliente: string;
  telefonoCliente: string;
  idServicio: number;
  fechaCita: string; // YYYY-MM-DD
  horaCita: string; // HH:MM
  estado: 'pendiente' | 'completada' | 'cancelada';
  creadoEn: Date;
  actualizadoEn: Date;
}

interface Tarea {
  id: number;
  descripcion: string;
  completada: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface Usuario {
  id: number;
  nombreUsuario: string;
  rol: string;
  creadoEn: Date;
}

interface ImagenGaleria {
  id: number;
  urlImagen: string;
  categoria?: string;
  idServicio?: number;
  creadoEn: Date;
}

interface ArticuloCarrito {
  producto: Producto;
  cantidad: number;
}

interface FranjaHoraria {
  hora: string; // HH:MM
  disponible: boolean;
}

interface DatosFormularioReserva {
  nombreCliente: string;
  telefonoCliente: string;
  idServicio: number;
  fecha: string;
  hora: string;
}

interface Cliente {
  id: number;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface ActualizacionPerfil {
  nombreCompleto?: string;
  telefono?: string;
  correoElectronico?: string;
}

interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
  leida: boolean;
  creadoEn: Date;
}

interface DatosRegistroCliente {
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  contrasena: string;
}

interface Pago {
  id: number;
  idCita: number;
  idCliente: number;
  monto: number;
  metodoPago: 'efectivo' | 'simulado_credito';
  idTransaccionSimulada?: string;
  estado: 'completado' | 'fallido' | 'reembolsado';
  creadoEn: Date;
}

interface Reembolso {
  id: number;
  idCita: number;
  idPago: number;
  montoReembolsado: number;
  porcentajeReembolso: number;
  estado: 'procesando' | 'completado' | 'fallido';
  idTransaccionSimulada?: string;
  mensajeError?: string;
  creadoEn: Date;
  procesadoEn?: Date;
}

interface PoliticaCancelacion {
  id: number;
  horasAnticipacionMinimas: number;
  porcentajeReembolso: number;
  descripcion: string;
  activa: boolean;
  creadoEn: Date;
}

interface MontoReembolso {
  porcentaje: number;
  monto: number;
  horasRestantes: number;
}

interface ResultadoCancelacion {
  exitoso: boolean;
  cita: Cita;
  reembolso?: Reembolso;
  error?: string;
}

interface TokenRecuperacionContrasena {
  id: number;
  idCliente: number;
  token: string;
  expiraEn: Date;
  usado: boolean;
  creadoEn: Date;
}

interface SolicitudRecuperacionContrasena {
  correoElectronico: string;
}

interface RestablecimientoContrasena {
  token: string;
  nuevaContrasena: string;
}

interface ValidacionToken {
  valido: boolean;
  mensaje?: string;
}

interface OrdenCompra {
  id: number;
  idCliente: number;
  productos: ItemOrden[];
  montoTotal: number;
  metodoPago: 'efectivo' | 'simulado_credito';
  idTransaccionSimulada: string;
  estado: 'completada' | 'cancelada';
  creadoEn: Date;
}

interface ItemOrden {
  id: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface ResultadoCheckout {
  ordenId: string;
  idTransaccionSimulada: string;
  montoTotal: number;
  mensaje: string;
}
```

### Entidades Java (Spring Boot)

```java
// Entidad Servicio
@Entity
@Table(name = "servicios")
public class Servicio {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false, length = 100)
  private String nombre;
  
  @Column(name = "precio_minimo", nullable = false, precision = 10, scale = 2)
  private BigDecimal precioMinimo;
  
  @Column(name = "precio_maximo", precision = 10, scale = 2)
  private BigDecimal precioMaximo;
  
  @Column(columnDefinition = "TEXT")
  private String descripcion;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "actualizado_en")
  @UpdateTimestamp
  private LocalDateTime actualizadoEn;
  
  // Getters, setters, constructores
}

// Entidad Producto
@Entity
@Table(name = "productos")
public class Producto {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false, length = 200)
  private String nombre;
  
  @Column(columnDefinition = "TEXT")
  private String descripcion;
  
  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal precio;
  
  @Column(name = "url_imagen", length = 500)
  private String urlImagen;
  
  @Column(nullable = false)
  private Boolean disponible = true;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "actualizado_en")
  @UpdateTimestamp
  private LocalDateTime actualizadoEn;
  
  // Getters, setters, constructores
}

// Entidad Cliente
@Entity
@Table(name = "clientes")
public class Cliente {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(name = "nombre_completo", nullable = false, length = 200)
  private String nombreCompleto;
  
  @Column(name = "correo_electronico", nullable = false, unique = true, length = 255)
  private String correoElectronico;
  
  @Column(nullable = false, length = 20)
  private String telefono;
  
  @Column(name = "contrasena_hash", nullable = false, length = 255)
  private String contrasenaHash;
  
  @Column(name = "version_contrasena", nullable = false)
  private Integer versionContrasena = 1;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "actualizado_en")
  @UpdateTimestamp
  private LocalDateTime actualizadoEn;
  
  public void incrementarVersionContrasena() {
    this.versionContrasena++;
  }
  
  // Getters, setters, constructores
}

// Entidad Cita
@Entity
@Table(name = "citas", uniqueConstraints = {
  @UniqueConstraint(name = "cita_unica", columnNames = {"fecha_cita", "hora_cita"})
})
public class Cita {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_servicio", nullable = false)
  private Servicio servicio;
  
  @Column(name = "fecha_cita", nullable = false)
  private LocalDate fechaCita;
  
  @Column(name = "hora_cita", nullable = false)
  private LocalTime horaCita;
  
  @Column(length = 20, nullable = false)
  @Enumerated(EnumType.STRING)
  private EstadoCita estado = EstadoCita.PENDIENTE;
  
  @Column(name = "monto_pagado", precision = 10, scale = 2)
  private BigDecimal montoPagado;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "actualizado_en")
  @UpdateTimestamp
  private LocalDateTime actualizadoEn;
  
  // Getters, setters, constructores
}

// Enum EstadoCita
public enum EstadoCita {
  PENDIENTE,
  COMPLETADA,
  CANCELADA
}

// Entidad Pago
@Entity
@Table(name = "pagos")
public class Pago {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cita", nullable = false)
  private Cita cita;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;
  
  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal monto;
  
  @Column(name = "metodo_pago", nullable = false, length = 50)
  private String metodoPago;
  
  @Column(name = "id_transaccion_simulada", length = 255)
  private String idTransaccionSimulada;
  
  @Column(length = 20, nullable = false)
  @Enumerated(EnumType.STRING)
  private EstadoPago estado = EstadoPago.COMPLETADO;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Enum EstadoPago
public enum EstadoPago {
  COMPLETADO,
  FALLIDO,
  REEMBOLSADO
}

// Entidad Reembolso
@Entity
@Table(name = "reembolsos")
public class Reembolso {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cita", nullable = false)
  private Cita cita;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_pago", nullable = false)
  private Pago pago;
  
  @Column(name = "monto_reembolsado", nullable = false, precision = 10, scale = 2)
  private BigDecimal montoReembolsado;
  
  @Column(name = "porcentaje_reembolso", nullable = false)
  private Integer porcentajeReembolso;
  
  @Column(length = 20, nullable = false)
  @Enumerated(EnumType.STRING)
  private EstadoReembolso estado = EstadoReembolso.PROCESANDO;
  
  @Column(name = "id_transaccion_simulada", length = 255)
  private String idTransaccionSimulada;
  
  @Column(name = "mensaje_error", columnDefinition = "TEXT")
  private String mensajeError;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "procesado_en")
  private LocalDateTime procesadoEn;
  
  // Getters, setters, constructores
}

// Enum EstadoReembolso
public enum EstadoReembolso {
  PROCESANDO,
  COMPLETADO,
  FALLIDO
}

// Entidad PoliticaCancelacion
@Entity
@Table(name = "politica_cancelacion")
public class PoliticaCancelacion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(name = "horas_anticipacion_minimas", nullable = false)
  private Integer horasAnticipacionMinimas;
  
  @Column(name = "porcentaje_reembolso", nullable = false)
  private Integer porcentajeReembolso;
  
  @Column(nullable = false, columnDefinition = "TEXT")
  private String descripcion;
  
  @Column(nullable = false)
  private Boolean activa = true;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Entidad Tarea
@Entity
@Table(name = "tareas")
public class Tarea {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false, columnDefinition = "TEXT")
  private String descripcion;
  
  @Column(nullable = false)
  private Boolean completada = false;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  @Column(name = "actualizado_en")
  @UpdateTimestamp
  private LocalDateTime actualizadoEn;
  
  // Getters, setters, constructores
}

// Entidad UsuarioAdmin
@Entity
@Table(name = "usuarios_admin")
public class UsuarioAdmin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
  private String nombreUsuario;
  
  @Column(name = "contrasena_hash", nullable = false, length = 255)
  private String contrasenaHash;
  
  @Column(length = 20, nullable = false)
  private String rol = "admin";
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Entidad ImagenGaleria
@Entity
@Table(name = "imagenes_galeria")
public class ImagenGaleria {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(name = "url_imagen", nullable = false, length = 500)
  private String urlImagen;
  
  @Column(length = 100)
  private String categoria;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_servicio")
  private Servicio servicio;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Entidad TokenRecuperacionContrasena
@Entity
@Table(name = "tokens_recuperacion_contrasena")
public class TokenRecuperacionContrasena {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;
  
  @Column(nullable = false, unique = true, length = 255)
  private String token;
  
  @Column(name = "expira_en", nullable = false)
  private LocalDateTime expiraEn;
  
  @Column(nullable = false)
  private Boolean usado = false;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Entidad OrdenCompra
@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;
  
  @Column(columnDefinition = "JSONB", nullable = false)
  private String productos; // Almacenar como JSON string
  
  @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
  private BigDecimal montoTotal;
  
  @Column(name = "metodo_pago", nullable = false, length = 50)
  private String metodoPago;
  
  @Column(name = "id_transaccion_simulada", nullable = false, length = 255)
  private String idTransaccionSimulada;
  
  @Column(length = 20, nullable = false)
  private String estado = "completada";
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}

// Entidad NotificacionAdmin
@Entity
@Table(name = "notificaciones_admin")
public class NotificacionAdmin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false, columnDefinition = "TEXT")
  private String mensaje;
  
  @Column(nullable = false, length = 20)
  private String tipo; // 'error', 'warning', 'info', 'success'
  
  @Column(nullable = false)
  private Boolean leida = false;
  
  @Column(name = "creado_en", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime creadoEn;
  
  // Getters, setters, constructores
}
```

### DTOs (Data Transfer Objects)

```java
// DTO para registro de cliente
public class DatosRegistroClienteDTO {
  @NotBlank(message = "El nombre completo es requerido")
  @Size(max = 200)
  private String nombreCompleto;
  
  @NotBlank(message = "El correo electrónico es requerido")
  @Email(message = "Formato de correo inválido")
  @Size(max = 255)
  private String correoElectronico;
  
  @NotBlank(message = "El teléfono es requerido")
  @Pattern(regexp = "^[0-9]{7,20}$", message = "Formato de teléfono inválido")
  private String telefono;
  
  @NotBlank(message = "La contraseña es requerida")
  @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
  private String contrasena;
  
  // Getters, setters
}

// DTO para login de cliente
public class CredencialesClienteDTO {
  @NotBlank(message = "El correo electrónico es requerido")
  @Email(message = "Formato de correo inválido")
  private String correoElectronico;
  
  @NotBlank(message = "La contraseña es requerida")
  private String contrasena;
  
  // Getters, setters
}

// DTO para respuesta de autenticación
public class TokenRespuestaDTO {
  private String token;
  private String tipo = "Bearer";
  private Long idUsuario;
  private String nombreUsuario;
  
  // Getters, setters, constructores
}

// DTO para crear cita
public class DatosCitaDTO {
  @NotNull(message = "El servicio es requerido")
  private Long idServicio;
  
  @NotNull(message = "La fecha es requerida")
  @Future(message = "La fecha debe ser futura")
  private LocalDate fechaCita;
  
  @NotNull(message = "La hora es requerida")
  private LocalTime horaCita;
  
  // Getters, setters
}

// DTO para monto de reembolso
public class MontoReembolsoDTO {
  private Integer porcentaje;
  private BigDecimal monto;
  private Long horasRestantes;
  private String descripcion;
  
  // Getters, setters, constructores
}

// DTO para resultado de cancelación
public class ResultadoCancelacionDTO {
  private Boolean exitoso;
  private CitaDTO cita;
  private ReembolsoDTO reembolso;
  private String mensaje;
  private String error;
  
  // Getters, setters, constructores
}

// DTO para actualización de producto
public class ActualizacionProductoDTO {
  @Positive(message = "El precio debe ser positivo")
  private BigDecimal precio;
  
  private Boolean disponible;
  
  // Getters, setters
}

// DTO para solicitud de recuperación de contraseña
public class SolicitudRecuperacionContrasenaDTO {
  @NotBlank(message = "El correo electrónico es requerido")
  @Email(message = "Formato de correo inválido")
  private String correoElectronico;
  
  // Getters, setters
}

// DTO para restablecimiento de contraseña
public class RestablecimientoContrasenaDTO {
  @NotBlank(message = "El token es requerido")
  private String token;
  
  @NotBlank(message = "La nueva contraseña es requerida")
  @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
  private String nuevaContrasena;
  
  // Getters, setters
}

// DTO para checkout
public class CheckoutDTO {
  @NotBlank(message = "El método de pago es requerido")
  @Pattern(regexp = "^(efectivo|simulado_credito)$", message = "Método de pago inválido")
  private String metodoPago;
  
  // Getters, setters
}

// DTO para resultado de checkout
public class ResultadoCheckoutDTO {
  private String ordenId;
  private String idTransaccionSimulada;
  private BigDecimal montoTotal;
  private String mensaje;
  
  // Getters, setters, constructores
}

// DTO para item de orden
public class ItemOrdenDTO {
  private Long id;
  private String nombre;
  private Integer cantidad;
  private BigDecimal precioUnitario;
  private BigDecimal subtotal;
  
  // Getters, setters, constructores
}

// DTO para actualización de perfil de cliente
public class ActualizacionPerfilDTO {
  @Size(max = 200)
  private String nombreCompleto;
  
  @Pattern(regexp = "^[0-9]{7,20}$", message = "Formato de teléfono inválido")
  private String telefono;
  
  @Email(message = "Formato de correo inválido")
  @Size(max = 255)
  private String correoElectronico;
  
  // Getters, setters
}
```



## Propiedades de Correctitud

*Una propiedad es una característica o comportamiento que debe cumplirse en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de correctitud verificables por máquinas.*

### Propiedad 1: Completitud del Catálogo de Servicios

*Para cualquier* conjunto de servicios en la base de datos, el Sitio Web Público debe mostrar todos los servicios con su nombre y rango de precio visible en la salida renderizada.

**Valida: Requisitos 1.1, 1.2**

### Propiedad 2: Visualización de Imágenes de Galería

*Para cualquier* conjunto de imágenes de galería, el Sitio Web Público debe renderizar todas las imágenes y al hacer clic en cualquier imagen debe abrir un modal mostrando esa imagen en tamaño completo.

**Valida: Requisitos 2.1, 2.2**

### Propiedad 3: Organización de Galería por Categoría

*Para cualquier* conjunto de imágenes de galería con categorías, la galería mostrada debe agrupar las imágenes por su categoría de servicio.

**Valida: Requisitos 2.3**

### Propiedad 4: Completitud del Catálogo de Productos

*Para cualquier* conjunto de productos disponibles en la base de datos, el Sitio Web Público debe mostrar todos los productos disponibles con nombre, descripción, precio e imagen visibles.

**Valida: Requisitos 3.1, 3.2**

### Propiedad 5: Operación de Agregar al Carrito

*Para cualquier* producto y estado del carrito de compras, agregar el producto al carrito debe resultar en que el carrito contenga ese producto con la cantidad especificada.

**Valida: Requisitos 3.3**

### Propiedad 6: Precisión de Visualización del Carrito de Compras

*Para cualquier* estado del carrito de compras, el carrito mostrado debe mostrar todos los artículos con sus cantidades y subtotales, y el precio total debe ser igual a la suma de todos los subtotales.

**Valida: Requisitos 3.4, 3.5**

### Propiedad 7: Consistencia de Actualización del Carrito

*Para cualquier* carrito de compras y cualquier operación de actualización (cambio de cantidad o eliminación de artículo), el contenido del carrito y el precio total deben reflejar con precisión los cambios.

**Valida: Requisitos 3.6, 3.7**

### Propiedad 8: Validación del Formulario de Reserva

*Para cualquier* envío de reserva que falte uno o más campos requeridos (nombre del cliente, teléfono, servicio, fecha u hora), el sistema debe rechazar el envío y mostrar errores de validación.

**Valida: Requisitos 4.2, 4.4**

### Propiedad 9: Creación Válida de Cita

*Para cualquier* envío de reserva con todos los campos requeridos y una franja horaria disponible, el sistema debe crear una cita y mostrar un mensaje de confirmación.

**Valida: Requisitos 4.3, 4.7**

### Propiedad 10: Visualización de Franjas Disponibles

*Para cualquier* fecha seleccionada, el sistema de reservas debe mostrar solo las franjas horarias que no estén ya reservadas por citas existentes.

**Valida: Requisitos 4.5, 4.6**

### Propiedad 11: Persistencia de Cita Ida y Vuelta

*Para cualquier* cita creada exitosamente, consultar la base de datos debe devolver una cita con el mismo nombre de cliente, teléfono, servicio, fecha y hora.

**Valida: Requisitos 4.8**

### Propiedad 12: Autenticación Requerida

*Para cualquier* solicitud a endpoints de administración sin un token de autenticación válido, el sistema debe denegar el acceso y devolver un error de no autorizado.

**Valida: Requisitos 5.1, 5.5**

### Propiedad 13: Credenciales Válidas Otorgan Acceso

*Para cualquier* credenciales de administrador válidas, la operación de inicio de sesión debe devolver un token JWT válido que otorgue acceso a funciones administrativas.

**Valida: Requisitos 5.2**

### Propiedad 14: Rechazo de Credenciales Inválidas

*Para cualquier* credenciales inválidas (nombre de usuario o contraseña incorrectos), la operación de inicio de sesión debe fallar con un mensaje de error y denegar el acceso.

**Valida: Requisitos 5.3**

### Propiedad 15: Persistencia de Sesión

*Para cualquier* sesión autenticada, las solicitudes subsiguientes con el token válido deben permanecer autenticadas hasta que el token expire o ocurra el cierre de sesión.

**Valida: Requisitos 5.4**

### Propiedad 16: Visualización de Citas en Calendario

*Para cualquier* conjunto de citas en la base de datos, el calendario de administración debe mostrar todas las citas con detalles completos (nombre del cliente, teléfono, servicio, fecha, hora).

**Valida: Requisitos 6.1, 6.3**

### Propiedad 17: Ordenamiento Cronológico de Citas

*Para cualquier* conjunto de citas, la visualización del calendario debe organizarlas en orden cronológico por fecha y hora.

**Valida: Requisitos 6.2**

### Propiedad 18: Actualización de Estado de Cita

*Para cualquier* cita, marcarla como completada debe actualizar su estado a 'completada' en la base de datos.

**Valida: Requisitos 6.4**

### Propiedad 19: Cancelación de Cita

*Para cualquier* cita, cancelarla debe eliminarla de la base de datos o actualizar su estado a 'cancelada'.

**Valida: Requisitos 6.5**

### Propiedad 20: Filtrado por Rango de Fechas de Citas

*Para cualquier* filtro de rango de fechas, el sistema debe devolver solo citas con fechas dentro de ese rango (inclusivo).

**Valida: Requisitos 6.7**

### Propiedad 21: Visualización de Precios de Servicios

*Para cualquier* conjunto de servicios, el panel de administración debe mostrar todos los servicios con sus precios actuales.

**Valida: Requisitos 7.1**

### Propiedad 22: Validación de Precio de Servicio

*Para cualquier* actualización de precio de servicio con un valor no positivo (cero o negativo), el sistema debe rechazar la actualización y mostrar un mensaje de error.

**Valida: Requisitos 7.2, 7.5**

### Propiedad 23: Actualización de Precio de Servicio Ida y Vuelta

*Para cualquier* actualización válida de precio de servicio, guardar el cambio y luego consultar el servicio debe devolver el nuevo precio tanto en el panel de administración como en el sitio web público.

**Valida: Requisitos 7.3, 7.4**

### Propiedad 24: Visualización de Información de Productos

*Para cualquier* conjunto de productos, el panel de administración debe mostrar todos los productos con sus precios actuales y estado de disponibilidad.

**Valida: Requisitos 8.1**

### Propiedad 25: Validación de Precio de Producto

*Para cualquier* actualización de precio de producto con un valor no positivo (cero o negativo), el sistema debe rechazar la actualización y mostrar un mensaje de error.

**Valida: Requisitos 8.2, 8.6**

### Propiedad 26: Cambio de Disponibilidad de Producto

*Para cualquier* producto, actualizar su estado de disponibilidad debe cambiar el campo disponible del producto al nuevo valor en la base de datos.

**Valida: Requisitos 8.3**

### Propiedad 27: Actualización de Producto Ida y Vuelta

*Para cualquier* actualización válida de producto (precio o disponibilidad), guardar el cambio y luego consultar el producto debe devolver la información actualizada.

**Valida: Requisitos 8.4**

### Propiedad 28: Filtrado de Productos No Disponibles

*Para cualquier* producto marcado como no disponible, el sitio web público no debe mostrar ese producto en el catálogo de productos.

**Valida: Requisitos 8.5**

### Propiedad 29: Visualización de Lista de Tareas

*Para cualquier* conjunto de tareas en la base de datos, el panel de administración debe mostrar todas las tareas.

**Valida: Requisitos 9.1**

### Propiedad 30: Validación de Creación de Tarea

*Para cualquier* intento de creación de tarea sin descripción, el sistema debe rechazar la creación.

**Valida: Requisitos 9.2**

### Propiedad 31: Actualización de Estado de Tarea Ida y Vuelta

*Para cualquier* tarea, marcarla como completada y luego consultar la base de datos debe devolver la tarea con el estado completada establecido en verdadero.

**Valida: Requisitos 9.3**

### Propiedad 32: Separación de Tareas por Estado

*Para cualquier* conjunto de tareas, el panel de administración debe mostrar las tareas completadas y las tareas pendientes en grupos separados o con distinción visual clara.

**Valida: Requisitos 9.4**

### Propiedad 33: Eliminación de Tarea

*Para cualquier* tarea, eliminarla debe resultar en que la tarea ya no aparezca en las consultas de base de datos.

**Valida: Requisitos 9.5**

### Propiedad 34: Validación de Registro de Cliente

*Para cualquier* intento de registro con correo electrónico ya existente, el sistema debe rechazar el registro y mostrar un mensaje de error indicando que el correo ya está registrado.

**Valida: Requisitos 13.3, 13.4**

### Propiedad 35: Registro Exitoso de Cliente

*Para cualquier* datos de registro válidos con correo único, el sistema debe crear la cuenta del cliente, encriptar la contraseña, y autenticar automáticamente al cliente.

**Valida: Requisitos 13.2, 13.5, 13.6**

### Propiedad 36: Autenticación de Cliente con Credenciales Válidas

*Para cualquier* cliente registrado con credenciales válidas (correo y contraseña correctos), el inicio de sesión debe otorgar acceso y crear una sesión válida.

**Valida: Requisitos 13.7, 13.8, 13.9**

### Propiedad 37: Rechazo de Credenciales Inválidas de Cliente

*Para cualquier* credenciales inválidas de cliente (correo no registrado o contraseña incorrecta), el inicio de sesión debe fallar y mostrar un mensaje de error.

**Valida: Requisitos 13.10**

### Propiedad 38: Persistencia de Sesión de Cliente

*Para cualquier* sesión de cliente autenticado, las solicitudes subsiguientes con el token válido deben permanecer autenticadas hasta el cierre de sesión explícito.

**Valida: Requisitos 13.11**

### Propiedad 39: Protección de Carrito para Clientes No Autenticados

*Para cualquier* intento de agregar productos al carrito o proceder al pago sin autenticación, el sistema debe redirigir a la página de inicio de sesión o registro.

**Valida: Requisitos 3.3, 3.9, 3.10**

### Propiedad 40: Protección de Reservas para Clientes No Autenticados

*Para cualquier* intento de acceder al formulario de reserva sin autenticación, el sistema debe redirigir a la página de inicio de sesión o registro.

**Valida: Requisitos 4.1**

### Propiedad 41: Auto-completado de Datos de Cliente en Reserva

*Para cualquier* cliente autenticado que accede al formulario de reserva, el sistema debe obtener automáticamente el nombre y teléfono del perfil del cliente.

**Valida: Requisitos 4.3**

### Propiedad 42: Asociación de Cita con Cliente Autenticado

*Para cualquier* cita creada por un cliente autenticado, la cita debe almacenarse en la base de datos asociada al ID del cliente.

**Valida: Requisitos 4.10**

### Propiedad 43: Visualización de Citas del Cliente

*Para cualquier* cliente autenticado, el panel de cliente debe mostrar todas las citas del cliente organizadas en tres categorías: Activas/Próximas, Historial (Completadas) y Canceladas.

**Valida: Requisitos 14.1, 14.2, 14.3**

### Propiedad 44: Completitud de Detalles de Cita

*Para cualquier* cita mostrada en el panel de cliente, el sistema debe mostrar servicio contratado, fecha, hora, estado, monto pagado y monto reembolsado (si aplica).

**Valida: Requisitos 14.4**

### Propiedad 45: Cálculo Correcto de Monto de Reembolso

*Para cualquier* cita con tiempo restante ≥24 horas, el monto de reembolso debe ser 100% del monto pagado. Para <24 horas pero ≥1 hora, debe ser 50%. Para <1 hora o mismo día, debe ser 0%.

**Valida: Requisitos 14.7, 15.2, 15.6**

### Propiedad 46: Visualización de Política de Cancelación Antes del Pago

*Para cualquier* intento de proceder al pago de una cita, el sistema debe mostrar la política de cancelación completa antes de permitir el pago.

**Valida: Requisitos 15.1, 15.2**

### Propiedad 47: Obligatoriedad de Aceptación de Política

*Para cualquier* intento de pago sin marcar el checkbox de aceptación de política, el sistema debe prevenir el pago y mostrar un mensaje de error.

**Valida: Requisitos 15.3, 15.4, 15.5**

### Propiedad 48: Procesamiento Automático de Reembolso

*Para cualquier* cancelación de cita confirmada, el sistema debe procesar el reembolso automáticamente al mismo método de pago utilizado, actualizar el estado de la cita a 'cancelada', y registrar el monto reembolsado.

**Valida: Requisitos 15.7, 15.8, 15.9**

### Propiedad 49: Confirmación de Cancelación en Pantalla y Logs

*Para cualquier* cancelación exitosa de cita, el sistema debe mostrar un mensaje en pantalla (toast/alert) con los detalles del reembolso Y registrar la confirmación en los logs del servidor.

**Valida: Requisitos 14.10, 15.10**

### Propiedad 50: Notificación de Error de Reembolso al Admin en Logs y Panel

*Para cualquier* fallo en el procesamiento de reembolso, el sistema debe registrar el error en los logs del servidor Y mostrar una notificación visual en el Panel_Admin.

**Valida: Requisitos 15.11**

### Propiedad 51: Auditoría de Cancelaciones y Reembolsos

*Para cualquier* cancelación y reembolso procesado, el sistema debe mantener un registro de auditoría completo con todos los detalles de la transacción.

**Valida: Requisitos 15.12**

### Propiedad 52: Generación de Token de Recuperación y Enlace en Respuesta

*Para cualquier* solicitud de recuperación de contraseña con correo válido, el sistema debe generar un token único y seguro, almacenarlo en la base de datos con expiración de 1 hora, y RETORNAR el enlace de restablecimiento en la respuesta JSON (además de registrarlo en logs del servidor).

**Valida: Requisitos 16.2, 16.3**

### Propiedad 53: Validación de Token de Recuperación

*Para cualquier* token de recuperación, el sistema debe validar que el token existe, no ha expirado (menos de 1 hora desde creación), y no ha sido usado previamente.

**Valida: Requisitos 16.3, 16.8**

### Propiedad 54: Restablecimiento Exitoso de Contraseña

*Para cualquier* token válido y nueva contraseña que cumple requisitos (mínimo 8 caracteres), el sistema debe actualizar la contraseña con hash BCrypt, marcar el token como usado, mostrar un mensaje en pantalla (toast/alert) confirmando el cambio, registrar la confirmación en los logs del servidor, y redirigir al login.

**Valida: Requisitos 16.5, 16.6, 16.7**

### Propiedad 55: Invalidación de Token Después de Uso

*Para cualquier* token de recuperación usado exitosamente, intentos subsiguientes de usar el mismo token deben fallar con mensaje de error indicando que el token ya fue utilizado.

**Valida: Requisitos 16.7**

### Propiedad 56: Privacidad de Correo en Recuperación

*Para cualquier* solicitud de recuperación con correo no registrado, el sistema debe mostrar el mismo mensaje genérico que para correos registrados, sin revelar si el correo existe en la base de datos.

**Valida: Requisitos 16.4**

### Propiedad 57: Procesamiento de Checkout con Carrito Válido

*Para cualquier* carrito de compras no vacío y método de pago válido ("efectivo" o "simulado_credito"), el checkout debe crear una orden con ID único (formato ORD-{timestamp}-{random}), generar ID de transacción simulado (formato SIM-{timestamp}-{random}), almacenar los productos como JSONB, y vaciar el carrito.

**Valida: Requisitos 17.2, 17.3, 17.4, 17.5, 17.6**

### Propiedad 58: Protección de Checkout para Clientes No Autenticados

*Para cualquier* intento de procesar checkout sin autenticación, el sistema debe denegar el acceso y redirigir a la página de inicio de sesión.

**Valida: Requisitos 17.7**

### Propiedad 59: Visualización de Historial de Órdenes

*Para cualquier* cliente autenticado, el panel de cliente debe mostrar todas las órdenes de compra del cliente con detalles completos (ID de orden, fecha, productos comprados, monto total).

**Valida: Requisitos 17.1**

### Propiedad 60: Invalidación de Sesiones al Cambiar Contraseña

*Para cualquier* cliente que cambia su contraseña, todos los tokens JWT emitidos antes del cambio deben ser rechazados por el sistema al validar la versión de contraseña incluida en el token contra la versión actual en la base de datos.

**Valida: Requisitos 16.7**

### Propiedad 61: Actualización de Perfil de Cliente

*Para cualquier* cliente autenticado que actualiza su perfil con datos válidos, el sistema debe persistir los cambios y retornar el perfil actualizado. Si el nuevo correo ya pertenece a otro cliente, el sistema debe rechazar la actualización con error 409.

**Valida: Requisitos 14.11**

## Manejo de Errores

### Manejo de Errores en Frontend

**Errores de Red**
- Todas las llamadas API deben estar envueltas en bloques try-catch
- Mostrar mensajes de error amigables cuando las solicitudes de red fallen
- Implementar lógica de reintento para fallos transitorios (con backoff exponencial)
- Mostrar estados de carga durante operaciones asíncronas

**Errores de Validación**
- Mostrar errores de validación inline junto a los campos del formulario
- Prevenir envío del formulario hasta que toda la validación pase
- Usar debouncing para validación en tiempo real para evitar verificaciones excesivas
- Proporcionar mensajes de error claros y accionables en español

**Errores de Estado**
- Manejar casos edge como carritos vacíos, sin franjas disponibles, etc.
- Manejar graciosamente datos faltantes o malformados de la API
- Implementar UI de respaldo para estados de error

### Manejo de Errores en Backend

**Validación de Solicitudes**
- Validar todos los datos de solicitud entrantes antes de procesarlos
- Retornar 400 Bad Request con mensajes de error detallados para entrada inválida
- Usar middleware para validación consistente en todos los endpoints

**Errores de Autenticación**
- Retornar 401 Unauthorized para tokens faltantes o inválidos
- Retornar 403 Forbidden para tokens válidos sin permisos suficientes
- Implementar lógica de expiración y renovación de tokens

**Errores de Base de Datos**
- Envolver todas las operaciones de base de datos en bloques try-catch
- Registrar información de error detallada para depuración
- Retornar 500 Internal Server Error genérico a clientes (no exponer detalles internos)
- Implementar connection pooling y lógica de reintento para conexiones de base de datos
- Manejar violaciones de restricciones únicas (ej: doble reserva) con 409 Conflict

**Errores de Lógica de Negocio**
- Retornar 409 Conflict para violaciones de reglas de negocio (ej: reservar franja no disponible)
- Retornar 404 Not Found para recursos no existentes
- Validar reglas de negocio antes de operaciones de base de datos

**Errores de Procesamiento de Pagos y Reembolsos**
- Retornar 400 Bad Request si no se acepta la política de cancelación
- Retornar 500 Internal Server Error si el procesamiento de pago falla
- Registrar errores de reembolso con detalles completos para auditoría
- Notificar al administrador inmediatamente si un reembolso falla mediante una notificación visual en el Panel_Admin (tabla notificaciones_admin, componente campana en header). NO usar email real.
- Mantener estado de reembolso como 'fallido' con mensaje de error detallado
- Implementar reintentos automáticos para fallos transitorios de reembolso
- Mostrar mensaje en pantalla (toast/alert) al cliente informando del estado del reembolso (exitoso o en proceso) Y registrar la confirmación en los logs del servidor

**Formato de Respuesta de Error**
```json
{
  "error": {
    "code": "ERROR_VALIDACION",
    "message": "Mensaje de error legible",
    "details": {
      "field": "telefonoCliente",
      "issue": "Formato de teléfono inválido"
    }
  }
}
```

### Estrategia de Logging

- Registrar todos los errores con stack traces
- Registrar intentos de autenticación (éxito y fallo)
- Registrar todas las operaciones de base de datos para auditoría
- Usar logging estructurado (formato JSON) para fácil análisis
- Implementar niveles de log: ERROR, WARN, INFO, DEBUG
- Rotar logs para prevenir problemas de espacio en disco

## Estrategia de Testing

### Enfoque Dual de Testing

Este sistema requiere tanto testing unitario como testing basado en propiedades para asegurar cobertura completa:

- **Tests unitarios**: Verifican ejemplos específicos, casos edge y condiciones de error
- **Tests de propiedades**: Verifican propiedades universales en todas las entradas usando datos aleatorios
- Ambos enfoques son complementarios y necesarios para validación completa

### Testing Unitario

**Áreas de Enfoque**:
- Ejemplos específicos que demuestran comportamiento correcto
- Casos edge (entradas vacías, valores límite, caracteres especiales)
- Condiciones de error y fallos de validación
- Puntos de integración entre componentes
- Flujos de autenticación y autorización (admin y cliente)
- Procesamiento de pagos y reembolsos

**Balance de Tests Unitarios**:
- Evitar escribir demasiados tests unitarios para escenarios que los tests de propiedades pueden cubrir
- Enfocar tests unitarios en ejemplos concretos y escenarios de integración
- Usar tests unitarios para documentar comportamiento esperado con ejemplos del mundo real

**Ejemplos de Tests Unitarios**:
- Test que el servicio específico "Planchado" se muestra con precio "$15-20"
- Test que carrito vacío muestra mensaje "Tu carrito está vacío"
- Test que formulario de reserva rechaza teléfono "abc123"
- Test que login admin con contraseña incorrecta retorna 401
- Test que cancelar cita no existente retorna 404
- Test que registro con correo duplicado retorna 409
- Test que reembolso con ≥24h anticipación calcula 100%
- Test que pago sin aceptar política retorna 400

**Framework de Testing**: JUnit 5 (Java/Spring Boot), Jest (TypeScript/React)

### Testing Basado en Propiedades

**Librería**: jqwik (librería de property-based testing para Java/JUnit 5)

**Configuración**:
- Mínimo 100 iteraciones por test de propiedad (debido a aleatorización)
- Cada test debe referenciar su propiedad del documento de diseño en un comentario
- Formato de tag: `// Feature: antonela-art-salon-system, Propiedad {número}: {texto_propiedad}`

**Implementación de Tests de Propiedades**:
- Cada propiedad de correctitud listada arriba debe implementarse como un único test basado en propiedades
- Generar entradas válidas aleatorias (servicios, productos, citas, clientes, etc.)
- Verificar que la propiedad se cumple para todas las entradas generadas
- Usar generadores personalizados (Arbitraries) para objetos de dominio (Servicio, Producto, Cita, Cliente, etc.)

**Ejemplos de Tests de Propiedades**:

```java
// Feature: antonela-art-salon-system, Propiedad 1: Completitud del Catálogo de Servicios
@Property
void todosLosServiciosSeMuestranConNombreYPrecio(@ForAll("servicios") List<Servicio> servicios) {
  String renderizado = renderizarCatalogoServicios(servicios);
  boolean todosVisibles = servicios.stream().allMatch(servicio ->
    renderizado.contains(servicio.getNombre()) &&
    renderizado.contains(servicio.getPrecioMinimo().toString())
  );
  assertThat(todosVisibles).isTrue();
}

// Feature: antonela-art-salon-system, Propiedad 11: Persistencia de Cita Ida y Vuelta
@Property
void lasCitasCreadasPuedenRecuperarseDeLaBaseDeDatos(
  @ForAll("datosCita") DatosCitaDTO datosCita,
  @ForAll("cliente") Cliente cliente
) {
  Cita creada = servicioReservas.crearCita(cliente.getId(), datosCita);
  Cita recuperada = servicioReservas.obtenerCita(creada.getId());
  
  assertThat(recuperada.getCliente().getId()).isEqualTo(cliente.getId());
  assertThat(recuperada.getServicio().getId()).isEqualTo(datosCita.getIdServicio());
  assertThat(recuperada.getFechaCita()).isEqualTo(datosCita.getFechaCita());
  assertThat(recuperada.getHoraCita()).isEqualTo(datosCita.getHoraCita());
}

// Feature: antonela-art-salon-system, Propiedad 22: Validación de Precio de Servicio
@Property
void preciosNoPositivosSonRechazados(
  @ForAll @LongRange(min = 1) Long idServicio,
  @ForAll @BigDecimalRange(max = "0") BigDecimal precioInvalido
) {
  assertThatThrownBy(() -> servicioInventario.actualizarPrecioServicio(idServicio, precioInvalido))
    .isInstanceOf(ErrorValidacionException.class)
    .hasMessageContaining("El precio debe ser mayor a cero");
}

// Feature: antonela-art-salon-system, Propiedad 45: Cálculo Correcto de Monto de Reembolso
@Property
void calculoReembolsoSegunHorasAnticipacion(
  @ForAll @BigDecimalRange(min = "1", max = "1000") BigDecimal montoPagado,
  @ForAll @LongRange(min = 0, max = 168) Long horasRestantes
) {
  MontoReembolsoDTO resultado = servicioCancelacion.calcularMontoReembolso(montoPagado, horasRestantes);
  
  if (horasRestantes >= 24) {
    assertThat(resultado.getPorcentaje()).isEqualTo(100);
    assertThat(resultado.getMonto()).isEqualByComparingTo(montoPagado);
  } else if (horasRestantes >= 1) {
    assertThat(resultado.getPorcentaje()).isEqualTo(50);
    assertThat(resultado.getMonto()).isEqualByComparingTo(montoPagado.multiply(new BigDecimal("0.5")));
  } else {
    assertThat(resultado.getPorcentaje()).isEqualTo(0);
    assertThat(resultado.getMonto()).isEqualByComparingTo(BigDecimal.ZERO);
  }
}
```

**Generadores Personalizados (Arbitraries)**:
```java
@Provide
Arbitrary<Servicio> servicios() {
  return Combinators.combine(
    Arbitraries.longs().greaterOrEqual(1L),
    Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(100),
    Arbitraries.bigDecimals().between(BigDecimal.valueOf(0.01), BigDecimal.valueOf(1000)),
    Arbitraries.bigDecimals().between(BigDecimal.valueOf(0.01), BigDecimal.valueOf(1000)).optional()
  ).as((id, nombre, precioMin, precioMax) -> {
    Servicio servicio = new Servicio();
    servicio.setId(id);
    servicio.setNombre(nombre);
    servicio.setPrecioMinimo(precioMin);
    servicio.setPrecioMaximo(precioMax.orElse(null));
    return servicio;
  });
}

@Provide
Arbitrary<DatosCitaDTO> datosCita() {
  return Combinators.combine(
    Arbitraries.longs().between(1L, 10L),
    Arbitraries.dates().atTheEarliest(LocalDate.now().plusDays(1)),
    Arbitraries.integers().between(9, 18).map(h -> LocalTime.of(h, 0))
  ).as((idServicio, fecha, hora) -> {
    DatosCitaDTO dto = new DatosCitaDTO();
    dto.setIdServicio(idServicio);
    dto.setFechaCita(fecha);
    dto.setHoraCita(hora);
    return dto;
  });
}

@Provide
Arbitrary<Cliente> cliente() {
  return Combinators.combine(
    Arbitraries.longs().greaterOrEqual(1L),
    Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(200),
    Arbitraries.emails(),
    Arbitraries.strings().numeric().ofMinLength(7).ofMaxLength(20)
  ).as((id, nombre, correo, telefono) -> {
    Cliente cliente = new Cliente();
    cliente.setId(id);
    cliente.setNombreCompleto(nombre);
    cliente.setCorreoElectronico(correo);
    cliente.setTelefono(telefono);
    return cliente;
  });
}
```

### Testing de Integración

**Tests de Integración de API**:
- Probar ciclos completos de solicitud/respuesta para todos los endpoints
- Usar una base de datos de prueba (separada de producción)
- Probar flujos de autenticación end-to-end
- Verificar estado de base de datos después de operaciones

**Tests de Integración de Frontend**:
- Probar flujos de usuario (explorar servicios → agregar al carrito → checkout)
- Probar flujo de reserva (seleccionar servicio → elegir fecha → seleccionar hora → enviar)
- Probar flujos admin (login → gestionar citas → actualizar precios)
- Usar librería de testing como React Testing Library o Vue Test Utils

### Testing End-to-End

**Herramienta**: Playwright o Cypress

**Jornadas Críticas de Usuario**:
1. Cliente se registra, inicia sesión, y reserva una cita exitosamente
2. Cliente agrega productos al carrito y visualiza carrito (requiere autenticación)
3. Cliente visualiza sus citas en el panel de cliente
4. Cliente cancela una cita y recibe reembolso automático
5. Cliente ve política de cancelación antes de pagar
6. Admin inicia sesión y visualiza calendario
7. Admin actualiza precio de servicio y verifica cambio en sitio público
8. Admin marca cita como completada
9. Admin crea y completa una tarea

### Objetivos de Cobertura de Tests

- Cobertura de tests unitarios: 80% mínimo
- Cobertura de tests de propiedades: Las 61 propiedades de correctitud implementadas
- Cobertura de tests de integración: Todos los endpoints API
- Cobertura de tests E2E: Todas las jornadas críticas de usuario

### Integración Continua

- Ejecutar todos los tests en cada commit
- Bloquear merges si los tests fallan
- Generar reportes de cobertura
- Ejecutar tests de propiedades con iteraciones aumentadas (500+) en CI para validación exhaustiva