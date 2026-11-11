# Required Screenshot Evidence Checklist (8 Screenshots)

Use this checklist to capture all eight assignment screenshots once the MySQL database, Spring Boot API, and Angular UI are running:

1. **Screenshot 1 — Project Setup**
   - Open IDE / File Explorer showing both `frontend/` (`src/app/components`, `pages`, `services`, `models`, `validators`, `package.json`) and `backend/` (`src/main/java/com/project/logistics/...`, `pom.xml`, `application.properties`).

2. **Screenshot 2 — Home / Dashboard**
   - Navigate to `http://localhost:4200/dashboard`.
   - Capture the sidebar navigation, KPI cards (Total, Pending, Picked Up, In Transit, Out for Delivery, Delivered, Delayed Overdue), status distribution bars, recent tracking activity, and overdue shipments table.

3. **Screenshot 3 — Create**
   - Navigate to `/shipments/new` (or `/customers/new`).
   - Show a filled valid form and the resulting saved record detail page with toast confirmation.

4. **Screenshot 4 — Read / List**
   - Navigate to `/shipments` (with search/status/date filters visible) and `/tracking` showing the chronological shipment tracking timeline.

5. **Screenshot 5 — Update**
   - Navigate to `/shipments/:id/edit` or `/customers/:id/edit`, update a field (e.g., assign driver or update expected delivery date / correct a tracking event with remarks), and capture the updated persisted detail view.

6. **Screenshot 6 — Delete / Status**
   - Show either deleting a newly created unused shipment (with confirmation modal) OR changing an assigned driver's availability status to `INACTIVE` in `/drivers`, and the resulting updated list.

7. **Screenshot 7 — API / Backend (Postman)**
   - Import `postman/Logistics_Tracking_API.postman_collection.json` into Postman.
   - Capture requests and JSON responses for:
     - `GET /api/dashboard/summary` or `GET /api/shipments/{trackingNumber}/timeline`
     - `POST /api/shipments`
     - `PUT /api/shipments/{id}`
     - `DELETE /api/shipments/{id}` (and optionally negative `409 Conflict` when tracking events exist).

8. **Screenshot 8 — Database (MySQL Workbench)**
   - Open MySQL Workbench connected to `logistics_db`.
   - Capture `SHOW TABLES;`, `SELECT * FROM shipments;`, `SELECT * FROM tracking_events;`, and the EER Diagram / Foreign Key Inspector confirming all 5 InnoDB tables and PK/FK constraints.

