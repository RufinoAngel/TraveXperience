-- ============================================================
-- TraveXperience - Base de datos relacional (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS travexperience
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE travexperience;

-- ------------------------------------------------------------
-- 1. users  (IMPLEMENTADA)
-- ------------------------------------------------------------
CREATE TABLE users (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  fullName              VARCHAR(120) NOT NULL,
  email                 VARCHAR(150) NOT NULL UNIQUE,
  passwordHash          VARCHAR(255) NOT NULL,
  role                  ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario',
  companyName           VARCHAR(150) NULL,
  phone                 VARCHAR(20) NULL,
  location              VARCHAR(150) NULL,
  bio                   VARCHAR(300) NULL,
  travelPreferences     JSON NULL DEFAULT (JSON_OBJECT()),
  isActive              BOOLEAN NOT NULL DEFAULT TRUE,
  refreshTokenHash      VARCHAR(255) NULL,
  passwordResetToken    VARCHAR(255) NULL,
  passwordResetExpires  DATETIME NULL,
  createdAt             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. itineraries  (IMPLEMENTADA)  -> 1:N con users
-- ------------------------------------------------------------
CREATE TABLE itineraries (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  userId            INT NOT NULL,
  title             VARCHAR(150) NOT NULL,
  destination       VARCHAR(150) NOT NULL,
  startDate         DATE NOT NULL,
  endDate           DATE NOT NULL,
  estimatedBudget   DECIMAL(10,2) NULL,
  itineraryDetails  JSON NULL,
  status            ENUM('borrador','confirmado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'borrador',
  createdAt         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_itineraries_user FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. transport_routes  (PROPUESTA)  -> 1:N con users (admin)
-- ------------------------------------------------------------
CREATE TABLE transport_routes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  ownerId        INT NOT NULL,
  company        VARCHAR(150) NOT NULL,
  origin         VARCHAR(150) NOT NULL,
  destination    VARCHAR(150) NOT NULL,
  departureTime  TIME NOT NULL,
  arrivalTime    TIME NOT NULL,
  daysOfWeek     JSON NULL,
  capacity       INT NOT NULL,
  isActive       BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_routes_owner FOREIGN KEY (ownerId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. transport_fare_classes (PROPUESTA) -> 1:N con transport_routes
-- ------------------------------------------------------------
CREATE TABLE transport_fare_classes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  routeId        INT NOT NULL,
  name           VARCHAR(80) NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  occupancyPct   INT NULL,
  CONSTRAINT fk_fareclass_route FOREIGN KEY (routeId) REFERENCES transport_routes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_occupancy CHECK (occupancyPct IS NULL OR (occupancyPct BETWEEN 0 AND 100))
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. saved_cards  (PROPUESTA) -> 1:N con users
-- ------------------------------------------------------------
CREATE TABLE saved_cards (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  userId         INT NOT NULL,
  brand          VARCHAR(50) NULL,
  last4          VARCHAR(4) NOT NULL,
  expiryMonth    INT NOT NULL,
  expiryYear     INT NOT NULL,
  providerToken  VARCHAR(255) NULL,
  isDefault      BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cards_user FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. transactions (PROPUESTA) -> N:1 con users, N:1 con itineraries (opcional)
-- ------------------------------------------------------------
CREATE TABLE transactions (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  userId             INT NOT NULL,
  itineraryId        INT NULL,
  description        VARCHAR(200) NOT NULL,
  category           VARCHAR(50) NULL,
  amount             DECIMAL(10,2) NOT NULL,
  currency           VARCHAR(3) NOT NULL DEFAULT 'MXN',
  status             ENUM('pendiente','completado','fallido') NOT NULL DEFAULT 'pendiente',
  providerPaymentId  VARCHAR(255) NULL,
  createdAt          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_itinerary FOREIGN KEY (itineraryId) REFERENCES itineraries(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Índices recomendados
-- ------------------------------------------------------------
CREATE INDEX idx_itineraries_userId ON itineraries(userId);
CREATE INDEX idx_routes_ownerId ON transport_routes(ownerId);
CREATE INDEX idx_fareclass_routeId ON transport_fare_classes(routeId);
CREATE INDEX idx_cards_userId ON saved_cards(userId);
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_itineraryId ON transactions(itineraryId);
