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

export interface DailyPoint {
  date: string;
  created: number;
  delivered: number;
}

export interface HubThroughput {
  hubCode: string;
  hubName: string;
  city: string;
  count: number;
}

export interface DriverLeaderboardItem {
  driverCode: string;
  driverName: string;
  deliveredCount: number;
  totalCount: number;
}

export interface StatusMixItem {
  status: string;
  count: number;
  percentage: number;
}

export interface AnalyticsResponse {
  daily: DailyPoint[];
  onTimePct: number;
  avgDeliveryDays: number;
  hubThroughput: HubThroughput[];
  driverLeaderboard: DriverLeaderboardItem[];
  statusMix: StatusMixItem[];
}

export interface NotificationsResponse {
  delayedShipments: ShipmentResponse[];
  recentEvents: TrackingEventResponse[];
  unreadCount: number;
}

