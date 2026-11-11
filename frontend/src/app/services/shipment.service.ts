import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse, normalizePage } from '../models/page.model';
import { MessageResponse } from '../models/dashboard.model';
import { ShipmentFilterParams, ShipmentRequest, ShipmentResponse, ShipmentStatus } from '../models/shipment.model';
import { ShipmentTimelineResponse } from '../models/tracking-event.model';

export const NEXT_STATUS: Record<ShipmentStatus, ShipmentStatus | null> = {
  PENDING: 'PICKED_UP',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null
};

export function nextStatusLabel(status: ShipmentStatus): string {
  const next = NEXT_STATUS[status];
  return next ? `Advance to ${next.replace(/_/g, ' ')}` : 'No further status';
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/shipments`;

  getAll(filters: ShipmentFilterParams = {}): Observable<ShipmentResponse[]> {
    let params = new HttpParams();
    if (filters.trackingNumber && filters.trackingNumber.trim()) {
      params = params.set('trackingNumber', filters.trackingNumber.trim());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.customerId !== undefined && filters.customerId !== null) {
      params = params.set('customerId', filters.customerId.toString());
    }
    if (filters.driverId !== undefined && filters.driverId !== null) {
      params = params.set('driverId', filters.driverId.toString());
    }
    if (filters.originHubId !== undefined && filters.originHubId !== null) {
      params = params.set('originHubId', filters.originHubId.toString());
    }
    if (filters.delayedOnly) {
      params = params.set('delayedOnly', 'true');
    }
    return this.http.get<ShipmentResponse[]>(this.baseUrl, { params });
  }


  getPaged(filters: ShipmentFilterParams = {}, page = 0, size = 10, sort?: string): Observable<PageResponse<ShipmentResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filters.trackingNumber && filters.trackingNumber.trim()) params = params.set('trackingNumber', filters.trackingNumber.trim());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.customerId !== undefined && filters.customerId !== null) params = params.set('customerId', filters.customerId.toString());
    if (filters.driverId !== undefined && filters.driverId !== null) params = params.set('driverId', filters.driverId.toString());
    if (filters.originHubId !== undefined && filters.originHubId !== null) params = params.set('originHubId', filters.originHubId.toString());
    if (filters.delayedOnly) params = params.set('delayedOnly', 'true');
    if (sort) params = params.set('sort', sort);
    return this.http.get<ShipmentResponse[] | PageResponse<ShipmentResponse>>(this.baseUrl, { params })
      .pipe(map((res) => normalizePage(res)));
  }

  exportCsv(filters: ShipmentFilterParams = {}): Observable<Blob> {
    let params = new HttpParams();
    if (filters.trackingNumber && filters.trackingNumber.trim()) params = params.set('trackingNumber', filters.trackingNumber.trim());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.delayedOnly) params = params.set('delayedOnly', 'true');
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

  assignDriver(id: number, driverId: number): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/${id}/assign-driver`, { driverId });
  }

  advance(id: number): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/${id}/advance`, {});
  }

  cancel(id: number, reason: string): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/${id}/cancel`, { reason });
  }

  deliver(id: number, receivedBy: string, remarks?: string): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/${id}/deliver`, { receivedBy, remarks: remarks ?? null });
  }

  /** Public (no-auth) tracking lookup used by /track. */
  trackPublic(trackingNumber: string): Observable<ShipmentTimelineResponse> {
    const encoded = encodeURIComponent(trackingNumber.trim());
    return this.http.get<ShipmentTimelineResponse>(`${environment.apiBaseUrl}/public/track/${encoded}`);
  }

  getById(id: number): Observable<ShipmentResponse> {
    return this.http.get<ShipmentResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: ShipmentRequest): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: ShipmentRequest): Observable<ShipmentResponse> {
    return this.http.put<ShipmentResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }

  getTimelineByTrackingNumber(trackingNumber: string): Observable<ShipmentTimelineResponse> {
    const encoded = encodeURIComponent(trackingNumber.trim());
    return this.http.get<ShipmentTimelineResponse>(`${this.baseUrl}/${encoded}/timeline`);
  }
}

