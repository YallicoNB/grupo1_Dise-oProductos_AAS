# Plan de Implementación: Sistema Antonela Art Salon

## Resumen General

Este plan de implementación organiza las tareas por módulos para permitir el trabajo paralelo de 4 desarrolladores. El sistema se construirá incrementalmente, comenzando con la infraestructura base, luego los módulos independientes, y finalmente la integración. Cada tarea incluye referencias específicas a los requisitos y propiedades de correctitud que valida.

**Stack Tecnológico**:
- **Frontend**: TypeScript con React
- **Backend**: Java con Spring Boot
- **Base de Datos**: PostgreSQL (nombres de tablas y columnas en español)
- **Autenticación**: JWT con Spring Security
- **ORM**: Spring Data JPA / Hibernate
- **Testing**: JUnit 5 + jqwik (property-based testing para Java), Jest (para React)

## Tareas

- [ ] 1. Setup inicial del proyecto y base de datos
  - [ ] 1.1 Crear estructura de directorios del proyecto
    - Crear carpetas: `/frontend`, `/backend`, `/database`, `/tests`
    - Inicializar proyecto React con TypeScript en frontend (usando Vite o Create React App)
    - Inicializar proyecto Spring Boot en backend (usando Spring Initializr con dependencias: Spring Web, Spring Data JPA, Spring Security, PostgreSQL Driver)
    - Configurar .gitignore para node_modules, target/, archivos de entorno
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 1.2 Configurar base de datos PostgreSQL
    - Crear script de inicialización de base de datos
    - Implementar schema SQL para las 12 tablas en español (servicios, productos, clientes, citas, pagos, reembolsos, politica_cancelacion, tareas, usuarios_admin, imagenes_galeria, tokens_recuperacion_contrasena, ordenes_compra)
    - Crear script de seed con datos iniciales de servicios y política de cancelación
    - Configurar conexión a PostgreSQL en application.properties (Spring Boot)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 16.3, 17.4_

  - [ ] 1.3 Configurar servidor Spring Boot básico
    - Crear aplicación Spring Boot con configuración básica
    - Configurar CORS para permitir requests desde frontend
    - Configurar variables de entorno para conexión a DB y JWT secret
    - Implementar health check endpoint (GET /api/health)
    - Configurar manejo de errores global con @ControllerAdvice
    - _Requirements: 5.1, 10.5_

  - [ ] 1.4 Configurar proyecto frontend React con TypeScript
    - Inicializar proyecto React con TypeScript
    - Configurar estructura de carpetas: /componentes, /paginas, /servicios, /utilidades, /tipos
    - Instalar dependencias: axios para API calls, react-router-dom para routing
    - Configurar proxy para desarrollo apuntando al backend Spring Boot
    - Configurar Tailwind CSS o CSS Modules para estilos
    - _Requirements: 11.1, 11.2, 11.3, 12.1_

- [ ] 2. Módulo de Autenticación Admin y Cliente (Developer 1)
  - [ ] 2.1 Crear entidades JPA para Usuario y Cliente
    - Crear entidad UsuarioAdmin con anotaciones JPA
    - Crear entidad Cliente con anotaciones JPA
    - Crear repositorios Spring Data JPA: UsuarioAdminRepository, ClienteRepository
    - _Requirements: 5.1, 13.1_

  - [ ] 2.2 Implementar ServicioAutenticacionAdmin
    - Crear @Service con métodos: iniciarSesionAdmin, verificarToken, encriptarContrasena, compararContrasena
    - Implementar hash de contraseñas con BCryptPasswordEncoder
    - Implementar generación y verificación de JWT tokens con jjwt library
    - Crear filtro de autenticación JWT con OncePerRequestFilter
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 2.3 Implementar ServicioAutenticacionCliente
    - Crear @Service con métodos: registrarCliente, iniciarSesionCliente, verificarTokenCliente, validarCorreoUnico
    - Implementar validación de correo único antes de registro
    - Implementar encriptación de contraseña con BCrypt
    - Generar JWT token automáticamente después de registro exitoso
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_

  - [ ] 2.4 Implementar endpoints de autenticación admin
    - Crear @RestController para /api/admin/login
    - Validar campos nombreUsuario y contrasena requeridos con @Valid
    - Verificar credenciales contra tabla usuarios_admin
    - Retornar JWT token y datos de usuario en caso de éxito
    - Retornar 401 para credenciales inválidas
    - _Requirements: 5.2, 5.3_

  - [ ] 2.5 Implementar endpoints de autenticación cliente
    - Crear @RestController para /api/client/register
    - Validar todos los campos con @Valid y anotaciones de validación
    - Verificar que correo no exista (retornar 409 si existe)
    - Crear cuenta y retornar token JWT
    - Crear @RestController para /api/client/login
    - Validar credenciales y retornar token
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_

  - [ ]* 2.6 Escribir property tests para autenticación
    - **Property 13: Valid Credentials Grant Access (Admin)**
    - **Property 14: Invalid Credentials Rejection (Admin)**
    - **Property 34: Validación de Registro de Cliente**
    - **Property 35: Registro Exitoso de Cliente**
    - **Property 36: Autenticación de Cliente con Credenciales Válidas**
    - **Property 37: Rechazo de Credenciales Inválidas de Cliente**
    - **Property 38: Persistencia de Sesión de Cliente**
    - **Validates: Requirements 5.2, 5.3, 13.2-13.11**

  - [ ] 2.7 Crear componentes de autenticación en React
    - Crear FormularioLogin component para admin
    - Crear FormularioRegistroCliente component
    - Crear FormularioLoginCliente component
    - Implementar manejo de tokens en localStorage
    - Crear AuthContext para gestionar estado de autenticación
    - _Requirements: 5.2, 5.3, 13.1, 13.7_

  - [ ]* 2.8 Escribir unit tests para componentes de autenticación
    - Test: login exitoso guarda token y redirige
    - Test: credenciales inválidas muestran error
    - Test: registro con correo duplicado muestra error
    - Test: campos vacíos previenen submit
    - _Requirements: 5.2, 5.3, 13.2, 13.9, 13.10_

  - [ ] 2.9 Configurar Spring Security
    - Configurar SecurityFilterChain con rutas públicas y protegidas
    - Agregar JwtAuthenticationFilter a la cadena de filtros
    - Configurar CORS en Spring Security
    - Deshabilitar CSRF para API REST
    - _Requirements: 5.1, 5.4, 5.5, 13.11_

  - [ ] 2.10 Implementar protección de rutas en React
    - Crear RutaProtegidaAdmin component que verifica token admin
    - Crear RutaProtegidaCliente component que verifica token cliente
    - Redirigir a login si no hay token válido
    - Implementar interceptor axios para agregar token a headers
    - _Requirements: 5.1, 5.4, 5.5, 13.11_

  - [ ]* 2.11 Escribir property tests para protección de rutas
    - **Property 12: Authentication Required**
    - **Property 15: Session Persistence (Admin)**
    - **Property 38: Persistencia de Sesión de Cliente**
    - **Validates: Requirements 5.1, 5.4, 5.5, 13.11**

  - [ ] 2.12 Implementar recuperación de contraseña backend
    - Crear entidad TokenRecuperacionContrasena con anotaciones JPA
    - Crear repositorio TokenRecuperacionContrasenaRepository
    - Agregar métodos en ServicioAutenticacionCliente: solicitarRecuperacionContrasena (que RETORNA el enlace), validarTokenRecuperacion, restablecerContrasena, generarTokenRecuperacion
    - Implementar generación de token único con UUID
    - Implementar validación de expiración (1 hora)
    - SIMULAR envío de correo: registrar enlace de restablecimiento en logs del servidor (sin envío real de email)
    - _Requirements: 16.2, 16.3, 16.5, 16.6, 16.7_

  - [ ] 2.13 Implementar endpoints de recuperación de contraseña
    - Crear endpoint POST /api/client/forgot-password
    - Validar correo con @Valid
    - Retornar mensaje genérico sin revelar si correo existe (seguridad)
    - RETORNAR el enlace de restablecimiento en la respuesta JSON (campo "enlaceRestablecimiento") además del mensaje genérico
    - Crear endpoint GET /api/client/validate-reset-token con query param token
    - Crear endpoint POST /api/client/reset-password
    - Validar token y nueva contraseña
    - Actualizar contraseña y marcar token como usado
    - SIMULAR envío de correo de confirmación: registrar en logs del servidor (sin envío real de email)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.7, 16.8_

  - [ ]* 2.14 Escribir property tests para recuperación de contraseña
    - **Property 52: Generación de Token de Recuperación**
    - **Property 53: Validación de Token de Recuperación**
    - **Property 54: Restablecimiento Exitoso de Contraseña** — Para cualquier token válido y nueva contraseña que cumple requisitos (mínimo 8 caracteres), el sistema debe actualizar la contraseña con hash BCrypt, marcar el token como usado, mostrar un mensaje en pantalla (toast/alert) confirmando el cambio, registrar la confirmación en los logs del servidor, y redirigir al login.
    - **Property 55: Invalidación de Token Después de Uso**
    - **Property 56: Privacidad de Correo en Recuperación**
    - **Validates: Requirements 16.1-16.8**

  - [ ] 2.15 Crear componentes de recuperación de contraseña en React
    - Crear FormularioRecuperacionContrasena component
    - Agregar enlace "¿Olvidaste tu contraseña?" en FormularioLoginCliente
    - Crear FormularioRestablecerContrasena component
    - Implementar validación de token al cargar componente
    - Implementar validación de contraseña (mínimo 8 caracteres)
    - Mostrar mensajes de error apropiados para token inválido/expirado
    - MOSTRAR EN PANTALLA el enlace de restablecimiento generado (en lugar de "revisa tu email")
    - Redirigir a login después de restablecimiento exitoso
    - _Requirements: 16.1, 16.3, 16.5, 16.6, 16.7, 16.8_

  - [ ]* 2.16 Escribir unit tests para componentes de recuperación
    - Test: formulario de recuperación muestra enlace en pantalla
    - Test: mensaje genérico se muestra siempre (no revela si correo existe)
    - Test: token expirado muestra error
    - Test: token inválido muestra error
    - Test: contraseña menor a 8 caracteres muestra error
    - Test: restablecimiento exitoso redirige a login
    - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.8_

  - [ ]* 2.17 Escribir property tests para invalidación de sesiones
    - **Property 60: Invalidación de Sesiones al Cambiar Contraseña**
    - Validar que después de restablecer la contraseña, los tokens JWT antiguos sean rechazados
    - Validar que el campo version_contrasena se incrementa correctamente
    - _Requirements: 16.7_

- [ ] 3. Checkpoint - Verificar autenticación
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 4. Módulo Public Frontend - Catálogos (Developer 2)
  - [ ] 4.1 Crear entidades y repositorios JPA
    - Crear entidad Servicio con anotaciones JPA
    - Crear entidad Producto con anotaciones JPA
    - Crear entidad ImagenGaleria con anotaciones JPA
    - Crear repositorios: ServicioRepository, ProductoRepository, ImagenGaleriaRepository
    - _Requirements: 1.1, 3.1, 2.1_

  - [ ] 4.2 Implementar ServicioInventario
    - Crear @Service con métodos: obtenerServicios(), obtenerProductos(soloDisponibles)
    - Implementar queries JPA para obtener servicios y productos
    - Manejar errores de base de datos con try-catch
    - _Requirements: 1.1, 3.1_

  - [ ] 4.3 Implementar ServicioGaleria
    - Crear @Service con método obtenerImagenes()
    - Implementar query JPA para obtener imágenes con categorías
    - _Requirements: 2.1, 2.3_

  - [ ] 4.4 Implementar endpoints públicos de catálogos
    - Crear @RestController para GET /api/services - retorna todos los servicios
    - Crear endpoint GET /api/products - retorna productos (filtrar por disponible=true si query param presente)
    - Crear endpoint GET /api/gallery - retorna imágenes de galería
    - Validar respuestas con status 200 y formato JSON correcto
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 2.1_

  - [ ]* 4.5 Escribir property tests para catálogos backend
    - **Property 1: Service Catalog Completeness**
    - **Property 4: Product Catalog Completeness**
    - **Property 2: Gallery Image Display**
    - **Property 3: Gallery Organization by Category**
    - **Validates: Requirements 1.1, 1.2, 3.1, 3.2, 2.1, 2.2, 2.3**

  - [ ] 4.6 Crear CatalogoServicios component en React
    - Implementar componente TypeScript que llama GET /api/services
    - Renderizar grid responsive de cards de servicios
    - Mostrar nombre y rango de precio para cada servicio
    - Aplicar estilos modernos y elegantes con Tailwind CSS
    - _Requirements: 1.1, 1.2, 1.3, 12.1, 12.2, 12.3_

  - [ ]* 4.7 Escribir property test para CatalogoServicios display
    - **Property 1: Service Catalog Completeness**
    - **Validates: Requirements 1.1, 1.2**

  - [ ] 4.8 Crear CatalogoProductos component en React
    - Implementar componente que llama GET /api/products?disponible=true
    - Renderizar grid de productos con imagen, nombre, descripción, precio
    - Incluir botón "Añadir al carrito" en cada producto
    - Verificar autenticación antes de permitir agregar al carrito
    - Aplicar diseño responsive y elegante
    - _Requirements: 3.1, 3.2, 3.3, 11.1, 11.2, 11.3, 12.1_

  - [ ]* 4.9 Escribir property test para CatalogoProductos display
    - **Property 4: Product Catalog Completeness**
    - **Property 28: Unavailable Product Filtering**
    - **Property 39: Protección de Carrito para Clientes No Autenticados**
    - **Validates: Requirements 3.1, 3.2, 3.3, 8.5**

  - [ ] 4.10 Crear Galeria component en React
    - Implementar grid de imágenes responsive
    - Implementar modal/lightbox para ver imagen en tamaño completo al hacer click
    - Organizar imágenes por categoría de servicio
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.11 Escribir property test para Gallery
    - **Property 2: Gallery Image Display**
    - **Property 3: Gallery Organization by Category**
    - **Validates: Requirements 2.1, 2.2, 2.3**


- [ ] 5. Módulo Shopping Cart (Developer 2 continúa)
  - [ ] 5.1 Implementar estado de carrito en frontend
    - Crear CartContext o store (React Context/Redux o Vuex)
    - Implementar acciones: addToCart, updateQuantity, removeItem, clearCart
    - Persistir carrito en localStorage para mantener estado entre sesiones
    - _Requirements: 3.3, 3.6, 3.7_

  - [ ] 5.2 Crear ShoppingCart component
    - Implementar sidebar o modal que muestra items del carrito
    - Mostrar cada producto con cantidad, subtotal y controles de cantidad
    - Calcular y mostrar precio total
    - Implementar botones para actualizar cantidad y eliminar items
    - _Requirements: 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.3 Escribir property tests para carrito
    - **Property 5: Add to Cart Operation**
    - **Property 6: Shopping Cart Display Accuracy**
    - **Property 7: Cart Update Consistency**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7**

  - [ ]* 5.4 Escribir unit tests para carrito
    - Test: agregar producto incrementa cantidad si ya existe
    - Test: carrito vacío muestra mensaje apropiado
    - Test: eliminar último item vacía el carrito
    - _Requirements: 3.3, 3.6, 3.7_

  - [ ] 5.5 Integrar botón "Añadir al carrito" en ProductCatalog
    - Conectar ProductCatalog con CartContext
    - Implementar feedback visual al agregar producto (toast/notification)
    - Actualizar contador de items en header/navbar
    - _Requirements: 3.3_

  - [ ] 5.6 Crear entidad OrdenCompra y repositorio
    - Crear entidad OrdenCompra con anotaciones JPA
    - Configurar campo productos como JSONB en PostgreSQL
    - Crear OrdenCompraRepository con Spring Data JPA
    - _Requirements: 17.1, 17.4_

  - [ ] 5.7 Implementar ServicioCheckout
    - Crear @Service con métodos: procesarCheckout, obtenerHistorialOrdenes, generarIdOrden, generarIdTransaccionSimulado
    - Implementar generación de ID de orden con formato ORD-{timestamp}-{random}
    - Implementar generación de ID de transacción simulado con formato SIM-{timestamp}-{random}
    - Implementar serialización de productos a JSONB
    - Validar que metodoPago solo acepte "efectivo" o "simulado_credito"
    - _Requirements: 17.2, 17.3, 17.4, 17.5_

  - [ ] 5.8 Implementar endpoint POST /api/cart/checkout
    - Crear @RestController para POST /api/cart/checkout (requiere autenticación)
    - Validar que el cliente esté autenticado
    - Obtener items del carrito del cliente
    - Validar que el carrito no esté vacío
    - Validar método de pago con @Valid
    - Llamar a ServicioCheckout.procesarCheckout
    - Vaciar carrito después de checkout exitoso
    - Retornar 201 con resultado de checkout
    - _Requirements: 17.2, 17.3, 17.5, 17.6, 17.7_

  - [ ] 5.9 Implementar endpoint GET /api/client/orders
    - Crear endpoint en @RestController para GET /api/client/orders (requiere autenticación)
    - Obtener idCliente del token JWT
    - Llamar a ServicioCheckout.obtenerHistorialOrdenes
    - Retornar lista de órdenes con productos deserializados desde JSONB
    - _Requirements: 17.1_

  - [ ]* 5.10 Escribir property tests para checkout backend
    - **Property 57: Procesamiento de Checkout con Carrito Válido**
    - **Property 58: Protección de Checkout para Clientes No Autenticados**
    - **Validates: Requirements 17.2, 17.3, 17.4, 17.5, 17.6, 17.7**

  - [ ] 5.11 Crear FormularioCheckout component en React
    - Proteger acceso con RutaProtegidaCliente
    - Mostrar resumen de productos del carrito
    - Calcular y mostrar monto total
    - Implementar selector de método de pago (efectivo o simulado_credito)
    - Implementar botón "Finalizar compra"
    - Validar que método de pago esté seleccionado
    - _Requirements: 17.2, 17.3, 17.7_

  - [ ] 5.12 Implementar submit de FormularioCheckout
    - Al submit, llamar POST /api/cart/checkout con token de autenticación
    - Mostrar estado de carga durante procesamiento
    - Redirigir a ConfirmacionCompra en caso de éxito
    - Mostrar errores de validación o procesamiento
    - _Requirements: 17.5, 17.6_

  - [ ] 5.13 Crear ConfirmacionCompra component
    - Mostrar mensaje de éxito con ID de orden
    - Mostrar monto total de la compra
    - Incluir botón para volver al catálogo o ver historial de órdenes
    - _Requirements: 17.6_

  - [ ] 5.14 Crear HistorialOrdenes component
    - Implementar componente que llama GET /api/client/orders
    - Mostrar lista de órdenes con detalles completos
    - Mostrar fecha, ID de orden, productos comprados, monto total
    - Integrar en PanelCliente como nueva sección
    - _Requirements: 17.1_

  - [ ]* 5.15 Escribir property tests y unit tests para checkout frontend
    - **Property 57: Procesamiento de Checkout con Carrito Válido**
    - **Property 58: Protección de Checkout para Clientes No Autenticados**
    - **Property 59: Visualización de Historial de Órdenes**
    - Test: checkout con carrito vacío muestra error
    - Test: checkout sin método de pago muestra error
    - Test: checkout exitoso vacía el carrito
    - Test: usuario no autenticado es redirigido a login
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.5, 17.6, 17.7**

- [ ] 6. Checkpoint - Verificar frontend público
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Módulo de Cliente - Panel y Cancelaciones (Developer 3)
  - [ ] 7.1 Crear entidades JPA para Pago, Reembolso y PoliticaCancelacion
    - Crear entidad Pago con relaciones a Cita y Cliente
    - Crear entidad Reembolso con relaciones a Cita y Pago
    - Crear entidad PoliticaCancelacion
    - Crear repositorios: PagoRepository, ReembolsoRepository, PoliticaCancelacionRepository
    - _Requirements: 15.1, 15.2, 15.6, 15.8, 15.9_

  - [ ] 7.2 Implementar ServicioPago
    - Crear @Service con métodos: procesarPago, registrarPago, obtenerHistorialPagos, generarIdTransaccionSimulado
    - Implementar validación de aceptación de política de cancelación
    - SIMULAR procesamiento de pago (generar ID de transacción simulado con formato SIM-{timestamp}-{random}, sin integración real de pago)
    - Validar que metodoPago solo acepte "efectivo" o "simulado_credito"
    - _Requirements: 15.3, 15.4, 15.5, 15.7_

  - [ ] 7.3 Implementar ServicioCancelacion
    - Crear @Service con métodos: calcularMontoReembolso, cancelarCita, obtenerPoliticaCancelacion, validarTiempoAnticipacion
    - Implementar lógica de cálculo de reembolso según horas de anticipación (≥24h=100%, <24h=50%, mismo día=0%)
    - Implementar registro de cancelación en auditoría
    - _Requirements: 14.7, 15.2, 15.6, 15.8, 15.12_

  - [ ] 7.4 Implementar ServicioReembolso
    - Crear @Service con métodos: procesarReembolso, verificarEstadoReembolso, notificarErrorReembolso, mostrarConfirmacionReembolso, generarIdTransaccionSimulado
    - SIMULAR procesamiento de reembolso (solo actualizar base de datos con ID de transacción simulado, sin procesamiento real)
    - Implementar notificación al admin en caso de error: registrar en logs del servidor Y mostrar notificación visual en Panel_Admin (sin envío de email)
    - Implementar confirmación al cliente: mostrar mensaje en pantalla (toast/alert) Y registrar en logs del servidor (sin envío de email)
    - _Requirements: 15.7, 15.9, 15.10, 15.11_

  - [ ] 7.5 Implementar endpoints de panel de cliente
    - Crear @RestController para GET /api/client/appointments (requiere autenticación)
    - Soportar filtrado por estado (pendiente, completada, cancelada)
    - Crear endpoint GET /api/client/appointments/:id
    - Crear endpoint GET /api/client/profile
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 7.6 Implementar endpoints de cancelación y reembolso
    - Crear @RestController para GET /api/cancellation/policy
    - Crear endpoint POST /api/cancellation/calculate-refund (requiere autenticación)
    - Crear endpoint POST /api/cancellation/cancel-appointment (requiere autenticación)
    - Validar que la cita pertenezca al cliente autenticado
    - Crear endpoint GET /api/refund/status/:idReembolso
    - _Requirements: 14.5, 14.6, 14.7, 14.8, 14.9, 15.1, 15.6, 15.7_

  - [ ] 7.7 Implementar endpoints de pago
    - Crear @RestController para POST /api/payment/process (requiere autenticación)
    - Validar que aceptaPoliticaCancelacion sea true
    - Crear endpoint GET /api/payment/history
    - _Requirements: 15.3, 15.4, 15.5_

  - [ ]* 7.8 Escribir property tests para módulo de cliente backend
    - **Property 43: Visualización de Citas del Cliente**
    - **Property 44: Completitud de Detalles de Cita**
    - **Property 45: Cálculo Correcto de Monto de Reembolso**
    - **Property 46: Visualización de Política de Cancelación Antes del Pago**
    - **Property 47: Obligatoriedad de Aceptación de Política**
    - **Property 48: Procesamiento Automático de Reembolso**
    - **Property 49: Confirmación de Cancelación en Pantalla y Logs**
    - **Property 50: Notificación de Error de Reembolso al Admin**
    - **Property 51: Auditoría de Cancelaciones y Reembolsos**
    - **Validates: Requirements 14.1-14.10, 15.1-15.12**

  - [ ] 7.9 Crear PanelCliente component en React
    - Implementar dashboard principal del cliente autenticado
    - Crear navegación entre secciones: Citas, Perfil, Historial
    - Proteger con RutaProtegidaCliente
    - _Requirements: 14.1, 14.2_

  - [ ] 7.10 Crear ListaCitasCliente component
    - Implementar tabs para tres categorías: Activas/Próximas, Historial, Canceladas
    - Mostrar detalles completos de cada cita (servicio, fecha, hora, estado, monto pagado, monto reembolsado)
    - Incluir botón "Cancelar Cita" para citas activas
    - _Requirements: 14.3, 14.4, 14.5_

  - [ ] 7.11 Crear ModalCancelacionCita component
    - Implementar modal de confirmación de cancelación
    - Llamar a POST /api/cancellation/calculate-refund para obtener monto de reembolso
    - Mostrar monto y porcentaje de reembolso
    - Confirmar cancelación llamando a POST /api/cancellation/cancel-appointment
    - _Requirements: 14.6, 14.7, 14.8, 14.9_

  - [ ] 7.12 Crear PoliticaCancelacion component
    - Implementar componente que muestra política completa
    - Incluir checkbox obligatorio de aceptación
    - Prevenir pago si no se acepta la política
    - Integrar en flujo de pago
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 7.13 Escribir property tests para componentes de cliente
    - **Property 43: Visualización de Citas del Cliente**
    - **Property 44: Completitud de Detalles de Cita**
    - **Property 45: Cálculo Correcto de Monto de Reembolso**
    - **Property 47: Obligatoriedad de Aceptación de Política**
    - **Validates: Requirements 14.1-14.9, 15.3-15.5**

  - [ ]* 7.14 Escribir unit tests para módulo de cliente
    - Test: citas se organizan correctamente por categoría
    - Test: botón cancelar solo aparece en citas activas
    - Test: modal muestra monto correcto de reembolso
    - Test: pago sin aceptar política muestra error
    - _Requirements: 14.3, 14.5, 14.7, 15.5_

  - [ ]* 7.19 Escribir property tests para edición de perfil
    - **Property 61: Actualización de Perfil de Cliente**
    - Validar que los campos se actualizan correctamente
    - Validar que el correo duplicado es rechazado con 409
    - Validar que campos opcionales no sobrescriben datos existentes
    - _Requirements: 14.11_

- [ ] 8. Checkpoint - Verificar módulo de cliente
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Módulo Booking System (Developer 4)
  - [ ] 9.1 Actualizar entidad Cita para incluir relación con Cliente
    - Modificar entidad Cita para incluir @ManyToOne con Cliente
    - Actualizar CitaRepository con queries personalizadas
    - _Requirements: 4.10, 14.4_

  - [ ] 9.2 Implementar ServicioReservas
    - Crear @Service con métodos: crearCita(idCliente, datosCita), obtenerFranjasDisponibles, obtenerCitasCliente, estaFranjaDisponible
    - Implementar lógica de slots disponibles (9:00-18:00, intervalos de 1 hora)
    - Verificar que slot no esté ocupado antes de crear cita
    - Asociar cita con cliente autenticado
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 4.8, 4.10_

  - [ ] 9.3 Implementar endpoint GET /api/appointments/available-slots
    - Validar query params: fecha (YYYY-MM-DD) y idServicio requeridos
    - Calcular slots disponibles excluyendo citas existentes
    - Retornar array de FranjaHoraria con hora y disponible
    - _Requirements: 4.5, 4.6_

  - [ ]* 9.4 Escribir property test para available slots
    - **Property 10: Available Slots Display**
    - **Validates: Requirements 4.5, 4.6**

  - [ ] 9.5 Implementar endpoint POST /api/appointments (requiere autenticación de cliente)
    - Validar que el cliente esté autenticado (retornar 401 si no)
    - Obtener idCliente del token JWT
    - Validar campos requeridos: idServicio, fecha, hora
    - Validar formato de fecha (LocalDate) y hora (LocalTime)
    - Validar que fecha sea futura
    - Verificar que slot esté disponible (constraint cita_unica)
    - Crear cita asociada al cliente autenticado
    - Retornar 201 con cita creada o 409 si slot no disponible
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8, 4.10_

  - [ ]* 9.6 Escribir property tests para booking backend
    - **Property 8: Booking Form Validation**
    - **Property 9: Valid Appointment Creation**
    - **Property 11: Appointment Persistence Round-Trip**
    - **Property 40: Protección de Reservas para Clientes No Autenticados**
    - **Property 41: Auto-completado de Datos de Cliente en Reserva**
    - **Property 42: Asociación de Cita con Cliente Autenticado**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7, 4.8, 4.10**

  - [ ] 9.7 Crear FormularioReserva component en React
    - Proteger acceso con RutaProtegidaCliente (redirigir a login si no autenticado)
    - Obtener automáticamente nombre y teléfono del cliente autenticado desde AuthContext
    - Implementar formulario con campos: servicio, fecha, hora (nombre y teléfono auto-completados y readonly)
    - Implementar validación en tiempo real
    - Al seleccionar fecha, llamar GET /api/appointments/available-slots
    - Mostrar solo slots disponibles para selección
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 9.8 Implementar submit de FormularioReserva
    - Al submit, llamar POST /api/appointments con token de autenticación
    - Mostrar mensaje de confirmación en caso de éxito
    - Mostrar errores de validación o conflicto (slot no disponible)
    - Limpiar formulario después de reserva exitosa
    - _Requirements: 4.3, 4.7_

  - [ ]* 9.9 Escribir property tests para FormularioReserva
    - **Property 8: Booking Form Validation**
    - **Property 9: Valid Appointment Creation**
    - **Property 40: Protección de Reservas para Clientes No Autenticados**
    - **Property 41: Auto-completado de Datos de Cliente en Reserva**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7**

  - [ ]* 9.10 Escribir unit tests para FormularioReserva
    - Test: usuario no autenticado es redirigido a login
    - Test: nombre y teléfono se auto-completan desde perfil
    - Test: fecha pasada muestra error
    - Test: reserva exitosa muestra confirmación
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

- [ ] 10. Checkpoint - Verificar sistema de reservas
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Módulo Admin - Calendar Management (Developer 3 continúa)
  - [ ] 11.1 Extender BookingService para admin
    - Crear método getAppointments(filters) que acepta startDate y endDate
    - Crear método updateAppointmentStatus(id, status)
    - Implementar queries SQL con filtros opcionales de fecha
    - _Requirements: 6.1, 6.4, 6.5, 6.7_

  - [ ] 11.2 Implementar endpoints admin de appointments
    - Crear GET /api/admin/appointments con autenticación requerida
    - Soportar query params startDate y endDate para filtrado
    - Crear PATCH /api/admin/appointments/:id/status
    - Validar status: 'completed' o 'cancelled'
    - Retornar 404 si appointment no existe
    - _Requirements: 6.1, 6.4, 6.5, 6.7_

  - [ ]* 11.3 Escribir property tests para calendar backend
    - **Property 16: Calendar Appointment Display**
    - **Property 18: Appointment Status Update**
    - **Property 19: Appointment Cancellation**
    - **Property 20: Appointment Date Range Filtering**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.7**

  - [ ] 11.4 Crear VistaCalendario component
    - Implementar vista de calendario que llama GET /api/admin/appointments
    - Mostrar appointments organizados cronológicamente por fecha y hora
    - Mostrar detalles completos: cliente, teléfono, servicio, fecha, hora
    - Destacar visualmente citas del día actual
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

  - [ ] 11.5 Implementar acciones de calendario
    - Agregar botón "Marcar como completada" que llama PATCH con status='completed'
    - Agregar botón "Cancelar" que llama PATCH con status='cancelled'
    - Implementar filtro de rango de fechas
    - Actualizar vista después de cada acción
    - _Requirements: 6.4, 6.5, 6.7_

  - [ ]* 11.6 Escribir property test para VistaCalendario
    - **Property 16: Calendar Appointment Display**
    - **Property 17: Appointment Chronological Ordering**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 11.7 Escribir unit tests para calendar
    - Test: appointments se ordenan por fecha y hora
    - Test: marcar como completada actualiza estado
    - Test: filtro de fechas muestra solo appointments en rango
    - _Requirements: 6.2, 6.4, 6.7_


- [ ] 12. Checkpoint - Verificar calendario admin
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 13. Módulo Admin - Inventory Management (Developer 4)
  - [ ] 13.1 Extender ServicioInventario para admin
    - Crear método actualizarPrecioServicio(id, precio) con validación de precio positivo
    - Crear método actualizarProducto(id, actualizaciones) con validación
    - Implementar queries SQL UPDATE con validaciones
    - _Requirements: 7.2, 7.3, 8.2, 8.4_

  - [ ] 13.2 Implementar endpoints admin de inventory
    - Crear PUT /api/admin/services/:id/price con autenticación
    - Validar que price sea número positivo
    - Crear PUT /api/admin/products/:id con autenticación
    - Validar price positivo si se incluye
    - Retornar 400 para validaciones fallidas, 404 si no existe
    - _Requirements: 7.2, 7.3, 7.5, 8.2, 8.3, 8.4, 8.6_

  - [ ]* 13.3 Escribir property tests para inventory backend
    - **Property 22: Service Price Validation**
    - **Property 23: Service Price Update Round-Trip**
    - **Property 25: Product Price Validation**
    - **Property 26: Product Availability Toggle**
    - **Property 27: Product Update Round-Trip**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 8.2, 8.3, 8.4, 8.6**

  - [ ] 13.4 Crear GestorPrecios component
    - Implementar lista de servicios con precios editables
    - Agregar campo de input para editar precio
    - Implementar botón "Guardar" que llama PUT /api/admin/services/:id/price
    - Validar precio positivo antes de enviar
    - Mostrar mensajes de error o éxito
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ]* 13.5 Escribir property test para GestorPrecios
    - **Property 21: Service Price Display**
    - **Property 22: Service Price Validation**
    - **Validates: Requirements 7.1, 7.2, 7.5**

  - [ ] 13.6 Crear GestorInventario component
    - Implementar tabla de productos con columnas: nombre, precio, disponibilidad
    - Agregar controles inline para editar precio y toggle disponibilidad
    - Implementar llamadas a PUT /api/admin/products/:id
    - Validar precio positivo
    - Actualizar vista después de cambios
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [ ]* 13.7 Escribir property test para GestorInventario
    - **Property 24: Product Information Display**
    - **Property 25: Product Price Validation**
    - **Property 26: Product Availability Toggle**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.6**

  - [ ]* 13.8 Escribir unit tests para inventory management
    - Test: precio negativo muestra error y no actualiza
    - Test: precio cero muestra error
    - Test: toggle availability cambia estado
    - _Requirements: 7.5, 8.6_

  - [ ] 13.9 Verificar sincronización con frontend público
    - Verificar que cambios de precio en admin se reflejan en CatalogoServicios
    - Verificar que productos marcados como no disponibles desaparecen de CatalogoProductos
    - _Requirements: 7.4, 8.5_

  - [ ]* 13.10 Escribir property test para sincronización
    - **Property 23: Service Price Update Round-Trip**
    - **Property 28: Unavailable Product Filtering**
    - **Validates: Requirements 7.4, 8.5**

  - [ ] 13.11 Crear tabla notificaciones_admin
    - Agregar tabla notificaciones_admin al schema de base de datos
    - _Requirements: 15.11_

  - [ ] 13.12 Implementar ServicioNotificacionesAdmin
    - Crear @Service con métodos: crearNotificacion, obtenerNotificaciones, marcarComoLeida
    - _Requirements: 15.11_

  - [ ] 13.13 Implementar endpoints de notificaciones admin
    - Crear GET /api/admin/notifications con autenticación
    - Crear PATCH /api/admin/notifications/:id/read con autenticación
    - _Requirements: 15.11_

  - [ ] 13.14 Crear componente NotificacionesAdmin en React
    - Icono de campana en header del Panel_Admin
    - Badge con cantidad de notificaciones no leídas
    - Dropdown con lista de notificaciones al hacer clic
    - Botón "Marcar como leída" por notificación
    - _Requirements: 15.11_

  - [ ] 13.15 Integrar notificaciones en ServicioReembolso
    - Al fallar un reembolso, llamar a ServicioNotificacionesAdmin.crearNotificacion con tipo 'error'
    - _Requirements: 15.11_


- [ ] 14. Módulo Admin - Task Management (Developer 4 continúa)
  - [ ] 14.1 Implementar ServicioTareas backend
    - Crear métodos: obtenerTareas(estado), crearTarea(descripcion), actualizarEstadoTarea(id, completada), eliminarTarea(id)
    - Implementar queries SQL para CRUD de tareas
    - Validar que descripcion no esté vacía en crearTarea
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ] 14.2 Implementar endpoints admin de tareas
    - Crear GET /api/admin/tasks con autenticación
    - Soportar query param status=pending|completed
    - Crear POST /api/admin/tasks con validación de description
    - Crear PATCH /api/admin/tasks/:id para actualizar completed
    - Crear DELETE /api/admin/tasks/:id
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 14.3 Escribir property tests para tasks backend
    - **Property 29: Task List Display**
    - **Property 30: Task Creation Validation**
    - **Property 31: Task Status Update Round-Trip**
    - **Property 33: Task Deletion**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**

  - [ ] 14.4 Crear ListaTareas component
    - Implementar lista que llama GET /api/admin/tasks
    - Mostrar tareas separadas en dos secciones: pendientes y completadas
    - Agregar formulario para crear nueva tarea
    - Implementar checkbox para marcar como completada (PATCH)
    - Agregar botón eliminar (DELETE)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 14.5 Escribir property test para ListaTareas
    - **Property 29: Task List Display**
    - **Property 32: Task Separation by Status**
    - **Validates: Requirements 9.1, 9.4**

  - [ ]* 14.6 Escribir unit tests para tasks
    - Test: crear tarea sin descripción muestra error
    - Test: marcar tarea como completada la mueve a sección completadas
    - Test: eliminar tarea la remueve de la lista
    - _Requirements: 9.2, 9.3, 9.5_

- [ ] 15. Checkpoint - Verificar panel admin completo
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 16. Integración y UI/UX (Todos los developers)
  - [ ] 16.1 Crear layout y navegación principal
    - Implementar Header/Navbar con logo y navegación
    - Crear rutas para páginas públicas: Home, Servicios, Galería, Productos, Reservar
    - Crear rutas para admin: /admin/login, /admin/calendar, /admin/inventory, /admin/tasks
    - Implementar navegación responsive con menú hamburguesa para móvil
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ] 16.2 Aplicar diseño moderno y elegante
    - Definir paleta de colores apropiada para salón de belleza
    - Implementar tipografía elegante y espaciado consistente
    - Agregar transiciones y animaciones suaves (hover, page transitions)
    - Aplicar CSS moderno (Flexbox/Grid para layouts)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 16.3 Implementar responsive design
    - Verificar y ajustar layouts para desktop (1920x1080+)
    - Verificar y ajustar layouts para tablet (768x1024)
    - Verificar y ajustar layouts para móvil (375x667+)
    - Optimizar interacciones táctiles para móvil
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 16.4 Implementar manejo de errores frontend
    - Crear componente ErrorBoundary para errores de React/Vue
    - Implementar toast/notification system para feedback de usuario
    - Agregar estados de loading en todas las llamadas API
    - Mostrar mensajes de error user-friendly en español
    - _Requirements: 4.4, 4.7, 7.5, 8.6_

  - [ ] 16.5 Implementar manejo de errores backend
    - Crear middleware de manejo de errores global
    - Implementar formato consistente de respuestas de error
    - Agregar logging de errores con stack traces
    - Implementar validación de requests con mensajes claros
    - _Requirements: 4.4, 7.5, 8.6_

  - [ ]* 16.6 Escribir integration tests end-to-end
    - Test: flujo completo de reserva de cita
    - Test: flujo de agregar productos al carrito
    - Test: flujo de login admin y gestión de calendario
    - Test: flujo de actualización de precios
    - _Requirements: 4.3, 3.3, 5.2, 7.3_

- [ ] 17. Testing y validación final
  - [ ] 17.1 Configurar jqwik para property-based testing en Java
    - Instalar jqwik en proyecto Spring Boot
    - Crear Arbitraries custom para domain objects (Servicio, Producto, Cita, Cliente, Tarea, Pago, Reembolso, TokenRecuperacionContrasena, OrdenCompra)
    - Configurar tries: 100 para todos los property tests
    - Agregar tags de feature y property en comentarios
    - _Requirements: Todas las propiedades 1-61_

  - [ ] 17.2 Ejecutar suite completa de property tests
    - Verificar que las 61 propiedades de correctitud pasen
    - Documentar cualquier fallo y corregir
    - Aumentar tries a 500 para validación exhaustiva
    - _Requirements: Todas las propiedades 1-61_

  - [ ]* 17.3 Ejecutar suite completa de unit tests
    - Verificar cobertura mínima de 80% en backend (JaCoCo)
    - Verificar cobertura mínima de 80% en frontend (Jest)
    - Corregir tests fallidos
    - _Requirements: Todos los requisitos_

  - [ ] 17.4 Verificar persistencia de datos
    - Reiniciar servidor Spring Boot y verificar que datos persisten
    - Verificar que citas se mantienen después de reinicio
    - Verificar que cambios de precios persisten
    - Verificar que tareas persisten
    - Verificar que clientes y pagos persisten
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 17.5 Testing manual de flujos críticos
    - Probar flujo completo de registro e inicio de sesión de cliente
    - Probar flujo de recuperación de contraseña (solicitud, validación de token, restablecimiento)
    - Probar flujo de reserva desde frontend público (con autenticación)
    - Probar flujo de cancelación de cita con reembolso
    - Probar visualización de política de cancelación antes de pago
    - Probar flujo completo de checkout: agregar productos → carrito → checkout → confirmación
    - Probar historial de órdenes en panel de cliente
    - Probar login admin y gestión de calendario
    - Probar actualización de precios y verificar en frontend público
    - Probar gestión de productos y disponibilidad
    - Probar gestión de tareas
    - _Requirements: Todos los requisitos funcionales_

- [ ] 18. Checkpoint final - Sistema completo
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad completa
- Los checkpoints aseguran validación incremental del progreso
- Los property tests validan las 61 propiedades de correctitud universales
- Los unit tests validan ejemplos específicos y casos edge
- Los 6 módulos principales pueden desarrollarse en paralelo:
  - Developer 1: Módulo de Autenticación Admin y Cliente (tareas 2.x)
  - Developer 2: Public Frontend, Shopping Cart y Checkout (tareas 4.x, 5.x)
  - Developer 3: Módulo de Cliente - Panel y Cancelaciones (tareas 7.x)
  - Developer 4: Booking System (tareas 9.x)
  - Developers 3 y 4: Admin - Calendar Management (tareas 11.x), Admin - Inventory Management (tareas 13.x), Admin - Task Management (tareas 14.x)
- Todos colaboran en Setup inicial (tarea 1.x) e Integración final (tareas 16.x, 17.x, 18.x)

## Property-Based Testing Configuration

Todos los property tests deben usar jqwik (Java) con la siguiente configuración:

```java
// Feature: antonela-art-salon-system, Propiedad {N}: {Título de Propiedad}
@Property
void nombreDelTest(@ForAll("generador") TipoDato dato) {
  // Implementación del test
}

@Provide
Arbitrary<TipoDato> generador() {
  // Implementación del generador
}
```

Los Arbitraries (generadores) custom recomendados incluyen:
- `servicios()` - genera objetos Servicio válidos
- `productos()` - genera objetos Producto válidos
- `datosCita()` - genera datos de cita válidos
- `cliente()` - genera objetos Cliente válidos
- `tareas()` - genera objetos Tarea válidos
- `pagos()` - genera objetos Pago válidos
- `reembolsos()` - genera objetos Reembolso válidos

## Testing Strategy Summary

- **Property-based tests**: 61 propiedades implementadas con jqwik (100+ iteraciones cada una)
- **Unit tests**: Cobertura mínima 80%, enfocados en ejemplos específicos y edge cases
- **Integration tests**: Todos los endpoints API probados end-to-end con Spring Boot Test
- **E2E tests**: Flujos críticos de usuario validados con Playwright/Cypress
- **Manual testing**: Validación final de UX y flujos completos

## Development Workflow

1. Cada developer trabaja en su módulo asignado
2. Commits frecuentes con mensajes descriptivos en español
3. Pull requests revisados por al menos otro developer
4. Todos los tests deben pasar antes de merge
5. Checkpoints permiten sincronización del equipo
6. Integración final se hace colaborativamente

## Stack Tecnológico Resumen

- **Backend**: Java 17+ con Spring Boot 3.x
- **Frontend**: TypeScript con React 18+
- **Base de Datos**: PostgreSQL 14+ (nombres en español)
- **Autenticación**: JWT con Spring Security
- **ORM**: Spring Data JPA / Hibernate
- **Testing Backend**: JUnit 5 + jqwik + Mockito
- **Testing Frontend**: Jest + React Testing Library
- **E2E Testing**: Playwright o Cypress
- **Build Tools**: Maven o Gradle (backend), npm/yarn (frontend)
- **Estilos**: Tailwind CSS o CSS Modules
