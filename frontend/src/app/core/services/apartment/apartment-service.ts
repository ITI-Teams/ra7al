import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { ApartmentInterface } from '../../models/apartment-interface';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {

  private apiUrl = 'http://localhost:8000/api/properties';

  constructor(private http: HttpClient) {}

  // Get Bearer token from localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('api_token');
    let headers = new HttpHeaders({
      'Accept': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // -----------------------------------
  // CSRF COOKIE — لازم قبل أي POST/PUT
  // -----------------------------------
  getCsrfCookie(): Observable<any> {
    return this.http.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
  }

  // CREATE Apartment (FormData)
  createApartment(formData: FormData): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => this.http.post(this.apiUrl, formData, {
        withCredentials: true,
        headers: this.getAuthHeaders()
      }))
    );
  }

  // UPDATE Apartment (FormData) — Laravel PUT مع _method
  updateApartment(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.getCsrfCookie().pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/${id}`, formData, {
        withCredentials: true,
        headers: this.getAuthHeaders()
      }))
    );
  }

  // GET ALL Apartments
  getApartments(): Observable<ApartmentInterface[]> {
    return this.http.get<ApartmentInterface[]>(this.apiUrl, {
      withCredentials: true,
      headers: this.getAuthHeaders()
    });
  }

  // GET ONE Apartment
  getApartment(id: number): Observable<ApartmentInterface> {
    return this.http.get<ApartmentInterface>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
      headers: this.getAuthHeaders()
    });
  }
}
