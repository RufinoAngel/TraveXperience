-- ============================================================
-- TraveXperience - Comentarios para diccionario de datos
-- ============================================================

USE travexperience;

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
ALTER TABLE users COMMENT = 'Cuentas de viajeros y administradores. Núcleo de autenticación compartido por Web, App Móvil y Smartwatch.';

ALTER TABLE users
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN fullName VARCHAR(120) NOT NULL COMMENT 'Nombre completo del usuario',
  MODIFY COLUMN email VARCHAR(150) NOT NULL COMMENT 'Correo electrónico, único',
  MODIFY COLUMN passwordHash VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada (bcrypt)',
  MODIFY COLUMN role ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario' COMMENT 'Rol del usuario en la plataforma',
  MODIFY COLUMN companyName VARCHAR(150) NULL COMMENT 'Solo aplica si role = administrador',
  MODIFY COLUMN phone VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
  MODIFY COLUMN location VARCHAR(150) NULL COMMENT 'Ubicación del usuario',
  MODIFY COLUMN bio VARCHAR(300) NULL COMMENT 'Biografía o descripción corta',
  MODIFY COLUMN travelPreferences JSON NULL DEFAULT (JSON_OBJECT()) COMMENT 'Input del modelo de clustering (ML)',
  MODIFY COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado de la cuenta',
  MODIFY COLUMN refreshTokenHash VARCHAR(255) NULL COMMENT 'Sesión activa / revocación de tokens',
  MODIFY COLUMN passwordResetToken VARCHAR(255) NULL COMMENT 'Token para recuperación de contraseña',
  MODIFY COLUMN passwordResetExpires DATETIME NULL COMMENT 'Expiración del token de recuperación',
  MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)';

-- ------------------------------------------------------------
-- 2. itineraries
-- ------------------------------------------------------------
ALTER TABLE itineraries COMMENT = 'Itinerarios de viaje elaborados por el usuario (Plataforma Web).';

ALTER TABLE itineraries
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN userId INT NOT NULL COMMENT 'FK -> users.id',
  MODIFY COLUMN title VARCHAR(150) NOT NULL COMMENT 'Título del itinerario',
  MODIFY COLUMN destination VARCHAR(150) NOT NULL COMMENT 'Destino del viaje',
  MODIFY COLUMN startDate DATE NOT NULL COMMENT 'Fecha de inicio del viaje',
  MODIFY COLUMN endDate DATE NOT NULL COMMENT 'Fecha de fin del viaje',
  MODIFY COLUMN estimatedBudget DECIMAL(10,2) NULL COMMENT 'Puede estimarse con IA',
  MODIFY COLUMN itineraryDetails JSON NULL COMMENT 'Array de días/eventos, formato libre',
  MODIFY COLUMN status ENUM('borrador','confirmado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'borrador' COMMENT 'Estado del itinerario',
  MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)';

-- ------------------------------------------------------------
-- 3. transport_routes
-- ------------------------------------------------------------
ALTER TABLE transport_routes COMMENT = 'Rutas de transporte (autobús/vuelo) registradas por un administrador.';

ALTER TABLE transport_routes
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN ownerId INT NOT NULL COMMENT 'FK -> users.id (admin dueño de la ruta)',
  MODIFY COLUMN company VARCHAR(150) NOT NULL COMMENT 'Nombre de la compañía transportista',
  MODIFY COLUMN origin VARCHAR(150) NOT NULL COMMENT 'Lugar de origen',
  MODIFY COLUMN destination VARCHAR(150) NOT NULL COMMENT 'Lugar de destino',
  MODIFY COLUMN departureTime TIME NOT NULL COMMENT 'Hora de salida',
  MODIFY COLUMN arrivalTime TIME NOT NULL COMMENT 'Hora de llegada',
  MODIFY COLUMN daysOfWeek JSON NULL COMMENT 'Ej. ["L","M","X","J","V"]',
  MODIFY COLUMN capacity INT NOT NULL COMMENT 'Capacidad total de la unidad',
  MODIFY COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado de la ruta',
  MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)';

-- ------------------------------------------------------------
-- 4. transport_fare_classes
-- ------------------------------------------------------------
ALTER TABLE transport_fare_classes COMMENT = 'Tabla hija de transport_routes (relación 1:N) - clases de tarifa por ruta.';

ALTER TABLE transport_fare_classes
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN routeId INT NOT NULL COMMENT 'FK -> transport_routes.id',
  MODIFY COLUMN name VARCHAR(80) NOT NULL COMMENT 'Ej. "Turista", "Business", "First Class"',
  MODIFY COLUMN price DECIMAL(10,2) NOT NULL COMMENT 'Precio de la clase de tarifa',
  MODIFY COLUMN occupancyPct INT NULL COMMENT '0-100, ocupación proyectada';

-- ------------------------------------------------------------
-- 5. saved_cards
-- ------------------------------------------------------------
ALTER TABLE saved_cards COMMENT = 'Tarjetas guardadas por el usuario. Nunca almacena el número completo ni el CVC - solo un token del proveedor de pagos.';

ALTER TABLE saved_cards
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN userId INT NOT NULL COMMENT 'FK -> users.id',
  MODIFY COLUMN brand VARCHAR(50) NULL COMMENT 'Ej. "Visa Signature"',
  MODIFY COLUMN last4 VARCHAR(4) NOT NULL COMMENT 'Últimos 4 dígitos de la tarjeta',
  MODIFY COLUMN expiryMonth INT NOT NULL COMMENT 'Mes de expiración',
  MODIFY COLUMN expiryYear INT NOT NULL COMMENT 'Año de expiración',
  MODIFY COLUMN providerToken VARCHAR(255) NULL COMMENT 'Token del proveedor de pagos (Stripe/Conekta/MercadoPago)',
  MODIFY COLUMN isDefault BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Tarjeta predeterminada del usuario',
  MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)';

-- ------------------------------------------------------------
-- 6. transactions
-- ------------------------------------------------------------
ALTER TABLE transactions COMMENT = 'Historial de pagos y transacciones del usuario.';

ALTER TABLE transactions
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'PK, autoincrement',
  MODIFY COLUMN userId INT NOT NULL COMMENT 'FK -> users.id',
  MODIFY COLUMN itineraryId INT NULL COMMENT 'FK -> itineraries.id, puede ser NULL',
  MODIFY COLUMN description VARCHAR(200) NOT NULL COMMENT 'Descripción de la transacción',
  MODIFY COLUMN category VARCHAR(50) NULL COMMENT 'Ej. "hotel", "restaurante", "transporte"',
  MODIFY COLUMN amount DECIMAL(10,2) NOT NULL COMMENT 'Monto de la transacción',
  MODIFY COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'MXN' COMMENT 'Moneda de la transacción',
  MODIFY COLUMN status ENUM('pendiente','completado','fallido') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado del pago',
  MODIFY COLUMN providerPaymentId VARCHAR(255) NULL COMMENT 'ID de la transacción en el proveedor de pagos',
  MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)';
