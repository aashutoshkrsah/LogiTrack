import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../models/dashboard.model';
import { ShipmentFilterParams, ShipmentRequest, ShipmentResponse } from '../models/shipment.model';
import { ShipmentTimelineResponse } from '../models/tracking-event.model';

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

