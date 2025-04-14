import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeaturedService {
  private apiUrl = 'http://localhost:8000/featured';

  constructor(private http: HttpClient) {}

  getFeatured(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
