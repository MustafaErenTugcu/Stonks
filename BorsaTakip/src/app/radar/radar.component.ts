import { Component, OnInit } from '@angular/core';
import { RadarService } from '../services/radar.service';

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html'
})
export class RadarComponent implements OnInit {
  stockData: any[] = [];
  allCards: any[] = [];
  sectors: any[] = [];
  adviceTypes: any[] = [];
  institutions: any[] = [];
  stockCodes: any[] = [];

  selectedSector: string | null = null;
  selectedAdvice: string | null = null;
  selectedInstitution: string | null = null;
  selectedStockCode: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  first = 0;
  rows = 5;

  constructor(private radarService: RadarService) {}

  ngOnInit(): void {
    this.fetchInitialData();
    this.getRadarData();
  }

  fetchInitialData(): void {
    // Sabit değerler set edilebilir ya da istenirse backend'den çekilebilir
    this.sectors = [
      { label: 'Technology', value: 'Technology' },
      { label: 'E-Commerce', value: 'E-Commerce' },
      { label: 'Automotive', value: 'Automotive' },
      { label: 'Semiconductors', value: 'Semiconductors' }
    ];

    this.adviceTypes = [
      { label: 'Al', value: 'Al' },
      { label: 'Tut', value: 'Tut' },
      { label: 'Sat', value: 'Sat' },
      { label: 'Endeks Üstü Get.', value: 'Endeks Üstü Get.' }
    ];

    this.institutions = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Amazon', value: 'Amazon' },
      { label: 'Tesla', value: 'Tesla' },
      { label: 'Google', value: 'Google' },
      { label: 'Nvidia', value: 'Nvidia' },
      { label: 'Intel', value: 'Intel' }
    ];

    this.stockCodes = [
      { label: 'AAPL', value: 'AAPL' },
      { label: 'AMZN', value: 'AMZN' },
      { label: 'TSLA', value: 'TSLA' },
      { label: 'GOOGL', value: 'GOOGL' },
      { label: 'NVDA', value: 'NVDA' },
      { label: 'INTC', value: 'INTC' }
    ];
  }

  getRadarData(): void {
    const formattedStart = this.startDate ? new Date(this.startDate).toISOString().split('T')[0] : undefined;
    const formattedEnd = this.endDate ? new Date(this.endDate).toISOString().split('T')[0] : undefined;
  
    this.radarService.getRadarData(
      this.selectedSector || undefined,
      this.selectedAdvice || undefined,
      this.selectedInstitution || undefined,
      formattedStart,
      formattedEnd,
      this.selectedStockCode || undefined
    ).subscribe(data => {
      this.allCards = data;
      this.first = 0; // Sayfa başa alınır
      this.updateDisplayedData(); // Güncelleme fonksiyonu çağrılır
    });
  }
  
  updateDisplayedData(): void {
    this.stockData = this.allCards.slice(this.first, this.first + this.rows);
  }
  
  onPageChange(event: any): void {
    this.first = event.first;
    this.updateDisplayedData();
  }

  clearFilters(): void {
    this.selectedSector = null;
    this.selectedAdvice = null;
    this.selectedInstitution = null;
    this.selectedStockCode = null;
    this.startDate = null;
    this.endDate = null;
    this.getRadarData();
  }
}
