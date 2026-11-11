import { ShipmentResponse, ShipmentStatus } from './shipment.model';

export interface TrackingEventRequest {
  shipmentId: number;
  eventDateTime: string;
  eventStatus: ShipmentStatus;
  hubId: number | null;
  remarks: string | null;
  updatedBy: string;
}

export interface TrackingEventResponse {
  eventId: number;
  shipmentId: number;
  trackingNumber: string;
  eventDateTime: string;
  eventStatus: ShipmentStatus;
  hubId: number | null;
  hubCode: string | null;
  hubName: string | null;
  hubCity: string | null;
  remarks: string | null;
  updatedBy: string;
}

export interface ShipmentTimelineResponse {
  shipment: ShipmentResponse;
  events: TrackingEventResponse[];
}

