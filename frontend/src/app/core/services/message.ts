import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number;
  subject: string;
  message: string;
  name: string;
  email: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read?: boolean;
  read_at?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  sendMessage(data: Message): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getMessages(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
