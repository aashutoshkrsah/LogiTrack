import { ShipmentResponse, ShipmentStatus } from './shipment.model';
import { TrackingEventResponse } from './tracking-event.model';

export interface StatusDistributionItem {
  status: ShipmentStatus;
  count: number;
  percentage: number;
}

export interface DashboardSummaryResponse {
  totalShipments: number;
  pendingShipments: number;
  pickedUpShipments: number;
  inTransitShipments: number;
  outForDeliveryShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
  delayedShipmentsCount: number;
  totalCustomers: number;
  totalDrivers: number;
  availableDrivers: number;
  totalHubs: number;
  statusDistribution: StatusDistributionItem[];
  delayedShipments: ShipmentResponse[];
  recentTrackingEvents: TrackingEventResponse[];
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export interface MessageResponse {
  message: string;
}

