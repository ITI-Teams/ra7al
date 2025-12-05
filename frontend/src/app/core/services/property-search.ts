import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';

export interface Property {
  id: number;
  title: string;
  price: number;
  city: string;
  area: string;
  beds: number;
  bathrooms_count: number;
  rating?: number;
  is_featured?: boolean;
  image?: string;
}
export interface PropertySearchResponse {
  data: Property[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PropertySearch {
  private apiUrl = `${environment.apiUrl}/properties/search`;

  constructor(private http: HttpClient) {}

  search(filters: any, page: number = 1): Observable<PropertySearchResponse> {
    let params = new HttpParams().set('page', page.toString());

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ''
      ) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PropertySearchResponse>(this.apiUrl, { params });
  }
}
