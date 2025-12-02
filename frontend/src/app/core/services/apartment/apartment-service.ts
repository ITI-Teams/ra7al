import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApartmentInterface } from '../../models/apartment-interface';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private apiUrl = 'http://localhost:8000/api/apartments'; // ضع رابط الـ API هنا

  constructor(private http: HttpClient) { }

  createApartment(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateApartment(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getApartments(): Observable<ApartmentInterface[]> {
    return this.http.get<ApartmentInterface[]>(this.apiUrl);
  }

  getApartment(id: number): Observable<ApartmentInterface> {
    return this.http.get<ApartmentInterface>(`${this.apiUrl}/${id}`);
  }
}
