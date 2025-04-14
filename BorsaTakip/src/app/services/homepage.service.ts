import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private apiUrl = 'http://localhost:8000/recommendations';

  constructor(private http: HttpClient) {}

  getHomepageRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
