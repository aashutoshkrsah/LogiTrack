# REST API Documentation — Logistics Shipment and Delivery Tracking System

Base URL: `http://localhost:8080/api`
Content-Type: `application/json`

## Error Response Contract
All `4xx` / `5xx` error responses follow a uniform JSON structure (`ApiErrorResponse`):
```json
{
  "timestamp": "2026-11-11T21:15:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed. Please check the submitted fields.",
  "path": "/api/customers",
  "fieldErrors": {
    "email": "Please provide a valid email address"
  }
}
```

---

## 1. Customers (`/api/customers`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/customers?search=&customerType=` | List/search customers | `200 OK` |
| `GET` | `/api/customers/{id}` | Get customer by ID | `200 OK` |
| `POST` | `/api/customers` | Create a new customer (`customerCode` unique) | `201 Created` |
| `PUT` | `/api/customers/{id}` | Update customer details | `200 OK` |
| `DELETE` | `/api/customers/{id}` | Delete customer (blocked `409` if shipments exist) | `200 OK` |

**Customer Request Body:**
```json
{
  "customerCode": "CUST-1010",
  "name": "Apex Infrastructure Corp",
  "phone": "+91-98201-11001",
  "email": "logistics@apexinfra.example.com",
  "customerType": "CORPORATE"
}
```
Allowed `customerType`: `INDIVIDUAL`, `CORPORATE`, `ECOMMERCE`, `RETAIL`.

---

## 2. Drivers (`/api/drivers`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/drivers?search=&availabilityStatus=` | List/search drivers | `200 OK` |
| `GET` | `/api/drivers/{id}` | Get driver by ID | `200 OK` |
| `POST` | `/api/drivers` | Create a new driver (`driverCode` unique) | `201 Created` |
| `PUT` | `/api/drivers/{id}` | Update driver details | `200 OK` |
| `PATCH` | `/api/drivers/{id}/availability` | Update driver `availabilityStatus` | `200 OK` |
| `DELETE` | `/api/drivers/{id}` | Delete driver (blocked `409` if assigned to shipments) | `200 OK` |

**Driver Request Body:**
```json
{
  "driverCode": "DRV-2010",
  "fullName": "Rajesh Kumar Sharma",
  "phone": "+91-98220-10001",
  "licenceNumber": "MH12-20190045123",
  "availabilityStatus": "AVAILABLE"
}
```
Allowed `availabilityStatus`: `AVAILABLE`, `ON_DUTY`, `ON_LEAVE`, `INACTIVE`.

---

## 3. Hubs (`/api/hubs`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/hubs?search=&city=` | List/search hubs | `200 OK` |
| `GET` | `/api/hubs/{id}` | Get hub by ID | `200 OK` |
| `POST` | `/api/hubs` | Create a new hub (`hubCode` unique) | `201 Created` |
| `PUT` | `/api/hubs/{id}` | Update hub details | `200 OK` |
| `DELETE` | `/api/hubs/{id}` | Delete hub (blocked `409` if referenced by shipments/events) | `200 OK` |

**Hub Request Body:**
```json
{
  "hubCode": "HUB-MUM-01",
  "hubName": "Mumbai Central Logistics Hub",
  "city": "Mumbai",
  "address": "Plot 42, MIDC Andheri East, Mumbai 400093",
  "contactNumber": "+91-22-4001-1000"
}
```

---

## 4. Shipments (`/api/shipments`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/shipments?trackingNumber=&status=&fromDate=&toDate=&delayedOnly=` | Search and filter shipments | `200 OK` |
| `GET` | `/api/shipments/{id}` | Get shipment details by ID | `200 OK` |
| `POST` | `/api/shipments` | Register shipment (`trackingNumber` unique, `driverId` optional) | `201 Created` |
| `PUT` | `/api/shipments/{id}` | Update shipment & driver assignment | `200 OK` |
| `DELETE` | `/api/shipments/{id}` | Delete shipment (blocked `409` if tracking events exist) | `200 OK` |
| `GET` | `/api/shipments/{trackingNumber}/timeline` | Get shipment + chronological tracking events | `200 OK` |

**Shipment Request Body:**
```json
{
  "trackingNumber": "TRK-2026-0100",
  "customerId": 1,
  "driverId": 2,
  "originHubId": 1,
  "destinationAddress": "Plot 19, Hinjewadi Phase 2",
  "destinationCity": "Pune",
  "createdDate": "2026-11-11",
  "expectedDeliveryDate": "2026-11-15",
  "shipmentStatus": "PENDING",
  "weight": 42.50
}
```
Allowed `shipmentStatus`: `PENDING`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

---

## 5. Tracking Events (`/api/tracking-events`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/tracking-events?shipmentId=&trackingNumber=&status=` | List/filter tracking events | `200 OK` |
| `GET` | `/api/tracking-events/{id}` | Get event by ID | `200 OK` |
| `POST` | `/api/tracking-events` | Append milestone & sync parent `shipmentStatus` | `201 Created` |
| `PUT` | `/api/tracking-events/{id}` | Correct event (**requires non-blank `remarks`**) & re-sync status | `200 OK` |
| `DELETE` | `/api/tracking-events/{id}` | Delete ONLY latest event of non-delivered shipment & re-sync status | `200 OK` |

**Tracking Event Request Body:**
```json
{
  "shipmentId": 1,
  "eventDateTime": "2026-11-11T14:30:00",
  "eventStatus": "IN_TRANSIT",
  "hubId": 2,
  "remarks": "Arrived at Pune Regional Transit Center",
  "updatedBy": "Hub Supervisor K. Kulkarni"
}
```

---

## 6. Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Fetch all shipment status counts, delayed shipments, distribution, and recent events | `200 OK` |


---

## 9. Authentication (`/api/auth`)

Demo users are seeded from environment variables (`APP_AUTH_ADMIN_EMAIL` /
`APP_AUTH_ADMIN_PASSWORD`, dispatcher, viewer). Passwords are BCrypt-hashed in memory
at startup. All other `/api/**` endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login with `{email, password}` → `{token, tokenType: "Bearer", email, name, role, expiresInSeconds}` | `200 OK` |
| `GET` | `/api/auth/me` | Current user `{email, name, role}` (requires token) | `200 OK` |

Demo credentials: `admin@logitrack.in` / `Admin@123` (ADMIN),
`dispatcher@logitrack.in` / `Dispatch@123` (DISPATCHER),
`viewer@logitrack.in` / `View@123` (VIEWER). Wrong credentials return `401`.

## 10. Pagination, sorting & search (all list endpoints)

`GET /api/customers`, `/api/drivers`, `/api/hubs`, `/api/shipments`, `/api/tracking-events`
accept optional `?page=0&size=10&sort=createdDate,desc` (plus each endpoint's existing
filters). **With `page`:** response is a page object:

```json
{ "content": [ "..." ], "page": 0, "size": 10, "totalElements": 42, "totalPages": 5 }
```

**Without `page`:** the original plain JSON array is returned (backward compatible).
`sort` is `field,asc|desc`; unknown fields fall back to the default sort (ID descending).
`size` is capped at 100.

## 11. Dashboard analytics & notifications (`/api/dashboard`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/analytics` | 14-day daily `{date, created, delivered}`, `onTimePct`, `avgDeliveryDays`, `deliveredCount`, `hubThroughput[]`, `driverLeaderboard[]` (`{driverCode, driverName, deliveredCount, totalCount}`), `statusMix[]` |
| `GET` | `/api/dashboard/notifications` | `{delayedShipments[], recentEvents[], unreadCount}` |

On-time % = delivered shipments whose proof-of-delivery date is on or before the
expected delivery date, as a share of all delivered shipments. Average delivery days
is measured from `createdDate` to the DELIVERED tracking event date.

## 12. Shipment workflow actions (`/api/shipments/{id}`)

| Method | Endpoint | Description | Rules |
|---|---|---|---|
| `POST` | `/api/shipments/{id}/assign-driver` | Body `{driverId}` → updated shipment | Rejected `409` for DELIVERED/CANCELLED shipments; INACTIVE drivers rejected |
| `POST` | `/api/shipments/{id}/advance` | Move to the next legal status, appends a tracking event | PENDING→PICKED_UP→IN_TRANSIT→OUT_FOR_DELIVERY→DELIVERED; `409` if terminal |
| `POST` | `/api/shipments/{id}/cancel` | Body `{reason?}` → CANCELLED + tracking event | `409` if already DELIVERED or CANCELLED |
| `POST` | `/api/shipments/{id}/deliver` | Body `{receivedBy, remarks?}` → DELIVERED + proof-of-delivery event | Only from OUT_FOR_DELIVERY (`409` otherwise) |

## 13. CSV export

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipments/export` | CSV download; respects the same filters as `GET /api/shipments` |
| `GET` | `/api/customers/export` | CSV download; respects `search` / `customerType` |
| `GET` | `/api/drivers/export` | CSV download; respects `search` / `availabilityStatus` |

Response: `Content-Type: text/csv`, `Content-Disposition: attachment`.

## 14. Public tracking (`/api/public`) — no authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/track/{trackingNumber}` | Shipment summary + chronological timeline (`{shipment, events}`) |

## 15. Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/actuator/health` | `{"status":"UP"}` — public, no authentication |
