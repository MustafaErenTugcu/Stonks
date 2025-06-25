import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getRadarData(
    sector?: string,
    advice_type?: string,
    institution?: string,
    start_date?: string,
    end_date?: string,
    stock_code?: string
  ): Observable<any> {
    let params = new HttpParams();

    if (sector) params = params.set('sector', sector);
    if (advice_type) params = params.set('advice_type', advice_type);
    if (institution) params = params.set('institution', institution);
    if (start_date && end_date) {
      params = params.set('start_date', start_date);
      params = params.set('end_date', end_date);
    }
    if (stock_code) params = params.set('stock_code', stock_code);

    return this.http.get(`${this.baseUrl}/radar`, { params });
  }

 getChartData(symbol: string, range: string) {
  return this.http.get<any[]>(`http://localhost:8000/stocks/data?symbol=${symbol}&range=${range}`);
}

  getCompanyInfo(symbol: string) {
  return this.http.get<any>(`http://localhost:8000/stocks/info?symbol=${symbol}`);
}
}
