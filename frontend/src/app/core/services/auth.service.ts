import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBase = 'http://localhost:8000/api';
  private backendBase = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiBase}/register`, formData, { withCredentials: true });
  }

  login(payload: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiBase}/login`, payload, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiBase}/logout`, {}, { withCredentials: true });
  }

  storeToken(token: string) {
    localStorage.setItem('api_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('api_token');
  }

  clearToken() {
    localStorage.removeItem('api_token');
  }

  // Store/get user helper methods
  storeUser(user: any) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      // ignore
    }
  }

  getUser(): any | null {
    const v = localStorage.getItem('user');
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch (e) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getBackendBase(): string {
    return this.backendBase;
  }
}
