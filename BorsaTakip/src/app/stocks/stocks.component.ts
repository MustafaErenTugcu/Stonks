import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  radarData: any[] = [];
  sectors: string[] = ['Technology', 'E-Commerce', 'Automotive', 'Semiconductors'];
  adviceTypes: string[] = ['Endeks Üstü Get.', 'Tut', 'Sat', 'Al'];
  institutions: string[] = ['Apple', 'Amazon', 'Tesla', 'Google', 'Nvidia', 'Intel'];
  selectedSector: string = '';
  selectedAdvice: string = '';
  selectedInstitution: string = '';
  selectedStockCode: string = '';
  startDate: string = '';
  endDate: string = '';
  stockCodes: string[] = ['AAPL', 'AMZN', 'TSLA', 'GOOGL', 'NVDA', 'INTC'];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.getRadarData(); // Sayfa açıldığında radar verilerini yükle
  }

  getRadarData(): void {
    this.stockService.getRadarData(
      this.selectedSector,
      this.selectedAdvice,
      this.selectedInstitution,
      this.startDate,
      this.endDate,
      this.selectedStockCode
    ).subscribe({
      next: (data) => {
        this.radarData = data;
      },
      error: (err) => {
        console.error('Radar verileri alınamadı:', err);
      }
    });
  }

  clearFilters(): void {
    this.selectedSector = '';
    this.selectedAdvice = '';
    this.selectedInstitution = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedStockCode = '';
    this.getRadarData(); // Filtreleri temizledikten sonra radar verilerini yeniden yükle
  }
}
