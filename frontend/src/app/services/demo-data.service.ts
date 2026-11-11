import { Injectable } from '@angular/core';
import { AnalyticsResponse, DashboardSummaryResponse, NotificationsResponse } from '../models/dashboard.model';
import { CustomerResponse } from '../models/customer.model';
import { DriverResponse } from '../models/driver.model';
import { HubResponse } from '../models/hub.model';
import { ShipmentResponse } from '../models/shipment.model';
import { TrackingEventResponse } from '../models/tracking-event.model';

/** Labelled DEMO data used ONLY when the backend is unreachable (HTTP status 0).
 *  Never presented as live data — callers must show the DEMO DATA banner. */

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  readonly hubs: HubResponse[] = [
    { hubId: 1, hubCode: 'HUB-BLR', hubName: 'Bengaluru Central Hub', city: 'Bengaluru', address: 'Peenya Industrial Area, Bengaluru', contactNumber: '080-4111-2201', originShipmentCount: 4 },
    { hubId: 2, hubCode: 'HUB-MUM', hubName: 'Mumbai Gateway Hub', city: 'Mumbai', address: 'Andheri East, Mumbai', contactNumber: '022-4891-3302', originShipmentCount: 2 },
    { hubId: 3, hubCode: 'HUB-CHE', hubName: 'Chennai South Hub', city: 'Chennai', address: 'Guindy Industrial Estate, Chennai', contactNumber: '044-4210-4403', originShipmentCount: 2 }
  ];

  readonly customers: CustomerResponse[] = [
    { customerId: 1, customerCode: 'CUST-001', name: 'Acme Retail Pvt Ltd', phone: '9845012345', email: 'ops@acmeretail.in', customerType: 'CORPORATE', shipmentCount: 3 },
    { customerId: 2, customerCode: 'CUST-002', name: 'Priya Sharma', phone: '9901122334', email: 'priya.sharma@example.in', customerType: 'INDIVIDUAL', shipmentCount: 2 },
    { customerId: 3, customerCode: 'CUST-003', name: 'FlipKart Sellers Hub', phone: '9812345670', email: 'logistics@flipkart-sellers.in', customerType: 'ECOMMERCE', shipmentCount: 2 },
    { customerId: 4, customerCode: 'CUST-004', name: 'Nilgiris Supermarket', phone: '9744001122', email: 'supply@nilgiris.in', customerType: 'RETAIL', shipmentCount: 1 }
  ];

  readonly drivers: DriverResponse[] = [
    { driverId: 1, driverCode: 'DRV-001', fullName: 'Ravi Kumar', phone: '9988776655', licenceNumber: 'KA05-2021-001234', availabilityStatus: 'ON_DUTY', shipmentCount: 3 },
    { driverId: 2, driverCode: 'DRV-002', fullName: 'Suresh Nair', phone: '9977665544', licenceNumber: 'KA41-2019-009876', availabilityStatus: 'AVAILABLE', shipmentCount: 2 },
    { driverId: 3, driverCode: 'DRV-003', fullName: 'Anita Desai', phone: '9966554433', licenceNumber: 'MH02-2020-005432', availabilityStatus: 'ON_DUTY', shipmentCount: 2 }
  ];

  readonly shipments: ShipmentResponse[] = [
    { shipmentId: 1, trackingNumber: 'TRK-2026-0001', customerId: 1, customerCode: 'CUST-001', customerName: 'Acme Retail Pvt Ltd', driverId: 1, driverCode: 'DRV-001', driverName: 'Ravi Kumar', originHubId: 1, originHubCode: 'HUB-BLR', originHubName: 'Bengaluru Central Hub', originCity: 'Bengaluru', destinationAddress: 'MG Road, Pune', destinationCity: 'Pune', createdDate: isoDaysAgo(6), expectedDeliveryDate: isoDaysAgo(1), shipmentStatus: 'IN_TRANSIT', weight: 24.5, delayed: true, trackingEventCount: 3 },
    { shipmentId: 2, trackingNumber: 'TRK-2026-0002', customerId: 2, customerCode: 'CUST-002', customerName: 'Priya Sharma', driverId: 2, driverCode: 'DRV-002', driverName: 'Suresh Nair', originHubId: 1, originHubCode: 'HUB-BLR', originHubName: 'Bengaluru Central Hub', originCity: 'Bengaluru', destinationAddress: 'Koramangala, Bengaluru', destinationCity: 'Bengaluru', createdDate: isoDaysAgo(4), expectedDeliveryDate: isoDaysAgo(2), shipmentStatus: 'OUT_FOR_DELIVERY', weight: 3.2, delayed: true, trackingEventCount: 4 },
    { shipmentId: 3, trackingNumber: 'TRK-2026-0003', customerId: 1, customerCode: 'CUST-001', customerName: 'Acme Retail Pvt Ltd', driverId: null, driverCode: null, driverName: null, originHubId: 2, originHubCode: 'HUB-MUM', originHubName: 'Mumbai Gateway Hub', originCity: 'Mumbai', destinationAddress: 'Anna Nagar, Chennai', destinationCity: 'Chennai', createdDate: isoDaysAgo(1), expectedDeliveryDate: isoDaysAhead(3), shipmentStatus: 'PENDING', weight: 18.0, delayed: false, trackingEventCount: 0 },
    { shipmentId: 4, trackingNumber: 'TRK-2026-0004', customerId: 3, customerCode: 'CUST-003', customerName: 'FlipKart Sellers Hub', driverId: 3, driverCode: 'DRV-003', driverName: 'Anita Desai', originHubId: 2, originHubCode: 'HUB-MUM', originHubName: 'Mumbai Gateway Hub', originCity: 'Mumbai', destinationAddress: 'HSR Layout, Bengaluru', destinationCity: 'Bengaluru', createdDate: isoDaysAgo(3), expectedDeliveryDate: isoDaysAhead(1), shipmentStatus: 'PICKED_UP', weight: 12.75, delayed: false, trackingEventCount: 2 },
    { shipmentId: 5, trackingNumber: 'TRK-2026-0005', customerId: 2, customerCode: 'CUST-002', customerName: 'Priya Sharma', driverId: 1, driverCode: 'DRV-001', driverName: 'Ravi Kumar', originHubId: 3, originHubCode: 'HUB-CHE', originHubName: 'Chennai South Hub', originCity: 'Chennai', destinationAddress: 'Indiranagar, Bengaluru', destinationCity: 'Bengaluru', createdDate: isoDaysAgo(5), expectedDeliveryDate: isoDaysAgo(1), shipmentStatus: 'DELIVERED', weight: 5.4, delayed: false, trackingEventCount: 5 },
    { shipmentId: 6, trackingNumber: 'TRK-2026-0006', customerId: 4, customerCode: 'CUST-004', customerName: 'Nilgiris Supermarket', driverId: 3, driverCode: 'DRV-003', driverName: 'Anita Desai', originHubId: 3, originHubCode: 'HUB-CHE', originHubName: 'Chennai South Hub', originCity: 'Chennai', destinationAddress: 'Whitefield, Bengaluru', destinationCity: 'Bengaluru', createdDate: isoDaysAgo(7), expectedDeliveryDate: isoDaysAgo(3), shipmentStatus: 'DELIVERED', weight: 42.0, delayed: false, trackingEventCount: 5 },
    { shipmentId: 7, trackingNumber: 'TRK-2026-0007', customerId: 3, customerCode: 'CUST-003', customerName: 'FlipKart Sellers Hub', driverId: 2, driverCode: 'DRV-002', driverName: 'Suresh Nair', originHubId: 1, originHubCode: 'HUB-BLR', originHubName: 'Bengaluru Central Hub', originCity: 'Bengaluru', destinationAddress: 'Bandra West, Mumbai', destinationCity: 'Mumbai', createdDate: isoDaysAgo(2), expectedDeliveryDate: isoDaysAhead(2), shipmentStatus: 'IN_TRANSIT', weight: 9.9, delayed: false, trackingEventCount: 3 },
    { shipmentId: 8, trackingNumber: 'TRK-2026-0008', customerId: 1, customerCode: 'CUST-001', customerName: 'Acme Retail Pvt Ltd', driverId: 1, driverCode: 'DRV-001', driverName: 'Ravi Kumar', originHubId: 1, originHubCode: 'HUB-BLR', originHubName: 'Bengaluru Central Hub', originCity: 'Bengaluru', destinationAddress: 'T Nagar, Chennai', destinationCity: 'Chennai', createdDate: isoDaysAgo(8), expectedDeliveryDate: isoDaysAgo(4), shipmentStatus: 'DELIVERED', weight: 15.25, delayed: false, trackingEventCount: 5 }
  ];

  readonly events: TrackingEventResponse[] = [
    { eventId: 1, shipmentId: 1, trackingNumber: 'TRK-2026-0001', eventDateTime: `${isoDaysAgo(6)}T09:15:00`, eventStatus: 'PENDING', hubId: 1, hubCode: 'HUB-BLR', hubName: 'Bengaluru Central Hub', hubCity: 'Bengaluru', remarks: 'Shipment registered at origin hub.', updatedBy: 'dispatcher@logitrack.in' },
    { eventId: 2, shipmentId: 1, trackingNumber: 'TRK-2026-0001', eventDateTime: `${isoDaysAgo(5)}T11:30:00`, eventStatus: 'PICKED_UP', hubId: 1, hubCode: 'HUB-BLR', hubName: 'Bengaluru Central Hub', hubCity: 'Bengaluru', remarks: 'Picked up by Ravi Kumar.', updatedBy: 'dispatcher@logitrack.in' },
    { eventId: 3, shipmentId: 1, trackingNumber: 'TRK-2026-0001', eventDateTime: `${isoDaysAgo(4)}T08:00:00`, eventStatus: 'IN_TRANSIT', hubId: null, hubCode: null, hubName: null, hubCity: null, remarks: 'Departed Bengaluru hub en route to Pune.', updatedBy: 'dispatcher@logitrack.in' },
    { eventId: 4, shipmentId: 5, trackingNumber: 'TRK-2026-0005', eventDateTime: `${isoDaysAgo(1)}T16:40:00`, eventStatus: 'DELIVERED', hubId: null, hubCode: null, hubName: null, hubCity: null, remarks: 'Delivered to Priya Sharma.', updatedBy: 'dispatcher@logitrack.in' },
    { eventId: 5, shipmentId: 2, trackingNumber: 'TRK-2026-0002', eventDateTime: `${isoDaysAgo(1)}T09:05:00`, eventStatus: 'OUT_FOR_DELIVERY', hubId: 1, hubCode: 'HUB-BLR', hubName: 'Bengaluru Central Hub', hubCity: 'Bengaluru', remarks: 'Out for delivery with Suresh Nair.', updatedBy: 'dispatcher@logitrack.in' }
  ];

  getSummary(): DashboardSummaryResponse {
    const s = this.shipments;
    const count = (st: string): number => s.filter((x) => x.shipmentStatus === st).length;
    return {
      totalShipments: s.length,
      pendingShipments: count('PENDING'),
      pickedUpShipments: count('PICKED_UP'),
      inTransitShipments: count('IN_TRANSIT'),
      outForDeliveryShipments: count('OUT_FOR_DELIVERY'),
      deliveredShipments: count('DELIVERED'),
      cancelledShipments: count('CANCELLED'),
      delayedShipmentsCount: s.filter((x) => x.delayed).length,
      totalCustomers: this.customers.length,
      totalDrivers: this.drivers.length,
      availableDrivers: this.drivers.filter((d) => d.availabilityStatus === 'AVAILABLE').length,
      totalHubs: this.hubs.length,
      statusDistribution: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => ({
        status: st as never,
        count: count(st),
        percentage: Math.round((count(st) / s.length) * 100)
      })),
      delayedShipments: s.filter((x) => x.delayed),
      recentTrackingEvents: [...this.events].slice(-4).reverse()
    };
  }

  getAnalytics(): AnalyticsResponse {
    const daily = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const date = d.toISOString().slice(0, 10);
      const created = this.shipments.filter((s) => s.createdDate === date).length;
      const delivered = this.events.filter((e) => e.eventStatus === 'DELIVERED' && e.eventDateTime.slice(0, 10) === date).length;
      return { date, created, delivered };
    });
    // Spread the demo shipments across the 14-day window so the chart is not flat.
    daily[2].created += 1;
    daily[5].created += 1;
    daily[8].created += 1;
    daily[9].delivered += 1;
    daily[11].delivered += 1;
    const deliveredTotal = this.shipments.filter((s) => s.shipmentStatus === 'DELIVERED').length;
    return {
      daily,
      onTimePct: 75,
      avgDeliveryDays: 3.4,
      hubThroughput: this.hubs.map((h) => ({ hubCode: h.hubCode, hubName: h.hubName, city: h.city, count: h.originShipmentCount })),
      driverLeaderboard: this.drivers.map((d) => ({
        driverCode: d.driverCode,
        driverName: d.fullName,
        deliveredCount: this.shipments.filter((s) => s.driverId === d.driverId && s.shipmentStatus === 'DELIVERED').length,
        totalCount: d.shipmentCount
      })),
      statusMix: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => {
        const c = this.shipments.filter((s) => s.shipmentStatus === st).length;
        return { status: st, count: c, percentage: Math.round((c / this.shipments.length) * 100) };
      })
    };
  }

  getNotifications(): NotificationsResponse {
    return {
      delayedShipments: this.shipments.filter((s) => s.delayed),
      recentEvents: [...this.events].reverse(),
      unreadCount: this.shipments.filter((s) => s.delayed).length + 1
    };
  }
}
