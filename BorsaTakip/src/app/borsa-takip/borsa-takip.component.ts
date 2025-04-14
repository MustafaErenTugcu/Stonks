import { Component, OnInit } from '@angular/core';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-borsa-takip',
  templateUrl: './borsa-takip.component.html',
  styleUrls: ['./borsa-takip.component.css']
})
export class BorsaTakipComponent implements OnInit {
  allCards: any[] = [];
  displayedCards: any[] = [];
  pageSize: number = 8;
  first: number = 0;

  constructor(private homepageService: HomepageService) {}

  ngOnInit(): void {
    this.getHomepageData();
  }
  onLogoError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/logos/default.png';
  }
  

  getHomepageData(): void {
    this.homepageService.getHomepageRecommendations().subscribe({
      next: (data) => {
        // Tarihe göre azalan şekilde sırala
        this.allCards = data.sort((a: any, b: any) => new Date(b.advice_date).getTime() - new Date(a.advice_date).getTime());
        this.displayedCards = this.allCards.slice(0, this.pageSize);
      },
      error: (err) => {
        console.error('Anasayfa verileri alınamadı:', err);
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    const start = event.first;
    const end = event.first + event.rows;
    this.displayedCards = this.allCards.slice(start, end);
  }
}
