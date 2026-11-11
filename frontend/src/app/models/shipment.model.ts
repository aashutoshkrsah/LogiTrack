export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ShipmentRequest {
  trackingNumber: string;
  customerId: number;
  driverId: number | null;
  originHubId: number;
  destinationAddress: string;
  destinationCity: string;
  createdDate: string;
  expectedDeliveryDate: string;
  shipmentStatus?: ShipmentStatus;
  weight: number;
}

export interface ShipmentResponse {
  shipmentId: number;
  trackingNumber: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  driverId: number | null;
  driverCode: string | null;
  driverName: string | null;
  originHubId: number;
  originHubCode: string;
  originHubName: string;
  originCity: string;
  destinationAddress: string;
  destinationCity: string;
  createdDate: string;
  expectedDeliveryDate: string;
  shipmentStatus: ShipmentStatus;
  weight: number;
  delayed: boolean;
  trackingEventCount: number;
}

export interface ShipmentFilterParams {
  trackingNumber?: string;
  status?: ShipmentStatus | '';
  fromDate?: string;
  toDate?: string;
  customerId?: number;
  driverId?: number;
  originHubId?: number;
  delayedOnly?: boolean;
}

