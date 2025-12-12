// src/app/core/services/rental-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RentalRequest {
  id: number;
  user: { id: number; name: string };
  property: { id: number; title: string };
  desired_start_date: string;
  duration_months: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  owner_response?: string;
  responded_at?: string;
  created_at?: string;
}

export interface RentalRequestResponse {
  data: RentalRequest[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class RentalRequestService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get all rental requests with search, status filter, and pagination
  getRequests(
    search?: string,
    status?: string,
    page?: number
  ): Observable<RentalRequestResponse> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (page) params = params.set('page', page.toString());

    return this.http.get<RentalRequestResponse>(
      `${this.apiUrl}/rental-requests`,
      {
        params,
      }
    );
  }

  // Get single rental request details
  getRequest(id: number): Observable<RentalRequest> {
    return this.http.get<RentalRequest>(`${this.apiUrl}/rental-requests/${id}`);
  }

  // Approve rental request
  approveRequest(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rental-requests/${id}/approve`, {});
  }

  // Reject rental request
  rejectRequest(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rental-requests/${id}/reject`, {});
  }

  requestRental(
    propertyId: number,
    data: {
      desired_start_date: string;
      duration_months: number;
      message?: string;
    }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/rental-requests`, {
      property_id: propertyId,
      ...data,
    });
  }

  // Get user's own rental requests
  getMyRequests(
    status?: string,
    page?: number,
    perPage: number = 10
  ): Observable<RentalRequestResponse> {
    let params = new HttpParams()
      .set('page', page?.toString() || '1')
      .set('per_page', perPage.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<RentalRequestResponse>(
      `${this.apiUrl}/my-rental-requests`,
      { params }
    );
  }
}
