import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PropertySearch {
  private apiUrl = `${environment.apiUrl}/properties/search`;

  constructor(private http: HttpClient) {}

  searchProperties(
    keyword: string,
    page: number = 1,
    perPage: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString());

    return this.http.get(this.apiUrl, { params });
  }
}
