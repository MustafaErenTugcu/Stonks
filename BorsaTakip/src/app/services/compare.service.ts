import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  private apiUrl = 'http://localhost:8000/compare';

  constructor(private http: HttpClient) {}

  compare(stock1: string, stock2: string): Observable<any[]> {
    const params = new HttpParams()
      .set('stock1', stock1)
      .set('stock2', stock2);

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}
