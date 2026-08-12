-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: travexperience
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `itineraries`
--

DROP TABLE IF EXISTS `itineraries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itineraries` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Título del itinerario',
  `destination` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Destino del viaje',
  `startDate` date NOT NULL COMMENT 'Fecha de inicio del viaje',
  `endDate` date NOT NULL COMMENT 'Fecha de fin del viaje',
  `estimatedBudget` decimal(10,2) DEFAULT NULL COMMENT 'Puede estimarse con IA',
  `itineraryDetails` json DEFAULT NULL COMMENT 'Array de días/eventos, formato libre',
  `status` enum('borrador','confirmado','en_curso','finalizado','cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador' COMMENT 'Estado del itinerario',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`),
  KEY `idx_itineraries_userId` (`userId`),
  CONSTRAINT `fk_itineraries_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itinerarios de viaje elaborados por el usuario (Plataforma Web).';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itineraries`
--

LOCK TABLES `itineraries` WRITE;
/*!40000 ALTER TABLE `itineraries` DISABLE KEYS */;
/*!40000 ALTER TABLE `itineraries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_cards`
--

DROP TABLE IF EXISTS `saved_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_cards` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `brand` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej. "Visa Signature"',
  `last4` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Últimos 4 dígitos de la tarjeta',
  `expiryMonth` int NOT NULL COMMENT 'Mes de expiración',
  `expiryYear` int NOT NULL COMMENT 'Año de expiración',
  `providerToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token del proveedor de pagos (Stripe/Conekta/MercadoPago)',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Tarjeta predeterminada del usuario',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  PRIMARY KEY (`id`),
  KEY `idx_cards_userId` (`userId`),
  CONSTRAINT `fk_cards_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tarjetas guardadas por el usuario. Nunca almacena el número completo ni el CVC - solo un token del proveedor de pagos.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_cards`
--

LOCK TABLES `saved_cards` WRITE;
/*!40000 ALTER TABLE `saved_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `userId` int NOT NULL COMMENT 'FK -> users.id',
  `itineraryId` int DEFAULT NULL COMMENT 'FK -> itineraries.id, puede ser NULL',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Descripción de la transacción',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej. "hotel", "restaurante", "transporte"',
  `amount` decimal(10,2) NOT NULL COMMENT 'Monto de la transacción',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MXN' COMMENT 'Moneda de la transacción',
  `status` enum('pendiente','completado','fallido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente' COMMENT 'Estado del pago',
  `providerPaymentId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de la transacción en el proveedor de pagos',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  PRIMARY KEY (`id`),
  KEY `idx_transactions_userId` (`userId`),
  KEY `idx_transactions_itineraryId` (`itineraryId`),
  CONSTRAINT `fk_transactions_itinerary` FOREIGN KEY (`itineraryId`) REFERENCES `itineraries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de pagos y transacciones del usuario.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_fare_classes`
--

DROP TABLE IF EXISTS `transport_fare_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_fare_classes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `routeId` int NOT NULL COMMENT 'FK -> transport_routes.id',
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej. "Turista", "Business", "First Class"',
  `price` decimal(10,2) NOT NULL COMMENT 'Precio de la clase de tarifa',
  `occupancyPct` int DEFAULT NULL COMMENT '0-100, ocupación proyectada',
  PRIMARY KEY (`id`),
  KEY `idx_fareclass_routeId` (`routeId`),
  CONSTRAINT `fk_fareclass_route` FOREIGN KEY (`routeId`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_occupancy` CHECK (((`occupancyPct` is null) or (`occupancyPct` between 0 and 100)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla hija de transport_routes (relación 1:N) - clases de tarifa por ruta.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_fare_classes`
--

LOCK TABLES `transport_fare_classes` WRITE;
/*!40000 ALTER TABLE `transport_fare_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_fare_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_routes`
--

DROP TABLE IF EXISTS `transport_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_routes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `ownerId` int NOT NULL COMMENT 'FK -> users.id (admin dueño de la ruta)',
  `company` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la compañía transportista',
  `origin` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lugar de origen',
  `destination` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lugar de destino',
  `departureTime` time NOT NULL COMMENT 'Hora de salida',
  `arrivalTime` time NOT NULL COMMENT 'Hora de llegada',
  `daysOfWeek` json DEFAULT NULL COMMENT 'Ej. ["L","M","X","J","V"]',
  `capacity` int NOT NULL COMMENT 'Capacidad total de la unidad',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Estado de la ruta',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`),
  KEY `idx_routes_ownerId` (`ownerId`),
  CONSTRAINT `fk_routes_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rutas de transporte (autobús/vuelo) registradas por un administrador.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_routes`
--

LOCK TABLES `transport_routes` WRITE;
/*!40000 ALTER TABLE `transport_routes` DISABLE KEYS */;
/*!40000 ALTER TABLE `transport_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'PK, autoincrement',
  `fullName` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre completo del usuario',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo electrónico, único',
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contraseña encriptada (bcrypt)',
  `role` enum('usuario','administrador') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usuario' COMMENT 'Rol del usuario en la plataforma',
  `companyName` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Solo aplica si role = administrador',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono de contacto',
  `location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ubicación del usuario',
  `bio` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Biografía o descripción corta',
  `travelPreferences` json DEFAULT (json_object()) COMMENT 'Input del modelo de clustering (ML)',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Estado de la cuenta',
  `refreshTokenHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sesión activa / revocación de tokens',
  `passwordResetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token para recuperación de contraseña',
  `passwordResetExpires` datetime DEFAULT NULL COMMENT 'Expiración del token de recuperación',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (automático)',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización (automático)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas de viajeros y administradores. Núcleo de autenticación compartido por Web, App Móvil y Smartwatch.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'travexperience'
--

--
-- Dumping routines for database 'travexperience'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-11 22:24:22
