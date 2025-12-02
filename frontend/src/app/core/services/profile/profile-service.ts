import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';




export interface StudentProfileData{
    name?:string;
    email?:string;
    age?:string;
    gender?:string;
    avatar?:string;
    habits?: string;
    preferences?: string;
    roommate_style?: string;
    cleanliness_level?: string;
    smoking?: any;
    pets?: string;
}
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base=environment.apiUrl;
  constructor(private http:HttpClient){}

  //Get /profile
getProfile(): Observable<{ profile: StudentProfileData }> {
  const token=localStorage.getItem('api_token');
  const headers = { Authorization: `Bearer ${token}` };
return this.http.get<{ profile: StudentProfileData }>(`${this.base}/profile`,{ headers });
}
// POST /profile (create/update)
saveProfile(payload: Partial<StudentProfileData>): Observable<any> {
  const token = localStorage.getItem('api_token');
  const headers = { Authorization: `Bearer ${token}` };

  return this.http.post<any>(`${this.base}/profile`, payload, { headers });
}


}
