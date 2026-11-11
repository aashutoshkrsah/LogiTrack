# Testing Documentation & Acceptance Matrix

## 1. Automated Verification Executed

### Backend Integration Suite (`LogisticsEndToEndIntegrationTest`)
Run with:
```powershell
cd backend
mvn test
```
Verified scenarios via real HTTP `MockMvc` -> Controller -> Service -> Spring Data JPA -> SQL database:
1. Full E2E workflow: Create Customer, Driver, Origin Hub, Transit Hub -> Register Shipment (unassigned driver) -> Assign Driver -> Append `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED` tracking events -> Fetch chronological timeline -> Verify `shipmentStatus` synchronized to `DELIVERED`.
2. Delayed shipment reporting: Create overdue shipment (`createdDate` = 6 days ago, `expectedDeliveryDate` = 2 days ago, status `IN_TRANSIT`) -> Verify `GET /api/dashboard/summary` reports accurate status counts and includes the overdue shipment in `delayedShipments`.
3. Duplicate tracking number rejection (`409 Conflict`).
4. Invalid expected delivery date rejection (`expectedDeliveryDate < createdDate` -> `400 Bad Request`).
5. Invalid foreign-key reference rejection (`customerId = 99999` -> `404 Not Found`).
6. Missing mandatory fields & malformed email/phone validation (`400 Bad Request` with `fieldErrors`).
7. Prohibited deletions of linked Customer, Driver, Hub (`409 Conflict`), and Driver status deactivation (`PATCH /api/drivers/{id}/availability` -> `INACTIVE`).
8. Prohibited deletion of Shipment with tracking history (`409 Conflict`) vs permitted deletion of Shipment without tracking history (`200 OK`).
9. Append-only tracking event correction rule (`PUT` without remarks -> `400 Bad Request`; `PUT` with remarks -> `200 OK` + status sync).
10. Tracking event deletion rule (historical event delete -> `409 Conflict`; latest non-delivered event delete -> `200 OK` + shipment status rollback).

### Frontend Production Build & Unit Tests
Run with:
```powershell
cd frontend
npx ng build --configuration production
npx ng test --watch=false --browsers=ChromeHeadless
```

---

## 2. Manual Acceptance Test Matrix (UI + Postman + MySQL)

| Test Case | Steps / Input | Expected Result | Status |
|---|---|---|---|
| **Create / Read** | Create a Customer, Driver, Hub, and Shipment via UI or Postman | Record persists in MySQL and appears in list & detail views | Verified (Integration Test) / Run live with MySQL |
| **Update** | Edit an existing record and refresh the page | Updated value persists across reloads and restarts | Verified (Integration Test) / Run live with MySQL |
| **Delete / Status** | Delete an unused shipment or deactivate an assigned driver (`INACTIVE`) | Unused record deleted; assigned driver deactivated | Verified (Integration Test) |
| **Invalid Input** | Submit empty required fields, bad email, invalid phone, or `weight <= 0` | Field-level Angular errors & `400 Bad Request` JSON returned; nothing persisted | Verified (Integration Test + Unit Tests) |
| **Duplicate Tracking #** | Submit an already existing `trackingNumber` | Rejected with `409 Conflict` | Verified (Integration Test) |
| **Invalid Expected Date** | Set `expectedDeliveryDate` earlier than `createdDate` | Rejected on both Angular form and Spring Boot API (`400 Bad Request`) | Verified (Integration Test + Unit Tests) |
| **Timeline Synchronization** | Record Picked Up -> In Transit -> Out for Delivery -> Delivered | `GET /api/shipments/{trackingNumber}/timeline` shows ascending chronological events & synced status | Verified (Integration Test) |
| **Delayed Dashboard** | Create shipment with past `expectedDeliveryDate` (`>= createdDate`) and non-delivered status | Dashboard displays incremented `Delayed (Overdue)` count and lists the shipment | Verified (Integration Test) |

