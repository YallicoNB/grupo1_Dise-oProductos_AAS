-- ============================================================
-- Antonela Art Salon - Inicializacion de Base de Datos
-- ============================================================

-- Crear base de datos (ejecutar manualmente si es necesario)
CREATE DATABASE antonela_art_salon;

-- ============================================================
-- TABLAS
-- ============================================================

-- 1. servicios
CREATE TABLE IF NOT EXISTS servicios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_minimo DECIMAL(10,2) NOT NULL,
    precio_maximo DECIMAL(10,2),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    url_imagen TEXT,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(200) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    version_contrasena BIGINT NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. usuarios_admin
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. citas
CREATE TABLE IF NOT EXISTS citas (
    id BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    id_servicio BIGINT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    monto_pagado DECIMAL(10,2),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cita_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id),
    CONSTRAINT fk_cita_servicio FOREIGN KEY (id_servicio) REFERENCES servicios(id),
    CONSTRAINT cita_unica UNIQUE (fecha_cita, hora_cita)
);

-- 6. pagos
CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    id_cita BIGINT NOT NULL,
    id_cliente BIGINT NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'completado',
    id_transaccion_simulada VARCHAR(100),
    preference_id VARCHAR(255),
    mercado_pago_payment_id BIGINT,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_cita FOREIGN KEY (id_cita) REFERENCES citas(id),
    CONSTRAINT fk_pago_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

-- 7. reembolsos
CREATE TABLE IF NOT EXISTS reembolsos (
    id BIGSERIAL PRIMARY KEY,
    id_cita BIGINT NOT NULL,
    id_pago BIGINT NOT NULL,
    monto_reembolsado DECIMAL(10,2) NOT NULL,   
    porcentaje_reembolso BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'procesado',
    id_transaccion_simulada VARCHAR(255),
    mensaje_error TEXT,
    procesado_en TIMESTAMP,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reembolso_cita FOREIGN KEY (id_cita) REFERENCES citas(id),
    CONSTRAINT fk_reembolso_pago FOREIGN KEY (id_pago) REFERENCES pagos(id)
);

-- 8. politica_cancelacion
CREATE TABLE IF NOT EXISTS politica_cancelacion (
    id BIGSERIAL PRIMARY KEY,
    horas_anticipacion_minimas BIGINT NOT NULL,
    porcentaje_reembolso DECIMAL(5,2) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. tareas
CREATE TABLE IF NOT EXISTS tareas (
    id BIGSERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. imagenes_galeria
CREATE TABLE IF NOT EXISTS imagenes_galeria (
    id BIGSERIAL PRIMARY KEY,
    url_imagen TEXT NOT NULL,
    categoria VARCHAR(100),
    descripcion TEXT,
    id_servicio BIGINT REFERENCES servicios(id),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. tokens_recuperacion_contrasena
CREATE TABLE IF NOT EXISTS tokens_recuperacion_contrasena (
    id BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    expira_en TIMESTAMP NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

-- 12. ordenes_compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    productos JSONB NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    estado VARCHAR(20) DEFAULT 'completada',
    id_transaccion_simulada VARCHAR(255) NOT NULL,
    preference_id VARCHAR(255),
    mercado_pago_payment_id BIGINT,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orden_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

-- 13. notificaciones_admin
CREATE TABLE IF NOT EXISTS notificaciones_admin (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. comentarios (Avance 4)
CREATE TABLE IF NOT EXISTS comentarios (
    id BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'enviado',
    respuesta_admin TEXT,
    respondido_en TIMESTAMP,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comentario_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

-- 15. encuestas_satisfaccion (Avance 4)
CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
    id BIGSERIAL PRIMARY KEY,
    id_cita BIGINT NOT NULL UNIQUE,
    puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_encuesta_cita FOREIGN KEY (id_cita) REFERENCES citas(id)
);

-- 16. seguimiento_tiempo (Avance 4)
CREATE TABLE IF NOT EXISTS seguimiento_tiempo (
    id BIGSERIAL PRIMARY KEY,
    id_cita BIGINT NOT NULL UNIQUE,
    hora_inicio TIMESTAMP NOT NULL,
    hora_fin TIMESTAMP,
    diferencia_minutos INT,
    completado_a_tiempo BOOLEAN,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_cita FOREIGN KEY (id_cita) REFERENCES citas(id)
);

-- Modificacion: agregar duracion_minutos a servicios (Avance 4)
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS duracion_minutos INT;

-- Actualizar duracion estimada para servicios existentes
UPDATE servicios SET duracion_minutos = 60 WHERE nombre = 'Planchado';
UPDATE servicios SET duracion_minutos = 45 WHERE nombre = 'Laminado';
UPDATE servicios SET duracion_minutos = 40 WHERE nombre = 'Pedicura';
UPDATE servicios SET duracion_minutos = 90 WHERE nombre = 'Uñas acrílicas';
UPDATE servicios SET duracion_minutos = 60 WHERE nombre = 'Rubber';
UPDATE servicios SET duracion_minutos = 30 WHERE nombre = 'Esmaltado';
UPDATE servicios SET duracion_minutos = 90 WHERE nombre = 'Alisado';
UPDATE servicios SET duracion_minutos = 60 WHERE nombre = 'Pestañas 1x1';

-- ============================================================
-- SEED DATA
-- ============================================================

-- Servicios iniciales
INSERT INTO servicios (nombre, descripcion, precio_minimo, precio_maximo) VALUES
('Planchado', 'Alisado permanente con keratina', 15.00, 20.00),
('Laminado', 'Laminado de cejas y pestanas', 25.00, NULL),
('Pedicura', 'Pedicura completa con esmaltado', 26.00, NULL),
('Uñas acrílicas', 'Uñas acrílicas con diseño personalizado', 50.00, NULL),
('Rubber', 'Esmaltado en gel rubber', 35.00, NULL),
('Esmaltado', 'Esmaltado tradicional o semipermanente', 25.00, NULL),
('Alisado', 'Alisado progresivo avanzado', 70.00, NULL),
('Pestañas 1x1', 'Extensiones de pestañas pelo a pelo', 35.00, NULL);

-- Politica de cancelacion
INSERT INTO politica_cancelacion (horas_anticipacion_minimas, porcentaje_reembolso, descripcion) VALUES
(24, 100.00, 'Cancelacion con 24 horas o mas de anticipacion: reembolso del 100%'),
(1, 50.00, 'Cancelacion con menos de 24 horas de anticipacion: reembolso del 50%'),
(0, 0.00, 'Cancelacion el mismo dia: sin reembolso');

-- Productos iniciales
INSERT INTO productos (nombre, descripcion, precio, url_imagen, disponible) VALUES
('Serum Capilar Reparador', 'Tratamiento intensivo con keratina y aceite de argan', 45.00, '/img/img1.webp', true),
('Mist Facial Hidratante', 'Bruma facial con agua de rosas y acido hialuronico', 32.00, '/img/img2.webp', true),
('Aceite Corporal Nutritivo', 'Aceite seco con vitamina E y almendras', 38.00, '/img/img3.webp', true),
('Mascarilla Capilar de Karite', 'Mascarilla profunda con manteca de karite y coco', 28.00, '/img/img4.webp', true),
('Vitamina C Facial', 'Serum de vitamina C pura para iluminar', 52.00, '/img/img5.webp', true),
('Peine Desenredante Profesional', 'Peine con cerdas flexibles para todo tipo de cabello', 18.00, '/img/img6.webp', true),
('Crema de Manos Repair', 'Crema reparadora con calendula', 22.00, '/img/img7.webp', true),
('Gua Sha de Cuarzo Rosa', 'Herramienta facial de cuarzo rosa para masaje lifting', 35.00, '/img/img8.webp', true),
('Producto de Prueba - S/0.10', 'Item de prueba para verificar el flujo de pago con Mercado Pago', 0.10, null, true);

-- Usuario admin por defecto (contrasena: Antonela2025, hasheada con BCrypt)
INSERT INTO usuarios_admin (nombre_usuario, contrasena_hash, rol) VALUES
('antonela_admin', '$2a$10$VhyYm2bn5hkGlqdYixjXnurtXhtuRX.ul8IFj8ypXSwI/XUHtT85K', 'admin');
    