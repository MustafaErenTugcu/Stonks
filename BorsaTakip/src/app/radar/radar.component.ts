import { Component, OnInit } from '@angular/core';
import { RadarService } from '../services/radar.service';

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})
export class RadarComponent implements OnInit {
  stockData: any[] = [];       // Tabloda gösterilen veriler (sayfalama uygulanmış)
  allCards: any[] = [];        // API'den gelen tüm radar verisi
  pageSize: number = 5;        // Sayfa başına gösterilecek veri sayısı
  totalRecords: number = 0;    // Toplam veri sayısı (sayfalama için)

  sectors: string[] = ['Technology', 'E-Commerce', 'Automotive', 'Semiconductors'];
  adviceTypes: string[] = ['Endeks Üstü Get.', 'Tut', 'Sat', 'Al'];
  institutions: string[] = ['Apple', 'Amazon', 'Tesla', 'Google', 'Nvidia', 'Intel'];
  stockCodes: string[] = ['AAPL', 'AMZN', 'TSLA', 'GOOGL', 'NVDA', 'INTC'];

  selectedSector: string = '';
  selectedAdvice: string = '';
  selectedInstitution: string = '';
  selectedStockCode: string = '';
  startDate: any = '';
  endDate: any = '';

  constructor(private radarService: RadarService) {}

  ngOnInit(): void {
    this.getRadarData();
  }

  getRadarData(): void {
    const formatDate = (d: any): string =>
      d instanceof Date ? d.toISOString().split('T')[0] : d;

    this.radarService.getRadarData(
      this.selectedSector,
      this.selectedAdvice,
      this.selectedInstitution,
      formatDate(this.startDate),
      formatDate(this.endDate),
      this.selectedStockCode
    ).subscribe({
      next: (data) => {
        this.allCards = data;
        this.totalRecords = data.length;
        this.stockData = this.allCards.slice(0, this.pageSize);
      },
      error: (err) => {
        console.error('Radar verileri alınamadı:', err);
      }
    });
  }

  onPageChange(event: any): void {
    const start = event.first;
    const end = event.first + event.rows;
    this.stockData = this.allCards.slice(start, end);
  }

  clearFilters(): void {
    this.selectedSector = '';
    this.selectedAdvice = '';
    this.selectedInstitution = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedStockCode = '';
    this.getRadarData();
  }
}
