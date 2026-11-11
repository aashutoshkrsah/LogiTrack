import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse, normalizePage } from '../models/page.model';
import { CustomerRequest, CustomerResponse, CustomerType } from '../models/customer.model';
import { MessageResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  getAll(search?: string, customerType?: CustomerType | ''): Observable<CustomerResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (customerType) {
      params = params.set('customerType', customerType);
    }
    return this.http.get<CustomerResponse[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: CustomerRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }

  getPaged(page: number, size: number, search?: string, customerType?: CustomerType | ''): Observable<PageResponse<CustomerResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search && search.trim()) params = params.set('search', search.trim());
    if (customerType) params = params.set('customerType', customerType);
    return this.http.get<CustomerResponse[] | PageResponse<CustomerResponse>>(this.baseUrl, { params })
      .pipe(map((res) => normalizePage(res)));
  }

  exportCsv(search?: string, customerType?: CustomerType | ''): Observable<Blob> {
    let params = new HttpParams();
    if (search && search.trim()) params = params.set('search', search.trim());
    if (customerType) params = params.set('customerType', customerType);
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

}
