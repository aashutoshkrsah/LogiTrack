-- =============================================================================
-- Logistics Shipment and Delivery Tracking System
-- Combined MySQL 8.0 Schema + Sample Data Script for MySQL Workbench
-- =============================================================================

CREATE DATABASE IF NOT EXISTS logistics_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE logistics_db;

DROP TABLE IF EXISTS tracking_events;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS hubs;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS customers;

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

-- Seed Data
INSERT INTO customers (customer_code, name, phone, email, customer_type) VALUES
('CUST-1001', 'Apex Infrastructure Corp', '+91-98201-11001', 'logistics@apexinfra.example.com', 'CORPORATE'),
('CUST-1002', 'MetroMart Retail Pvt Ltd', '+91-98111-22002', 'dispatch@metromart.example.com', 'ECOMMERCE'),
('CUST-1003', 'Vikram Engineering Works', '+91-98450-33003', 'supply@vikrameng.example.com', 'CORPORATE'),
('CUST-1004', 'Ananya Deshmukh', '+91-97654-44004', 'ananya.d@example.com', 'INDIVIDUAL'),
('CUST-1005', 'Horizon Medical Supplies', '+91-99001-55005', 'orders@horizonmed.example.com', 'RETAIL');

INSERT INTO drivers (driver_code, full_name, phone, licence_number, availability_status) VALUES
('DRV-2001', 'Rajesh Kumar Sharma', '+91-98220-10001', 'MH12-20190045123', 'ON_DUTY'),
('DRV-2002', 'Suresh Babu Nair', '+91-98440-10002', 'KA01-20180078901', 'AVAILABLE'),
('DRV-2003', 'Imran Khan Pathan', '+91-98100-10003', 'DL04-20200011234', 'ON_DUTY'),
('DRV-2004', 'Prakash Patel', '+91-98250-10004', 'GJ01-20170055432', 'AVAILABLE'),
('DRV-2005', 'Deepak Verma', '+91-98330-10005', 'TN09-20160099876', 'ON_LEAVE');

INSERT INTO hubs (hub_code, hub_name, city, address, contact_number) VALUES
('HUB-MUM-01', 'Mumbai Central Logistics Hub', 'Mumbai', 'Plot 42, MIDC Andheri East, Mumbai 400093', '+91-22-4001-1000'),
('HUB-PUN-02', 'Pune Regional Transit Center', 'Pune', 'Sector 18, Chakan Industrial Area, Pune 410501', '+91-20-4002-2000'),
('HUB-BLR-03', 'Bengaluru South Distribution Hub', 'Bengaluru', '14 Electronic City Phase II, Bengaluru 560100', '+91-80-4003-3000'),
('HUB-DEL-04', 'Delhi NCR Freight Gateway', 'New Delhi', 'Block B, Okhla Industrial Estate Phase III, New Delhi 110020', '+91-11-4004-4000'),
('HUB-HYD-05', 'Hyderabad Cargo Terminal', 'Hyderabad', 'Survey 88, Shamshabad Logistics Park, Hyderabad 501218', '+91-40-4005-5000');

INSERT INTO shipments (
    tracking_number, customer_id, driver_id, origin_hub_id,
    destination_address, destination_city, created_date, expected_delivery_date,
    shipment_status, weight
) VALUES
('TRK-2026-0001', 1, 1, 1, 'Plot 19, Hinjewadi Phase 2', 'Pune',
 DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'DELIVERED', 145.50),
('TRK-2026-0002', 2, 3, 4, '74 Residency Road, Ashok Nagar', 'Bengaluru',
 DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'IN_TRANSIT', 62.75),
('TRK-2026-0003', 3, 1, 2, '210 Banjara Hills Road No 12', 'Hyderabad',
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'OUT_FOR_DELIVERY', 28.40),
('TRK-2026-0004', 5, 2, 3, '18 Anna Salai, Guindy', 'Chennai',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'PICKED_UP', 19.00),
('TRK-2026-0005', 4, NULL, 1, '55 Carter Road, Bandra West', 'Mumbai',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'PENDING', 5.25),
('TRK-2026-0006', 1, 4, 5, '99 SG Highway, Thaltej', 'Ahmedabad',
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'IN_TRANSIT', 310.00),
('TRK-2026-0007', 2, NULL, 4, '12 Park Street', 'Kolkata',
 DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'PENDING', 42.10);

INSERT INTO tracking_events (shipment_id, event_date_time, event_status, hub_id, remarks, updated_by) VALUES
(1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '09:30:00'), 'PENDING', 1, 'Consignment registered at Mumbai Central Hub', 'Coordinator A. Rao'),
(1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '11:15:00'), 'PICKED_UP', 1, 'Picked up by driver Rajesh Kumar Sharma', 'Operator M. Joshi'),
(1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '16:40:00'), 'IN_TRANSIT', 2, 'Arrived at Pune Regional Transit Center', 'Hub Supervisor K. Kulkarni'),
(1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '08:45:00'), 'OUT_FOR_DELIVERY', 2, 'Dispatched for final mile delivery in Pune', 'Hub Supervisor K. Kulkarni'),
(1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '15:20:00'), 'DELIVERED', NULL, 'Delivered and signed by site engineer', 'Rajesh Kumar Sharma'),
(2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 8 DAY), '10:00:00'), 'PENDING', 4, 'Consignment manifested at Delhi NCR Gateway', 'Coordinator S. Gupta'),
(2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '14:20:00'), 'PICKED_UP', 4, 'Loaded onto line-haul truck DL-01-HG-4410', 'Operator R. Meena'),
(2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '19:10:00'), 'IN_TRANSIT', 5, 'Transit delay due to highway inspection at Hyderabad Hub', 'Hub Lead P. Reddy'),
(3, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00:00'), 'PENDING', 2, 'Booking confirmed at Pune Hub', 'Coordinator A. Rao'),
(3, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '12:30:00'), 'PICKED_UP', 2, 'Collected by assigned fleet driver', 'Operator V. Shinde'),
(3, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '17:00:00'), 'IN_TRANSIT', 5, 'Sorted at Hyderabad Cargo Terminal', 'Hub Lead P. Reddy'),
(3, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:15:00'), 'OUT_FOR_DELIVERY', 5, 'Out for delivery to Banjara Hills', 'Hub Lead P. Reddy'),
(4, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'PENDING', 3, 'Medical cold-chain parcel registered', 'Coordinator N. Iyer'),
(4, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '16:05:00'), 'PICKED_UP', 3, 'Picked up by Suresh Babu Nair', 'Operator D. Gowda'),
(6, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00'), 'PENDING', 5, 'Registered heavy industrial shipment', 'Coordinator N. Iyer'),
(6, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '15:45:00'), 'PICKED_UP', 5, 'Dispatched via Prakash Patel', 'Hub Lead P. Reddy'),
(6, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '20:30:00'), 'IN_TRANSIT', 1, 'Cross-docked at Mumbai Hub en route to Ahmedabad', 'Operator M. Joshi'),
(7, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '13:15:00'), 'PENDING', 4, 'Awaiting driver assignment at Delhi NCR Gateway', 'Coordinator S. Gupta');

