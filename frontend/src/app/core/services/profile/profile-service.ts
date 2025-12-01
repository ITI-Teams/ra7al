import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';




export interface StudentProfile{
    name?:string;
    email?:string;
    age?:string;
    gender?:string;
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
getProfile(): Observable<{ profile: StudentProfile }> {
return this.http.get<{ profile: StudentProfile }>(`${this.base}/profile`);
}
// POST /profile (create/update)
saveProfile(payload: Partial<StudentProfile>): Observable<any> {
return this.http.post<any>(`${this.base}/profile`, payload);
}

}
