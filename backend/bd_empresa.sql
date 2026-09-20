CREATE DATABASE IF NOT EXISTS bd_empresa;
USE bd_empresa;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    estado ENUM('Disponible', 'No disponible') DEFAULT 'Disponible',

    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
);

CREATE TABLE promociones (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    descuento DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('Activa', 'Inactiva') DEFAULT 'Activa'
);

CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('Disponible', 'No disponible') DEFAULT 'Disponible'
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_promocion INT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM(
        'Pendiente',
        'Confirmado',
        'En preparación',
        'Enviado',
        'Entregado',
        'Cancelado'
    ) DEFAULT 'Pendiente',
    total DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion)
);

CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE,

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);

CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    metodo_pago ENUM(
        'Efectivo',
        'Tarjeta',
        'Transferencia',
        'PSE',
        'Nequi',
        'Daviplata'
    ) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM(
        'Pendiente',
        'Aprobado',
        'Rechazado'
    ) DEFAULT 'Pendiente',
    referencia VARCHAR(100),

    FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE
);

-- DATOS DE LA EMPRESA

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total de la empresa'),
('Empleado', 'Gestiona productos y pedidos'),
('Cliente', 'Cliente de la empresa');

INSERT INTO categorias (nombre, descripcion) VALUES
('Celulares', 'Teléfonos celulares'),
('Computadores', 'Computadores y portátiles'),
('Accesorios', 'Accesorios tecnológicos');

INSERT INTO productos
(id_categoria, nombre, descripcion, precio, stock)
VALUES
(1, 'Celular Samsung', 'Teléfono inteligente Samsung', 1200000, 10),
(2, 'Portátil Lenovo', 'Computador portátil Lenovo', 2500000, 5),
(3, 'Audífonos Bluetooth', 'Audífonos inalámbricos', 120000, 20);

INSERT INTO servicios (nombre, descripcion, precio) VALUES
('Reparación', 'Reparación de dispositivos', 80000),
('Mantenimiento', 'Mantenimiento preventivo', 60000),
('Instalación de software', 'Instalación y configuración de software', 50000);

INSERT INTO promociones
(nombre, descripcion, descuento, fecha_inicio, fecha_fin)
VALUES
(
    'Descuento especial',
    'Descuento para clientes',
    15.00,
    '2026-08-01',
    '2026-12-31'
);