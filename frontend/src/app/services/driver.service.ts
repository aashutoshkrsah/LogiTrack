import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../models/dashboard.model';
import { AvailabilityStatus, DriverRequest, DriverResponse } from '../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/drivers`;

  getAll(search?: string, availabilityStatus?: AvailabilityStatus | ''): Observable<DriverResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (availabilityStatus) {
      params = params.set('availabilityStatus', availabilityStatus);
    }
    return this.http.get<DriverResponse[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<DriverResponse> {
    return this.http.get<DriverResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: DriverRequest): Observable<DriverResponse> {
    return this.http.post<DriverResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: DriverRequest): Observable<DriverResponse> {
    return this.http.put<DriverResponse>(`${this.baseUrl}/${id}`, payload);
  }

  updateAvailability(id: number, availabilityStatus: AvailabilityStatus): Observable<DriverResponse> {
    return this.http.patch<DriverResponse>(`${this.baseUrl}/${id}/availability`, { availabilityStatus });
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
}

