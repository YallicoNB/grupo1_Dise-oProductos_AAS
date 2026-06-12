# Documento de Requisitos

## Introducción

Sistema web integral para Antonela Art, un salón de belleza que combina una plataforma pública informativa y de comercio electrónico con un sistema de gestión administrativa interna. El sistema permitirá a los clientes explorar servicios, comprar productos de belleza y reservar citas en línea, mientras que la administración podrá gestionar el calendario, actualizar precios y controlar el inventario.

## Glosario

- **Sitio_Web_Publico**: La interfaz web accesible públicamente que muestra información del salón, servicios, productos y permite reservas
- **Panel_Admin**: Panel de control privado accesible solo por la dueña del salón para gestionar el negocio
- **Panel_Cliente**: Panel de control privado accesible solo por clientes autenticados para gestionar sus citas y compras
- **Sistema_Reservas**: Sistema de reserva de citas en línea
- **Carrito_Compras**: Carrito de compras para productos de belleza
- **Catalogo_Servicios**: Catálogo de servicios ofrecidos por el salón con sus precios
- **Catalogo_Productos**: Catálogo de productos de belleza disponibles para la venta
- **Cita**: Cita reservada por un cliente para un servicio específico
- **Cliente**: Usuario registrado que reserva servicios o compra productos
- **Cliente_Autenticado**: Cliente que ha iniciado sesión en el sistema
- **Administrador**: La dueña del salón con acceso al Panel_Admin
- **Calendario**: Sistema de gestión de citas y disponibilidad
- **Tarea**: Actividad o pendiente administrativo que puede ser marcado como completado
- **Reembolso**: Devolución de dinero al cliente según la política de cancelación
- **Politica_Cancelacion**: Reglas que determinan el porcentaje de reembolso según el tiempo de anticipación de la cancelación
- **Orden_Compra**: Registro de una compra de productos realizada por un cliente, con sus detalles y monto total
- **Checkout**: Proceso de finalización de compra donde el cliente confirma los productos y selecciona método de pago

## Requisitos

### Requisito 1: Mostrar Catálogo de Servicios

**Historia de Usuario:** Como cliente potencial, quiero ver todos los servicios disponibles con sus precios, para poder decidir qué servicio contratar.

#### Criterios de Aceptación

1. EL Sitio_Web_Publico DEBE mostrar el Catalogo_Servicios con todos los servicios disponibles
2. PARA CADA servicio en el Catalogo_Servicios, EL Sitio_Web_Publico DEBE mostrar el nombre del servicio y rango de precio
3. EL Catalogo_Servicios DEBE incluir Planchado ($15-20), Laminado ($25), Pedicura ($26), Uñas acrílicas ($50), Rubber ($35), Esmaltado ($25), Alisado ($70), y Pestañas 1x1 ($35)
4. EL Sitio_Web_Publico DEBE mostrar los servicios en un estilo visual moderno, elegante y minimalista

### Requisito 2: Mostrar Galería de Servicios

**Historia de Usuario:** Como cliente potencial, quiero ver una galería visual de los servicios, para apreciar la calidad del trabajo del salón.

#### Criterios de Aceptación

1. EL Sitio_Web_Publico DEBE mostrar una galería con imágenes de servicios completados
2. CUANDO un Cliente hace clic en una imagen de galería, EL Sitio_Web_Publico DEBE mostrar la imagen en tamaño completo
3. EL Sitio_Web_Publico DEBE organizar las imágenes de galería por categoría de servicio

### Requisito 3: Catálogo de Productos y Carrito de Compras

**Historia de Usuario:** Como cliente autenticado, quiero comprar productos de belleza en línea, para adquirir productos recomendados por el salón.

#### Criterios de Aceptación

1. EL Sitio_Web_Publico DEBE mostrar el Catalogo_Productos con productos de belleza disponibles
2. PARA CADA producto, EL Sitio_Web_Publico DEBE mostrar nombre del producto, descripción, precio e imagen
3. CUANDO un Cliente NO autenticado hace clic en "Añadir al carrito", EL Sistema DEBE redirigir a la página de inicio de sesión o registro
4. CUANDO un Cliente autenticado hace clic en "Añadir al carrito" en un producto, EL Carrito_Compras DEBE agregar el producto al carrito
5. EL Carrito_Compras DEBE mostrar la cantidad total de artículos y precio total
6. CUANDO un Cliente visualiza el Carrito_Compras, EL Sitio_Web_Publico DEBE mostrar todos los productos agregados con cantidades y subtotales
7. CUANDO un Cliente actualiza la cantidad de producto en el Carrito_Compras, EL Carrito_Compras DEBE recalcular el precio total
8. CUANDO un Cliente elimina un producto del Carrito_Compras, EL Carrito_Compras DEBE actualizar el contenido del carrito y precio total
9. CUANDO un Cliente NO autenticado intenta proceder al pago, EL Sistema DEBE redirigir a la página de inicio de sesión o registro
10. SOLO los Clientes autenticados DEBEN poder completar el proceso de pago

### Requisito 4: Reserva de Citas en Línea

**Historia de Usuario:** Como cliente autenticado, quiero reservar citas en línea, para agendar servicios sin necesidad de llamar por teléfono.

#### Criterios de Aceptación

1. CUANDO un Cliente NO autenticado intenta acceder al formulario de reserva, EL Sistema DEBE redirigir a la página de inicio de sesión o registro
2. EL Sistema_Reservas DEBE proporcionar un formulario interactivo de reserva de citas SOLO para clientes autenticados
3. EL Sistema_Reservas DEBE obtener automáticamente el nombre y teléfono del Cliente desde su perfil autenticado
4. EL Sistema_Reservas DEBE requerir los siguientes campos: selección de servicio, fecha y hora
5. CUANDO un Cliente autenticado envía un formulario de reserva con todos los campos requeridos, EL Sistema_Reservas DEBE crear una Cita
6. CUANDO un Cliente envía un formulario de reserva con campos requeridos faltantes, EL Sistema_Reservas DEBE mostrar mensajes de error de validación
7. EL Sistema_Reservas DEBE mostrar franjas horarias disponibles para la fecha seleccionada
8. CUANDO un Cliente selecciona una fecha, EL Sistema_Reservas DEBE mostrar solo franjas horarias disponibles para esa fecha
9. CUANDO una Cita se crea exitosamente, EL Sistema_Reservas DEBE mostrar un mensaje de confirmación al Cliente
10. CUANDO una Cita se crea exitosamente, EL Sistema_Reservas DEBE almacenar la cita en la base de datos PostgreSQL asociada al Cliente autenticado

### Requisito 5: Autenticación de Administrador

**Historia de Usuario:** Como administradora del salón, quiero acceder a un panel privado seguro, para gestionar el negocio sin que otros usuarios accedan.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE requerir autenticación antes de otorgar acceso
2. CUANDO un Administrador ingresa credenciales válidas, EL Panel_Admin DEBE otorgar acceso a funciones administrativas
3. CUANDO un usuario ingresa credenciales inválidas, EL Panel_Admin DEBE mostrar un mensaje de error y denegar el acceso
4. EL Panel_Admin DEBE mantener la sesión del Administrador hasta el cierre de sesión
5. CUANDO un usuario no autenticado intenta acceder al Panel_Admin, EL Panel_Admin DEBE redirigir a la página de inicio de sesión

### Requisito 6: Gestión de Calendario de Citas

**Historia de Usuario:** Como administradora, quiero gestionar el calendario de citas, para organizar y visualizar todas las reservas.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE mostrar el Calendario con todas las Citas programadas
2. EL Calendario DEBE mostrar citas organizadas por fecha y hora
3. CUANDO un Administrador visualiza una Cita, EL Panel_Admin DEBE mostrar nombre del cliente, número de teléfono, servicio, fecha y hora
4. CUANDO un Administrador marca una Cita como completada, EL Calendario DEBE actualizar el estado de la cita
5. CUANDO un Administrador cancela una Cita, EL Calendario DEBE eliminar la cita del calendario
6. EL Calendario DEBE resaltar las citas del día actual
7. EL Panel_Admin DEBE permitir al Administrador filtrar citas por rango de fechas

### Requisito 7: Gestión de Precios de Servicios

**Historia de Usuario:** Como administradora, quiero actualizar los precios de los servicios, para mantener el catálogo actualizado según cambios en el negocio.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE mostrar todos los servicios con sus precios actuales
2. CUANDO un Administrador actualiza un precio de servicio, EL Panel_Admin DEBE validar que el precio sea un número positivo
3. CUANDO un Administrador guarda una actualización de precio válida, EL Panel_Admin DEBE actualizar el precio del servicio en la base de datos PostgreSQL
4. CUANDO un precio de servicio se actualiza, EL Sitio_Web_Publico DEBE mostrar el nuevo precio inmediatamente
5. SI un Administrador ingresa un valor de precio inválido, ENTONCES EL Panel_Admin DEBE mostrar un mensaje de error y prevenir la actualización

### Requisito 8: Gestión de Precios e Inventario de Productos

**Historia de Usuario:** Como administradora, quiero actualizar precios y disponibilidad de productos, para mantener el catálogo de productos actualizado.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE mostrar todos los productos con sus precios actuales y estado de disponibilidad
2. CUANDO un Administrador actualiza un precio de producto, EL Panel_Admin DEBE validar que el precio sea un número positivo
3. CUANDO un Administrador actualiza la disponibilidad de producto, EL Panel_Admin DEBE permitir marcar productos como disponibles o no disponibles
4. CUANDO un Administrador guarda actualizaciones de producto, EL Panel_Admin DEBE actualizar la información del producto en la base de datos PostgreSQL
5. CUANDO un producto se marca como no disponible, EL Sitio_Web_Publico DEBE ocultar el producto del Catalogo_Productos
6. SI un Administrador ingresa un valor de precio inválido, ENTONCES EL Panel_Admin DEBE mostrar un mensaje de error y prevenir la actualización

### Requisito 9: Gestión de Tareas

**Historia de Usuario:** Como administradora, quiero gestionar tareas administrativas, para llevar control de pendientes del negocio.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE mostrar una lista de todas las Tareas
2. CUANDO un Administrador crea una nueva Tarea, EL Panel_Admin DEBE requerir una descripción de tarea
3. CUANDO un Administrador marca una Tarea como completada, EL Panel_Admin DEBE actualizar el estado de la tarea en la base de datos PostgreSQL
4. EL Panel_Admin DEBE mostrar tareas completadas y pendientes por separado
5. CUANDO un Administrador elimina una Tarea, EL Panel_Admin DEBE eliminar la tarea de la base de datos

### Requisito 10: Persistencia de Datos

**Historia de Usuario:** Como administradora, quiero que toda la información se almacene de forma persistente, para no perder datos del negocio.

#### Criterios de Aceptación

1. EL Panel_Admin DEBE almacenar todas las Citas en la base de datos PostgreSQL
2. EL Panel_Admin DEBE almacenar todos los precios de servicios en la base de datos PostgreSQL
3. EL Panel_Admin DEBE almacenar toda la información de productos en la base de datos PostgreSQL
4. EL Panel_Admin DEBE almacenar todas las Tareas en la base de datos PostgreSQL
5. CUANDO el sistema se reinicia, EL Panel_Admin DEBE recuperar todos los datos de la base de datos PostgreSQL
6. EL Sistema_Reservas DEBE almacenar información de contacto del cliente en la base de datos PostgreSQL

### Requisito 11: Diseño Responsive

**Historia de Usuario:** Como cliente, quiero acceder al sitio web desde cualquier dispositivo, para poder reservar citas y comprar productos desde mi teléfono o computadora.

#### Criterios de Aceptación

1. EL Sitio_Web_Publico DEBE mostrarse correctamente en pantallas de escritorio (1920x1080 y superiores)
2. EL Sitio_Web_Publico DEBE mostrarse correctamente en pantallas de tablet (768x1024)
3. EL Sitio_Web_Publico DEBE mostrarse correctamente en pantallas móviles (375x667 y superiores)
4. EL Panel_Admin DEBE mostrarse correctamente en pantallas de escritorio
5. CUANDO un usuario accede al sitio web desde un dispositivo móvil, EL Sitio_Web_Publico DEBE adaptar el diseño para interacción táctil

### Requisito 12: Interfaz de Usuario Moderna y Elegante

**Historia de Usuario:** Como cliente, quiero una interfaz visualmente atractiva, para tener una experiencia acorde a un salón de belleza de alta gama.

#### Criterios de Aceptación

1. EL Sitio_Web_Publico DEBE usar una estética de diseño moderna, elegante y minimalista
2. EL Sitio_Web_Publico DEBE usar una paleta de colores apropiada para un salón de belleza de alta gama
3. EL Sitio_Web_Publico DEBE usar tipografía y espaciado de alta calidad
4. EL Sitio_Web_Publico DEBE incluir transiciones y animaciones suaves para interacciones de usuario
5. EL Panel_Admin DEBE usar un diseño de interfaz limpio y profesional

### Requisito 13: Autenticación de Clientes

**Historia de Usuario:** Como cliente nuevo, quiero registrarme en el sistema, para poder reservar citas y comprar productos.

#### Criterios de Aceptación

1. EL Sistema DEBE proporcionar un formulario de registro de cliente
2. EL formulario de registro DEBE requerir: nombre completo, correo electrónico, número de teléfono y contraseña
3. EL Sistema DEBE validar que el correo electrónico sea único en la base de datos
4. CUANDO un Cliente intenta registrarse con un correo ya existente, EL Sistema DEBE mostrar un mensaje de error indicando que el correo ya está registrado
5. EL Sistema DEBE encriptar la contraseña antes de almacenarla en la base de datos
6. CUANDO un Cliente completa el registro exitosamente, EL Sistema DEBE crear la cuenta y autenticar automáticamente al Cliente
7. EL Sistema DEBE proporcionar un formulario de inicio de sesión
8. EL formulario de inicio de sesión DEBE requerir: correo electrónico y contraseña
9. CUANDO un Cliente ingresa credenciales válidas, EL Sistema DEBE autenticar al Cliente y crear una sesión
10. CUANDO un Cliente ingresa credenciales inválidas, EL Sistema DEBE mostrar un mensaje de error
11. EL Sistema DEBE mantener la sesión del Cliente hasta que cierre sesión explícitamente
12. EL Sistema DEBE proporcionar una opción de cierre de sesión accesible desde cualquier página

### Requisito 14: Panel de Cliente e Historial de Citas

**Historia de Usuario:** Como cliente autenticado, quiero visualizar mis citas y su historial, para llevar control de mis servicios agendados y pasados.

#### Criterios de Aceptación

1. EL Sistema DEBE proporcionar un Panel_Cliente accesible solo para clientes autenticados
2. CUANDO un Cliente NO autenticado intenta acceder al Panel_Cliente, EL Sistema DEBE redirigir a la página de inicio de sesión
3. EL Panel_Cliente DEBE mostrar las citas organizadas en tres categorías: Activas/Próximas, Historial (Completadas) y Canceladas
4. PARA CADA cita, EL Panel_Cliente DEBE mostrar: servicio contratado, fecha, hora, estado, monto pagado y monto reembolsado (si aplica)
5. PARA las citas Activas/Próximas, EL Panel_Cliente DEBE mostrar un botón "Cancelar Cita"
6. CUANDO un Cliente hace clic en "Cancelar Cita", EL Sistema DEBE mostrar una confirmación con el monto de reembolso que recibirá según la política de cancelación
7. EL Sistema DEBE calcular el monto de reembolso basado en el tiempo restante hasta la cita
8. CUANDO un Cliente confirma la cancelación, EL Sistema DEBE procesar el reembolso automáticamente
9. EL Panel_Cliente DEBE actualizar el estado de la cita a "Cancelada" y mostrar el monto reembolsado
10. EL Sistema DEBE mostrar un mensaje en pantalla (toast/alert) con los detalles del reembolso Y registrar la confirmación en los logs del servidor (sin envío real de email). En un entorno real esto se enviaría por email, pero en este proyecto es simulado.
11. EL Panel_Cliente DEBE permitir al cliente editar su nombre completo, número de teléfono y correo electrónico. CUANDO un Cliente actualiza su correo electrónico, EL Sistema DEBE validar que el nuevo correo no esté ya registrado por otro cliente.
12. EL Panel_Cliente DEBE mostrar una sección "Mis órdenes" donde el cliente pueda ver todas sus compras de productos realizadas, mostrando: ID de orden, fecha, monto total, método de pago y lista de productos comprados.

### Requisito 15: Política de Cancelación con Reembolso Automático

**Historia de Usuario:** Como cliente, quiero conocer la política de cancelación antes de pagar, para tomar una decisión informada sobre mi reserva.

#### Criterios de Aceptación

1. ANTES de proceder al pago de una cita, EL Sistema DEBE mostrar la política de cancelación completa
2. La política de cancelación DEBE especificar claramente:
   - Cancelación con ≥24 horas de anticipación → 100% de reembolso
   - Cancelación con <24 horas de anticipación → 50% de reembolso
   - Cancelación el mismo día o inasistencia → 0% de reembolso
3. EL Sistema DEBE incluir un checkbox de aceptación de la política de cancelación
4. EL checkbox de aceptación DEBE ser obligatorio para proceder al pago
5. CUANDO un Cliente NO marca el checkbox, EL Sistema DEBE prevenir el pago y mostrar un mensaje de error
6. CUANDO un Cliente cancela una cita, EL Sistema DEBE calcular automáticamente el porcentaje de reembolso según el tiempo restante
7. EL Sistema DEBE registrar el reembolso en la base de datos como 'procesado (simulado)' con un ID de transacción simulado (ejemplo: SIM-{timestamp}-{random})
8. EL Sistema DEBE actualizar el estado de la cita a "Cancelada" en la base de datos
9. EL Sistema DEBE registrar el monto reembolsado en la base de datos
10. EL Sistema DEBE mostrar un mensaje en pantalla (toast/alert) con los detalles del reembolso Y registrar la confirmación en los logs del servidor
11. SI el proceso de reembolso falla, EL Sistema DEBE registrar el error en los logs del servidor Y mostrar una notificación en el Panel_Admin (sin usar email)
12. EL Sistema DEBE mantener un registro de auditoría de todas las cancelaciones y reembolsos

### Requisito 16: Recuperación de Contraseña

**Historia de Usuario:** Como cliente, quiero poder recuperar mi contraseña si la olvido, para poder acceder nuevamente a mi cuenta sin perder mis datos.

#### Criterios de Aceptación

1. La página de inicio de sesión DEBE incluir un enlace "¿Olvidaste tu contraseña?"
2. CUANDO un Cliente hace clic en el enlace, EL Sistema DEBE mostrar un formulario para ingresar el correo electrónico registrado
3. SI el correo existe en la base de datos, EL Sistema DEBE:
   - Generar un token único y seguro con expiración de 1 hora
   - Almacenar el token en la base de datos asociado al cliente
   - MOSTRAR EN PANTALLA el enlace de restablecimiento con el token generado (ejemplo: http://localhost:3000/reset-password?token=abc-123-def) Y registrar el enlace en los logs del servidor. En un entorno real esto se enviaría por email, pero en este proyecto es simulado.
4. SI el correo NO existe en la base de datos, EL Sistema DEBE mostrar un mensaje genérico sin revelar si el correo está registrado
5. EL enlace de restablecimiento DEBE llevar al cliente a una página segura donde pueda ingresar una nueva contraseña
6. La nueva contraseña DEBE cumplir con las mismas reglas de validación que en el registro (mínimo 8 caracteres)
7. CUANDO el Cliente guarda la nueva contraseña, EL Sistema DEBE:
   - Actualizar la contraseña en la base de datos con hash seguro (BCrypt)
   - Invalidar el token para que no pueda ser reutilizado
   - Mostrar un mensaje en pantalla confirmando el cambio de contraseña Y registrar la confirmación en los logs del servidor
   - Redirigir al cliente a la página de inicio de sesión
   - EL Sistema DEBE invalidar todos los tokens JWT activos del cliente al restablecer la contraseña. Esto se logra mediante una versión de contraseña (password_version) que se incrementa en cada cambio, y todos los tokens existentes quedan automáticamente inválidos al validar contra la versión desactualizada.
8. SI el token ha expirado o es inválido, EL Sistema DEBE mostrar un mensaje de error y solicitar un nuevo intento de recuperación

### Requisito 17: Checkout y Compra de Productos

**Historia de Usuario:** Como cliente autenticado con productos en mi carrito, quiero proceder al pago y completar mi compra, para recibir mis productos.

#### Criterios de Aceptación

1. EL Carrito_Compras DEBE mostrar un botón "Finalizar compra" cuando tenga al menos un producto
2. CUANDO un Cliente hace clic en "Finalizar compra", EL Sistema DEBE mostrar un formulario de checkout
3. EL formulario de checkout DEBE mostrar: resumen de productos, monto total, y opciones de método de pago
4. EL formulario de checkout DEBE requerir selección de método de pago ("efectivo" o "simulado_credito")
5. CUANDO un Cliente confirma la compra, EL Sistema DEBE:
   - Generar una orden de compra con ID único simulado (formato: ORD-{timestamp}-{random})
   - SIMULAR el procesamiento del pago (sin integración real)
   - Almacenar la orden en la tabla ordenes_compra
   - Vaciar el carrito del cliente
   - Mostrar una pantalla de confirmación con el ID de orden
6. EL Sistema DEBE mantener un historial de órdenes de compra visible para el cliente en su Panel_Cliente
7. SOLO clientes autenticados DEBEN poder realizar el checkout
