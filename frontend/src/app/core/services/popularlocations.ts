import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';

export interface Property {
  id: number;
  title: string;
  city: string;
  area: string;
  price: number;
  beds: number;
  baths: number;
  rooms: number;
  image: string;
  rating?: number;
}
@Injectable({
  providedIn: 'root',
})
export class Popularlocations {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get latest properties grouped by city
  getLatestPropertiesByCity(): Observable<{
    cities: { name: string; properties: Property[] }[];
  }> {
    return this.http.get<{
      cities: { name: string; properties: Property[] }[];
    }>(`${this.apiUrl}/home/latest-properties`);
  }
}
