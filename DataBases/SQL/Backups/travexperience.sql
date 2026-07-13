/*
 Navicat Premium Dump SQL

 Source Server         : Mi_Servidor_Local
 Source Server Type    : MySQL
 Source Server Version : 80035 (8.0.35)
 Source Host           : localhost:3308
 Source Schema         : travexperience

 Target Server Type    : MySQL
 Target Server Version : 80035 (8.0.35)
 File Encoding         : 65001

 Date: 11/07/2026 22:14:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for itineraries
-- ----------------------------
DROP TABLE IF EXISTS `itineraries`;
CREATE TABLE `itineraries`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Título del itinerario',
  `destination` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Destino del viaje',
  `startDate` date NOT NULL COMMENT 'Fecha de inicio del viaje',
  `endDate` date NOT NULL COMMENT 'Fecha de fin del viaje',
  `estimatedBudget` decimal(10, 2) NULL DEFAULT NULL COMMENT 'Puede estimarse con IA',
  `itineraryDetails` json NULL COMMENT 'Array de días/eventos, formato libre',
  `status` enum('borrador','confirmado','en_curso','finalizado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador' COMMENT 'Estado del itinerario',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_itineraries_userId`(`userId` ASC) USING BTREE,
  CONSTRAINT `fk_itineraries_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Itinerarios de viaje elaborados por el usuario (Plataforma Web).' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for saved_cards
-- ----------------------------
DROP TABLE IF EXISTS `saved_cards`;
CREATE TABLE `saved_cards`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Ej. \"Visa Signature\"',
  `last4` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Últimos 4 dígitos de la tarjeta',
  `expiryMonth` int NOT NULL COMMENT 'Mes de expiración',
  `expiryYear` int NOT NULL COMMENT 'Año de expiración',
  `providerToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Token del proveedor de pagos (Stripe/Conekta/MercadoPago)',
  `isDefault` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Tarjeta predeterminada del usuario',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cards_userId`(`userId` ASC) USING BTREE,
  CONSTRAINT `fk_cards_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Tarjetas guardadas por el usuario. Nunca almacena el número completo ni el CVC - solo un token del proveedor de pagos.' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `itineraryId` int NULL DEFAULT NULL COMMENT 'FK -> itineraries.id, puede ser NULL',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Descripción de la transacción',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Ej. \"hotel\", \"restaurante\", \"transporte\"',
  `amount` decimal(10, 2) NOT NULL COMMENT 'Monto de la transacción',
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MXN' COMMENT 'Moneda de la transacción',
  `status` enum('pendiente','completado','fallido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente' COMMENT 'Estado del pago',
  `providerPaymentId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'ID de la transacción en el proveedor de pagos',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_transactions_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_transactions_itineraryId`(`itineraryId` ASC) USING BTREE,
  CONSTRAINT `fk_transactions_itinerary` FOREIGN KEY (`itineraryId`) REFERENCES `itineraries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Historial de pagos y transacciones del usuario.' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for transport_fare_classes
-- ----------------------------
DROP TABLE IF EXISTS `transport_fare_classes`;
CREATE TABLE `transport_fare_classes`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `routeId` int NOT NULL COMMENT 'FK -> transport_routes.id',
  `name` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej. \"Turista\", \"Business\", \"First Class\"',
  `price` decimal(10, 2) NOT NULL COMMENT 'Precio de la clase de tarifa',
  `occupancyPct` int NULL DEFAULT NULL COMMENT '0-100, ocupación proyectada',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_fareclass_routeId`(`routeId` ASC) USING BTREE,
  CONSTRAINT `fk_fareclass_route` FOREIGN KEY (`routeId`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_occupancy` CHECK ((`occupancyPct` is null) or (`occupancyPct` between 0 and 100))
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Tabla hija de transport_routes (relación 1:N) - clases de tarifa por ruta.' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for transport_routes
-- ----------------------------
DROP TABLE IF EXISTS `transport_routes`;
CREATE TABLE `transport_routes`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `ownerId` int NOT NULL COMMENT 'FK -> users.id (admin dueño de la ruta)',
  `company` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la compañía transportista',
  `origin` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lugar de origen',
  `destination` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lugar de destino',
  `departureTime` time NOT NULL COMMENT 'Hora de salida',
  `arrivalTime` time NOT NULL COMMENT 'Hora de llegada',
  `daysOfWeek` json NULL COMMENT 'Ej. [\"L\",\"M\",\"X\",\"J\",\"V\"]',
  `capacity` int NOT NULL COMMENT 'Capacidad total de la unidad',
  `isActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Estado de la ruta',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_routes_ownerId`(`ownerId` ASC) USING BTREE,
  CONSTRAINT `fk_routes_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Rutas de transporte (autobús/vuelo) registradas por un administrador.' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `fullName` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre completo del usuario',
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo electrónico, único',
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contraseña encriptada (bcrypt)',
  `role` enum('usuario','administrador') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usuario' COMMENT 'Rol del usuario en la plataforma',
  `companyName` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Solo aplica si role = administrador',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Teléfono de contacto',
  `location` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Ubicación del usuario',
  `bio` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Biografía o descripción corta',
  `travelPreferences` json NULL COMMENT 'Input del modelo de clustering (ML)',
  `isActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Estado de la cuenta',
  `refreshTokenHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Sesión activa / revocación de tokens',
  `passwordResetToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Token para recuperación de contraseña',
  `passwordResetExpires` datetime NULL DEFAULT NULL COMMENT 'Expiración del token de recuperación',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Cuentas de viajeros y administradores. Núcleo de autenticación compartido por Web, App Móvil y Smartwatch.' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
