import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private loggedIn = new BehaviorSubject<boolean>(false);
  private username = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('username');
    if (user) {
      this.loggedIn.next(true);
      this.username.next(user);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout() {
    localStorage.removeItem('username');
    this.loggedIn.next(false);
    this.username.next(null);
  }

  setUser(username: string) {
    localStorage.setItem('username', username);
    this.loggedIn.next(true);
    this.username.next(username);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUsername(): Observable<string | null> {
    return this.username.asObservable();
  }
}
