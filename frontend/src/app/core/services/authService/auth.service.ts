import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBase = 'http://localhost:8000/api';
  private backendBase = 'http://localhost:8000';

  // 🔥 BehaviorSubject لمتابعة المستخدم
  private userSubject = new BehaviorSubject<any>(this.getUser());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiBase}/register`, formData, {
      withCredentials: true,
    });
  }

  login(payload: {
    email: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/login`, payload, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    this.clearToken();
    this.clearUser();
    return this.http.post(
      `${this.apiBase}/logout`,
      {},
      { withCredentials: true }
    );
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

  storeUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  refreshUser(): Observable<any> {
    return this.http.get(`${this.apiBase}/me`, { withCredentials: true });
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  clearUser() {
    localStorage.removeItem('user');
    this.userSubject.next(null); // 🔥 إشعار الـ navbar
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  updateUserAvatar(avatarPath: string | null) {
    const user = this.getUser();
    if (user) {
      user.avatar = avatarPath;
      this.storeUser(user);
    }
  }

  getBackendBase(): string {
    return this.backendBase;
  }
}
