-- =============================================================================
-- Logistics Shipment and Delivery Tracking System
-- MySQL 8.0 InnoDB Database Schema (Exactly Five Persistent Entities)
-- Compatible with MySQL Workbench 8.0+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS logistics_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE logistics_db;

-- Drop child tables first if re-initializing cleanly
DROP TABLE IF EXISTS tracking_events;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS hubs;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS customers;

-- -----------------------------------------------------------------------------
-- 1. CUSTOMERS
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    customer_id   BIGINT       NOT NULL AUTO_INCREMENT,
    customer_code VARCHAR(30)  NOT NULL,
    name          VARCHAR(120) NOT NULL,
    phone         VARCHAR(20)  NOT NULL,
    email         VARCHAR(150) NOT NULL,
    customer_type VARCHAR(30)  NOT NULL,
    CONSTRAINT pk_customers PRIMARY KEY (customer_id),
    CONSTRAINT uq_customers_code UNIQUE (customer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. DRIVERS
-- -----------------------------------------------------------------------------
CREATE TABLE drivers (
    driver_id           BIGINT       NOT NULL AUTO_INCREMENT,
    driver_code         VARCHAR(30)  NOT NULL,
    full_name           VARCHAR(120) NOT NULL,
    phone               VARCHAR(20)  NOT NULL,
    licence_number      VARCHAR(50)  NOT NULL,
    availability_status VARCHAR(30)  NOT NULL,
    CONSTRAINT pk_drivers PRIMARY KEY (driver_id),
    CONSTRAINT uq_drivers_code UNIQUE (driver_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. HUBS
-- -----------------------------------------------------------------------------
CREATE TABLE hubs (
    hub_id         BIGINT       NOT NULL AUTO_INCREMENT,
    hub_code       VARCHAR(30)  NOT NULL,
    hub_name       VARCHAR(120) NOT NULL,
    city           VARCHAR(80)  NOT NULL,
    address        VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20)  NOT NULL,
    CONSTRAINT pk_hubs PRIMARY KEY (hub_id),
    CONSTRAINT uq_hubs_code UNIQUE (hub_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. SHIPMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE shipments (
    shipment_id            BIGINT         NOT NULL AUTO_INCREMENT,
    tracking_number        VARCHAR(40)    NOT NULL,
    customer_id            BIGINT         NOT NULL,
    driver_id              BIGINT         NULL,
    origin_hub_id          BIGINT         NOT NULL,
    destination_address    VARCHAR(255)   NOT NULL,
    destination_city       VARCHAR(80)    NOT NULL,
    created_date           DATE           NOT NULL,
    expected_delivery_date DATE           NOT NULL,
    shipment_status        VARCHAR(30)    NOT NULL,
    weight                 DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_shipments PRIMARY KEY (shipment_id),
    CONSTRAINT uq_shipments_tracking UNIQUE (tracking_number),
    CONSTRAINT fk_shipment_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_shipment_driver FOREIGN KEY (driver_id)
        REFERENCES drivers (driver_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_shipment_origin_hub FOREIGN KEY (origin_hub_id)
        REFERENCES hubs (hub_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_shipment_weight CHECK (weight > 0),
    CONSTRAINT chk_shipment_dates CHECK (expected_delivery_date >= created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_shipments_status ON shipments (shipment_status);
CREATE INDEX idx_shipments_expected_date ON shipments (expected_delivery_date);
CREATE INDEX idx_shipments_created_date ON shipments (created_date);

-- -----------------------------------------------------------------------------
-- 5. TRACKING EVENTS
-- -----------------------------------------------------------------------------
CREATE TABLE tracking_events (
    event_id        BIGINT       NOT NULL AUTO_INCREMENT,
    shipment_id     BIGINT       NOT NULL,
    event_date_time DATETIME     NOT NULL,
    event_status    VARCHAR(30)  NOT NULL,
    hub_id          BIGINT       NULL,
    remarks         VARCHAR(500) NULL,
    updated_by      VARCHAR(100) NOT NULL,
    CONSTRAINT pk_tracking_events PRIMARY KEY (event_id),
    CONSTRAINT fk_tracking_shipment FOREIGN KEY (shipment_id)
        REFERENCES shipments (shipment_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tracking_hub FOREIGN KEY (hub_id)
        REFERENCES hubs (hub_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tracking_shipment_dt ON tracking_events (shipment_id, event_date_time);

