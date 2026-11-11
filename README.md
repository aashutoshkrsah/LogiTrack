# Logistics Shipment and Delivery Tracking System

A full-stack enterprise operations management web application built with **Angular 19**, **Java Spring Boot 3.4.5**, and **MySQL 8.0 (InnoDB)** for managing customers, drivers, delivery hubs, consignment registrations, manual operational tracking events, shipment timelines, and delayed delivery reporting.

---

## 1. Problem Statement
Logistics coordinators rely on fragmented spreadsheets to monitor consignments, customers, delivery addresses, fleet drivers, and milestone checkpoints. This leads to delayed visibility on overdue deliveries and inconsistent status reporting.

## 2. Objectives & Scope
- **Centralized Master Data**: Manage `Customer`, `Driver`, and `Hub` directories with unique business codes and deletion safeguards.
- **Shipment Registration & Dispatch**: Register consignments with unique tracking numbers, customer, origin hub, destination address/city, weight, expected delivery date, and optional driver assignment.
- **Manual Operational Tracking**: Record chronological `Pending`, `Picked Up`, `In Transit`, `Out for Delivery`, and `Delivered` events; automatically synchronize parent shipment status with the latest valid milestone.
- **Audit Integrity**: Enforce append-only tracking history (corrections require explicit `remarks`; shipments with tracking history cannot be deleted).
- **Operations Dashboard**: Display live backend counts, status distributions, recent tracking activity, and overdue/delayed shipments (`expectedDeliveryDate < today` and not delivered/cancelled).
- **Strict Scope Boundaries**: Exactly **5 persistent entities** (`Customer`, `Driver`, `Hub`, `Shipment`, `TrackingEvent`). No GPS tracking, route optimization, SMS alerts, or authentication layers.

---

## 3. Technology Stack

| Layer | Technologies & Selected Versions |
|---|---|
| **Frontend** | Angular `19.2`, TypeScript `5.7`, HTML5, CSS3, Bootstrap `5.3.3`, Bootstrap Icons `1.11.3`, Angular Router, HttpClient, Reactive Forms |
| **Backend** | Java `21` bytecode target (verified on JDK `24.0.1`), Spring Boot `3.4.5`, Spring Web, Spring Data JPA, Hibernate ORM, Jakarta Bean Validation |
| **Database** | MySQL `8.0` (InnoDB engine, UTF8MB4) |
| **Build & Tools** | Apache Maven `3.9.9`, Node.js `22.13.0`, npm `10.9.2`, Postman, MySQL Workbench |

---

## 4. Architecture & Project Structure

```text
Angular 19 UI (Components · Reactive Forms · Typed HttpClient Services)
        │  JSON / HTTP REST (/api/*)
        ▼
Spring Boot REST Controllers (Validation & HTTP Status Mapping)
        │
        ▼
Service Layer (Business Rules, FK Checks, Status Sync, Transactions)
        │
        ▼
Spring Data JPA Repositories (JPQL + JOIN FETCH Queries)
        │
        ▼
MySQL 8.0 InnoDB (5 Relational Tables + Foreign Keys + Constraints)
```

```text
project/
├── README.md
├── .env.example
├── .gitignore
├── database/
│   ├── schema.sql                  # MySQL InnoDB DDL (5 tables, PK/FK/UQ/CHECK)
│   ├── sample-data.sql             # Sample operational data incl. overdue shipments
│   └── schema_and_data.sql         # Combined script for MySQL Workbench
├── docs/
│   ├── ER_DIAGRAM.md               # Mermaid ER diagram & cardinality matrix
│   ├── API_DOCUMENTATION.md        # Complete REST API contract
│   ├── TESTING_GUIDE.md            # Automated & manual verification matrix
│   └── SCREENSHOT_CHECKLIST.md     # Guide for all 8 assignment screenshots
├── postman/
│   └── Logistics_Tracking_API.postman_collection.json
├── backend/                        # Spring Boot REST API
└── frontend/                       # Angular 19 SPA
```

---

## 5. Database Setup (MySQL 8.0)

1. Open **MySQL Workbench** or `mysql` CLI.
2. Execute [`database/schema_and_data.sql`](database/schema_and_data.sql) (or run `schema.sql` followed by `sample-data.sql`).
3. This creates database `logistics_db` with the 5 InnoDB tables (`customers`, `drivers`, `hubs`, `shipments`, `tracking_events`) and populates realistic sample records including on-time, delivered, deletable, and overdue shipments.

---

## 6. Backend Setup & Execution (`backend/`)

Configure database credentials via environment variables (see [`.env.example`](.env.example); never commit real passwords):

```powershell
# PowerShell example
$env:DB_URL="jdbc:mysql://localhost:3306/logistics_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"

cd backend
mvn spring-boot:run
```

The REST API starts on `http://localhost:8080`.

---

## 7. Frontend Setup & Execution (`frontend/`)

```powershell
cd frontend
npm install
npm start
```

Angular dev server starts on `http://localhost:4200` with `proxy.conf.json` forwarding `/api/*` requests directly to `http://localhost:8080`.

---

## 8. API Endpoints Summary

| Resource | Endpoints |
|---|---|
| **Dashboard** | `GET /api/dashboard/summary` |
| **Customers** | `GET / POST /api/customers`, `GET / PUT / DELETE /api/customers/{id}` |
| **Drivers** | `GET / POST /api/drivers`, `GET / PUT / DELETE /api/drivers/{id}`, `PATCH /api/drivers/{id}/availability` |
| **Hubs** | `GET / POST /api/hubs`, `GET / PUT / DELETE /api/hubs/{id}` |
| **Shipments** | `GET / POST /api/shipments`, `GET / PUT / DELETE /api/shipments/{id}`, `GET /api/shipments/{trackingNumber}/timeline` |
| **Tracking Events** | `GET / POST /api/tracking-events`, `GET / PUT / DELETE /api/tracking-events/{id}` |

See [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) for full request/response schemas.

---

## 9. How to Test

- **Backend Integration Suite** (runs full Spring Boot + JPA + MockMvc tests):
  ```powershell
  cd backend
  mvn test
  ```
- **Frontend Production Build & Unit Tests**:
  ```powershell
  cd frontend
  npm run build -- --configuration production
  npm test -- --watch=false --browsers=ChromeHeadless
  ```
- **Postman Testing**: Import [`postman/Logistics_Tracking_API.postman_collection.json`](postman/Logistics_Tracking_API.postman_collection.json) and execute positive CRUD, timeline, dashboard, and negative validation/conflict requests.

