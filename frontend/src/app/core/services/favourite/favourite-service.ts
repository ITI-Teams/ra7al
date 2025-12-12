import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
 private base=environment.apiUrl;
constructor(private http:HttpClient){}

  toggleFavourite(propertyId:number):Observable<any>{
return this.http.post(`${this.base}/property/${propertyId}/favourite`, {});
  }

  getMyFavourites(): Observable<any> {
  return this.http.get(`${this.base}/my-favourites`)
}






}
