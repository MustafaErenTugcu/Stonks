import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'https://api.stockdata.org/v1/data/quote';
  private apiKey = 'DvALHxuLhNjYT3t9wS5Ku5F7jhpjoj3d9kVkqLmR'; // Buraya API anahtarını koy

  constructor(private http: HttpClient) {}

  getStockData(symbol: string): Observable<any> {
    const url = `${this.apiUrl}?symbols=${symbol}&api_token=${this.apiKey}`;
    return this.http.get(url);
  }
}
