import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../models/dashboard.model';
import { HubRequest, HubResponse } from '../models/hub.model';

@Injectable({ providedIn: 'root' })
export class HubService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/hubs`;

  getAll(search?: string, city?: string): Observable<HubResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (city && city.trim()) {
      params = params.set('city', city.trim());
    }
    return this.http.get<HubResponse[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<HubResponse> {
    return this.http.get<HubResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: HubRequest): Observable<HubResponse> {
    return this.http.post<HubResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: HubRequest): Observable<HubResponse> {
    return this.http.put<HubResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
}

