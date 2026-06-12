# Distribución de Tareas — Antonela Art Salon

Objetivo: llegar al **Checkpoint 10** (Módulo Booking funcional).

---

## Developer 1 — Shopping Cart BACKEND (5 tareas)

### Tasks
| # | Task | Archivos a crear |
|---|------|------------------|
| 5.6 | Entidad OrdenCompra + repositorio | `entity/OrdenCompra.java`, `repository/OrdenCompraRepository.java` |
| 5.7 | ServicioCheckout | `service/CheckoutService.java` |
| 5.8 | POST /api/cart/checkout | `controller/CartController.java` |
| 5.9 | GET /api/client/orders | `controller/CartController.java` |
| 7.7 | POST /api/payment/process + GET /api/payment/history | `controller/PagoController.java` |

### Cómo implementarlo

**5.6 — OrdenCompra entity:**
```java
@Entity @Table(name = "ordenes_compra")
public class OrdenCompra {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "id_cliente")
    private Cliente cliente;
    @Column(columnDefinition = "JSONB")
    private String productos; // JSON array de productos
    private BigDecimal montoTotal;
    private String metodoPago; // "efectivo" o "simulado_credito"
    private String estado;
    private String idTransaccionSimulada; // SIM-{timestamp}-{random}
    private LocalDateTime creadoEn;
}
```

**5.7 — CheckoutService:**
- `procesarCheckout(Cliente cliente, List<CartItem> items, String metodoPago)`:
  - Validar que carrito no esté vacío
  - Validar metodoPago sea "efectivo" o "simulado_credito"
  - Generar ID orden: `ORD-{timestamp}-{random}`
  - Generar ID transacción: `SIM-{timestamp}-{random}`
  - Serializar productos a JSON
  - Guardar en BD
- Inyectar `ClienteRepository` si necesitas obtener el cliente

**5.8 — POST /api/cart/checkout:**
- Requiere autenticación (el JWT filter ya valida)
- Obtener `idCliente` del token: `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` (es un Long)
- Recibir en body: `{ "productos": [...], "metodoPago": "efectivo" }`
- Retornar 201 con la orden creada

**5.9 — GET /api/client/orders:**
- Requiere auth, obtiene idCliente del token
- Retorna lista de órdenes del cliente

**7.7 — Payment endpoints:**
- `POST /api/payment/process` → recibe idCita, metodoPago, genera `SIM-{ts}-{rand}`
- `GET /api/payment/history` → retorna pagos del cliente autenticado

---

## Developer 2 — Shopping Cart FRONTEND (7 tareas)

### Tasks
| # | Task | Archivos |
|---|------|----------|
| 5.1 | CartContext | `src/contexts/CartContext.tsx` |
| 5.2 | ShoppingCart component | `src/components/CartSidebar.tsx` |
| 5.5 | Integrar botón Añadir + contador | modificar `Products.tsx` y `Navbar.tsx` |
| 5.11 | FormularioCheckout | `src/pages/shop/Checkout.tsx` |
| 5.12 | Submit checkout | modificar `Checkout.tsx` |
| 5.13 | ConfirmacionCompra | `src/pages/shop/Confirmacion.tsx` |
| 5.14 | HistorialOrdenes | `src/pages/shop/HistorialOrdenes.tsx` |

### Cómo implementarlo

**5.1 — CartContext:**
```tsx
interface CartItem {
  producto: Producto;
  cantidad: number;
}
interface CartContextType {
  items: CartItem[];
  addToCart: (producto: Producto) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: number;
}
```
- Persistir en `localStorage` con `useEffect`
- `addToCart`: si ya existe, incrementar cantidad; si no, agregar con cantidad 1

**5.2 — ShoppingCart:**
- Sidebar o modal que se abre desde navbar
- Muestra: imagen, nombre, cantidad, subtotal
- Botones: + / - / eliminar
- Total general al pie

**5.5 — Integración:**
- En `ProductCard` (Products.tsx): `onClick={() => addToCart(producto)}`
- En `Navbar`: `<span>{cartItems.length}</span>` como badge

**5.11-5.12 — Checkout:**
- Formulario: resumen carrito + selector método pago (efectivo/simulado_credito)
- Submit: `POST /api/cart/checkout` con axios (api service)
- Enviar token JWT (el interceptor de api.ts ya lo hace)

**5.13 — ConfirmacionCompra:**
- Recibir ID de orden y monto total (via location state o URL params)
- Mostrar mensaje de éxito + botón "Volver al catálogo"

**5.14 — HistorialOrdenes:**
- `GET /api/client/orders` al montar
- Tabla con: fecha, ID orden, productos, monto

---

## Developer 3 — Módulo Cliente BACKEND (6 tareas)

### Tasks
| # | Task | Archivos |
|---|------|----------|
| 7.1 | Entidades Pago, Reembolso, PoliticaCancelacion + repos | `entity/`, `repository/` |
| 7.2 | ServicioPago | `service/PagoService.java` |
| 7.3 | ServicioCancelacion | `service/CancelacionService.java` |
| 7.4 | ServicioReembolso | `service/ReembolsoService.java` |
| 7.5 | GET /api/client/appointments + /api/client/profile | `controller/ClienteController.java` |
| 7.6 | POST /api/cancellation/calculate-refund + /cancel-appointment | `controller/CancelacionController.java` |

### Cómo implementarlo

**7.1 — Entidades (ya existen en el proyecto):**
- `Pago.java` — id, cita (ManyToOne), cliente (ManyToOne), metodoPago, monto, estado, idTransaccionSimulada
- `Reembolso.java` — id, cita (ManyToOne), pago (ManyToOne), montoReembolsado, porcentajeReembolso, estado, idTransaccionSimulada, mensajeError
- `PoliticaCancelacion.java` — id, horasAnticipacionMinimas, porcentajeReembolso, descripcion, activa

**7.2 — PagoService:**
- `procesarPago(Cita cita, Cliente cliente, String metodoPago)`:
  - Validar metodoPago sea "efectivo" o "simulado_credito"
  - Generar `SIM-{timestamp}-{random}`
  - Guardar Pago con estado "completado"

**7.3 — CancelacionService:**
- `calcularMontoReembolso(Cita cita)`:
  - Obtener horas de anticipación: `ChronoUnit.HOURS.between(cita.getFechaCita(), LocalDate.now())`
  - Buscar en `PoliticaCancelacion` el porcentaje según horas
  - ≥ 24h → 100%, < 24h → 50%, mismo día → 0%
  - Retornar monto calculado

**7.4 — ReembolsoService:**
- `procesarReembolso(Pago pago, BigDecimal monto, int porcentaje)`:
  - Crear Reembolso con estado "procesado"
  - Generar `SIM-{timestamp}-{random}`
  - Registrar en `NotificacionAdmin` si falla

**7.5 — Endpoints de cliente:**
- `GET /api/client/appointments?estado=pendiente` → lista citas del cliente auth
- `GET /api/client/profile` → datos del cliente auth

**7.6 — Endpoints de cancelación:**
- `POST /api/cancellation/calculate-refund` → body: `{ idCita }`, retorna monto y %
- `POST /api/cancellation/cancel-appointment` → body: `{ idCita }`, ejecuta cancelación + reembolso
- Validar que la cita pertenezca al cliente autenticado

---

## Developer 4 — Booking + Panel Cliente FRONTEND (8 tareas)

### Tasks
| # | Task | Archivos |
|---|------|----------|
| 9.2 | ServicioReservas | `service/ReservaService.java` |
| 9.3 | GET /api/appointments/available-slots | `controller/ReservaController.java` |
| 9.5 | POST /api/appointments | `controller/ReservaController.java` |
| 9.7 | FormularioReserva | `src/pages/shop/Booking.tsx` (mejorar) |
| 9.8 | Submit reserva + confirmación | modificar `Booking.tsx` |
| 7.9 | PanelCliente dashboard | `src/pages/client/ClientPanel.tsx` |
| 7.10 | ListaCitasCliente | `src/components/ListaCitasCliente.tsx` |
| 7.11 | ModalCancelacionCita | `src/components/ModalCancelacion.tsx` |
| 7.12 | PoliticaCancelacion component | `src/components/PoliticaCancelacion.tsx` |

### Cómo implementarlo

**9.2 — ReservaService:**
- `obtenerFranjasDisponibles(LocalDate fecha, Long idServicio)`:
  - Generar slots de 9:00 a 18:00 (intervalos de 1 hora)
  - Consultar citas existentes en esa fecha
  - Marcar como no disponibles los slots ocupados
- `crearCita(Long idCliente, CrearCitaRequest request)`:
  - Validar fecha futura
  - Validar slot no ocupado (consultar BD)
  - Guardar cita con estado "pendiente"

**9.3 — GET /api/appointments/available-slots?fecha=2026-06-01&idServicio=1:**
- Retorna `[{ "hora": "09:00", "disponible": true }, ...]`
- No requiere autenticación

**9.5 — POST /api/appointments:**
- Requiere auth de cliente
- Body: `{ idServicio, fecha, hora }`
- Validar que fecha sea futura
- Validar slot disponible (si no, 409 Conflict)
- Asociar cita con idCliente del token

**9.7 — FormularioReserva (Booking.tsx):**
- Ya tiene UI de calendario visual, hay que conectarla al backend
- Al seleccionar fecha: `GET /api/appointments/available-slots`
- Mostrar solo slots disponibles
- Auto-completar nombre y teléfono desde `AuthContext`

**9.8 — Submit:**
- `POST /api/appointments` con token JWT
- Mostrar confirmación o error

**7.9 — PanelCliente:**
- Dashboard con tabs: Mis Citas, Perfil, Historial de Compras

**7.10 — ListaCitasCliente:**
- 3 tabs: Activas/Próximas, Historial, Canceladas
- Cada cita muestra: servicio, fecha, hora, estado, monto
- Botón "Cancelar" solo en citas activas

**7.11 — ModalCancelacion:**
- Al hacer click en "Cancelar", mostrar modal
- Llamar `POST /api/cancellation/calculate-refund` para obtener monto
- Mostrar monto y % de reembolso
- Confirmar → `POST /api/cancellation/cancel-appointment`

**7.12 — PoliticaCancelacion:**
- Mostrar texto de política
- Checkbox obligatorio "Acepto la política de cancelación"
- Prevenir pago si no está aceptado

---

## 🚀 Flujo de Trabajo en GitHub

### 1. Issues
- Por cada task crear **un issue** en GitHub
- Título claro: `[Módulo] Nombre de la tarea`
  - Ejemplo: `[Cart] Implementar CartContext en frontend`
  - Ejemplo: `[Booking] Crear endpoint available-slots`

### 2. Tags (Labels) por issue
Usar estos tags para identificar cada issue:

| Tag | Color | Cuándo usarlo |
|-----|-------|---------------|
| `backend` | 🔵 azul | Tareas del backend Java |
| `frontend` | 🟢 verde | Tareas del frontend React |
| `bug` | 🔴 rojo | Si encuentran un error |
| `enhancement` | 🟣 morado | Mejora sobre código existente |
| `high priority` | 🟠 naranja | Tasks críticas para el checkpoint |

### 3. Ramas con buen nombre
Formato: **`tipo/numero-issue-descripcion-breve`**

| Tipo | Cuándo | Ejemplo |
|------|--------|---------|
| `feat/` | Nueva funcionalidad | `feat/12-cart-context` |
| `fix/` | Corrección de bug | `fix/15-error-checkout` |
| `refactor/` | Refactorización | `refactor/20-pago-service` |

**NO USAR:** `mi-rama`, `cambios`, `asd123`, `developersote`, `nuevo`

### 4. Sub-ramas (por feature)
Cada developer crea su rama desde `main`:

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear rama para tu task
git checkout -b feat/23-cart-checkout-endpoint

# 3. Trabajar normalmente
git add .
git commit -m "feat: agregar endpoint POST /api/cart/checkout"

# 4. Subir
git push origin feat/23-cart-checkout-endpoint

# 5. Crear Pull Request en GitHub
#    - Título: mismo que el issue
#    - Descripción: "Closes #23" (para linkear el issue)
#    - Asignar reviewer a otro developer
```

### 5. Pull Requests
- Asignar **reviewer** a otro developer (no a uno mismo)
- Título descriptivo: `feat: implementar checkout de carrito`
- En descripción: `Closes #{numero-de-issue}`
- Esperar aprobación antes de mergear

### 6. Commits
Formato: `tipo: mensaje en español`

```
feat: agregar endpoint available-slots
fix: corregir cálculo de reembolso para mismo día
refactor: extraer validación de método de pago
```
