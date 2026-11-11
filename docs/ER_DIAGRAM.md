# Entity-Relationship (ER) Diagram & Schema Specification

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    CUSTOMER ||--o{ SHIPMENT : "places (1 to 0..N)"
    DRIVER |o--o{ SHIPMENT : "assigned to (0..1 to 0..N)"
    HUB ||--o{ SHIPMENT : "originates from (1 to 0..N)"
    SHIPMENT ||--o{ TRACKING_EVENT : "records (1 to 0..N)"
    HUB |o--o{ TRACKING_EVENT : "checkpoint at (0..1 to 0..N)"

    CUSTOMER {
        BIGINT customer_id PK "Auto-increment primary key"
        VARCHAR(30) customer_code UK "Unique business code (NOT NULL)"
        VARCHAR(120) name "Customer / company name (NOT NULL)"
        VARCHAR(20) phone "Contact phone (NOT NULL)"
        VARCHAR(150) email "Email address (NOT NULL)"
        VARCHAR(30) customer_type "INDIVIDUAL | CORPORATE | ECOMMERCE | RETAIL (NOT NULL)"
    }

    DRIVER {
        BIGINT driver_id PK "Auto-increment primary key"
        VARCHAR(30) driver_code UK "Unique driver code (NOT NULL)"
        VARCHAR(120) full_name "Driver full name (NOT NULL)"
        VARCHAR(20) phone "Contact phone (NOT NULL)"
        VARCHAR(50) licence_number "Driving licence number (NOT NULL)"
        VARCHAR(30) availability_status "AVAILABLE | ON_DUTY | ON_LEAVE | INACTIVE (NOT NULL)"
    }

    HUB {
        BIGINT hub_id PK "Auto-increment primary key"
        VARCHAR(30) hub_code UK "Unique hub code (NOT NULL)"
        VARCHAR(120) hub_name "Hub facility name (NOT NULL)"
        VARCHAR(80) city "Hub city (NOT NULL)"
        VARCHAR(255) address "Facility street address (NOT NULL)"
        VARCHAR(20) contact_number "Hub phone number (NOT NULL)"
    }

    SHIPMENT {
        BIGINT shipment_id PK "Auto-increment primary key"
        VARCHAR(40) tracking_number UK "Unique tracking number (NOT NULL)"
        BIGINT customer_id FK "References customers.customer_id (NOT NULL)"
        BIGINT driver_id FK "References drivers.driver_id (NULLABLE)"
        BIGINT origin_hub_id FK "References hubs.hub_id (NOT NULL)"
        VARCHAR(255) destination_address "Delivery street address (NOT NULL)"
        VARCHAR(80) destination_city "Delivery city (NOT NULL)"
        DATE created_date "Shipment registration date (NOT NULL)"
        DATE expected_delivery_date "Target delivery date >= created_date (NOT NULL)"
        VARCHAR(30) shipment_status "PENDING | PICKED_UP | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | CANCELLED (NOT NULL)"
        DECIMAL(10,2) weight "Consignment weight in kg > 0 (NOT NULL)"
    }

    TRACKING_EVENT {
        BIGINT event_id PK "Auto-increment primary key"
        BIGINT shipment_id FK "References shipments.shipment_id (NOT NULL)"
        DATETIME event_date_time "Timestamp of milestone event (NOT NULL)"
        VARCHAR(30) event_status "PENDING | PICKED_UP | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | CANCELLED (NOT NULL)"
        BIGINT hub_id FK "References hubs.hub_id (NULLABLE)"
        VARCHAR(500) remarks "Operational remarks / correction note (NULLABLE on create, REQUIRED on PUT)"
        VARCHAR(100) updated_by "Staff name or operator ID (NOT NULL)"
    }
```

## 2. Cardinalities and Optionality Summary

| Relationship | Cardinality | Optionality | Foreign Key & Referential Action |
|---|---|---|---|
| **Customer → Shipment** | One-to-Many (`1 : 0..N`) | Mandatory parent (`customer_id NOT NULL`) | `fk_shipment_customer` (`ON DELETE RESTRICT`) |
| **Driver → Shipment** | One-to-Many (`0..1 : 0..N`) | Optional driver (`driver_id NULL`) | `fk_shipment_driver` (`ON DELETE RESTRICT`) |
| **Hub → Shipment (Origin)** | One-to-Many (`1 : 0..N`) | Mandatory origin hub (`origin_hub_id NOT NULL`) | `fk_shipment_origin_hub` (`ON DELETE RESTRICT`) |
| **Shipment → TrackingEvent** | One-to-Many (`1 : 0..N`) | Mandatory parent (`shipment_id NOT NULL`) | `fk_tracking_shipment` (`ON DELETE RESTRICT`) |
| **Hub → TrackingEvent** | One-to-Many (`0..1 : 0..N`) | Optional hub (`hub_id NULL`) | `fk_tracking_hub` (`ON DELETE RESTRICT`) |

## 3. Architectural Constraints Enforced
- Exactly **five** persistent main business entities (`Customer`, `Driver`, `Hub`, `Shipment`, `TrackingEvent`).
- Destination address fields (`destination_address`, `destination_city`) are stored directly on `shipments` rather than introducing an external `Address` entity.
- `ON DELETE RESTRICT` prevents orphaned child rows at the database level while service-layer checks return descriptive `409 Conflict` API errors.

