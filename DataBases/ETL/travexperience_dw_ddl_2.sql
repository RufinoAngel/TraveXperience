-- ============================================================
-- TraveXperience - Data Warehouse (Esquema en Estrella)
-- 2 tablas de hechos + 6 dimensiones
-- Fuente: usuarios (MySQL), itinerarios (MySQL), actividad (MongoDB activitylogs)
-- ============================================================

CREATE DATABASE IF NOT EXISTS travexperience_dw
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE travexperience_dw;

-- ============================================================
-- DIMENSIONES (6)
-- ============================================================

-- 1. dim_date
CREATE TABLE dim_date (
  date_key      INT PRIMARY KEY,              -- formato YYYYMMDD
  full_date     DATE NOT NULL,
  day           INT NOT NULL,
  month         INT NOT NULL,
  month_name    VARCHAR(20) NOT NULL,
  quarter       INT NOT NULL,
  year          INT NOT NULL,
  weekday_name  VARCHAR(20) NOT NULL,
  is_weekend    BOOLEAN NOT NULL
) ENGINE=InnoDB;

-- 2. dim_user  (fuente: usuarios)
CREATE TABLE dim_user (
  user_key   INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,                    -- llave natural, users.id
  full_name  VARCHAR(120) NOT NULL,
  role       VARCHAR(20) NOT NULL,
  location   VARCHAR(150),
  is_active  BOOLEAN NOT NULL,
  UNIQUE KEY uq_dim_user_natural (user_id)
) ENGINE=InnoDB;

-- 3. dim_destination  (fuente: itinerarios.destination)
CREATE TABLE dim_destination (
  destination_key   INT AUTO_INCREMENT PRIMARY KEY,
  destination_name  VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_dim_destination (destination_name)
) ENGINE=InnoDB;

-- 4. dim_status  (fuente: itinerarios.status)
CREATE TABLE dim_status (
  status_key    INT AUTO_INCREMENT PRIMARY KEY,
  status_value  VARCHAR(30) NOT NULL,         -- borrador, confirmado, en_curso, finalizado, cancelado
  UNIQUE KEY uq_dim_status (status_value)
) ENGINE=InnoDB;

-- 5. dim_event_type  (fuente: actividad.eventType)
CREATE TABLE dim_event_type (
  event_type_key  INT AUTO_INCREMENT PRIMARY KEY,
  event_type      VARCHAR(30) NOT NULL,       -- search, view_place, save_favorite, book_itinerary, app_open, wearable_sync
  UNIQUE KEY uq_dim_event_type (event_type)
) ENGINE=InnoDB;

-- 6. dim_source  (fuente: actividad.source)
CREATE TABLE dim_source (
  source_key  INT AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(20) NOT NULL,           -- web, mobile, smartwatch
  UNIQUE KEY uq_dim_source (source_name)
) ENGINE=InnoDB;

-- ============================================================
-- HECHOS (2)
-- ============================================================

-- 1. fact_itineraries  |  grano: 1 fila por itinerario
CREATE TABLE fact_itineraries (
  itinerary_key     INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_id      INT NOT NULL,             -- llave natural, itinerarios.id
  user_key          INT NOT NULL,
  destination_key   INT NOT NULL,
  date_key          INT NOT NULL,             -- fecha de inicio del itinerario
  status_key        INT NOT NULL,
  duration_days     INT,
  num_activities    INT,
  estimated_budget  DECIMAL(10,2),
  CONSTRAINT fk_fi_user        FOREIGN KEY (user_key) REFERENCES dim_user(user_key),
  CONSTRAINT fk_fi_destination FOREIGN KEY (destination_key) REFERENCES dim_destination(destination_key),
  CONSTRAINT fk_fi_date        FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
  CONSTRAINT fk_fi_status      FOREIGN KEY (status_key) REFERENCES dim_status(status_key)
) ENGINE=InnoDB;

-- 2. fact_activity  |  grano: 1 fila por evento de actividad del usuario
CREATE TABLE fact_activity (
  activity_key    INT AUTO_INCREMENT PRIMARY KEY,
  user_key        INT NOT NULL,
  date_key        INT NOT NULL,
  event_type_key  INT NOT NULL,
  source_key      INT NOT NULL,
  event_count     INT NOT NULL DEFAULT 1,     -- permite agregar por día/usuario/evento si se pre-resume
  CONSTRAINT fk_fa_user       FOREIGN KEY (user_key) REFERENCES dim_user(user_key),
  CONSTRAINT fk_fa_date       FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
  CONSTRAINT fk_fa_eventtype  FOREIGN KEY (event_type_key) REFERENCES dim_event_type(event_type_key),
  CONSTRAINT fk_fa_source     FOREIGN KEY (source_key) REFERENCES dim_source(source_key)
) ENGINE=InnoDB;

-- ============================================================
-- Índices recomendados sobre las FK de los hechos
-- ============================================================
CREATE INDEX idx_fi_user ON fact_itineraries(user_key);
CREATE INDEX idx_fi_date ON fact_itineraries(date_key);
CREATE INDEX idx_fa_user ON fact_activity(user_key);
CREATE INDEX idx_fa_date ON fact_activity(date_key);
