import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../models/dashboard.model';
import { ShipmentStatus } from '../models/shipment.model';
import { TrackingEventRequest, TrackingEventResponse } from '../models/tracking-event.model';

@Injectable({ providedIn: 'root' })
export class TrackingEventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/tracking-events`;

  getAll(shipmentId?: number, trackingNumber?: string, status?: ShipmentStatus | ''): Observable<TrackingEventResponse[]> {
    let params = new HttpParams();
    if (shipmentId !== undefined && shipmentId !== null) {
      params = params.set('shipmentId', shipmentId.toString());
    }
    if (trackingNumber && trackingNumber.trim()) {
      params = params.set('trackingNumber', trackingNumber.trim());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<TrackingEventResponse[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<TrackingEventResponse> {
    return this.http.get<TrackingEventResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: TrackingEventRequest): Observable<TrackingEventResponse> {
    return this.http.post<TrackingEventResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: TrackingEventRequest): Observable<TrackingEventResponse> {
    return this.http.put<TrackingEventResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
}

