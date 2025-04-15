import { Component, OnInit } from '@angular/core';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-borsa-takip',
  templateUrl: './borsa-takip.component.html',
  styleUrls: ['./borsa-takip.component.css']
})
export class BorsaTakipComponent implements OnInit {
  allCards: any[] = [];
  filteredCards: any[] = [];
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
        this.allCards = data.sort((a: any, b: any) => new Date(b.advice_date).getTime() - new Date(a.advice_date).getTime());
        this.filteredCards = [...this.allCards];
        this.updateDisplayedCards();
      },
      error: (err) => {
        console.error('Anasayfa verileri alınamadı:', err);
      }
    });
  }

  updateDisplayedCards(): void {
    const start = this.first;
    const end = this.first + this.pageSize;
    this.displayedCards = this.filteredCards.slice(start, end);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.updateDisplayedCards();
  }

  filterToday(): void {
    const today = new Date().toISOString().split('T')[0];
    this.filteredCards = this.allCards.filter(card => card.advice_date.startsWith(today));
    this.first = 0;
    this.updateDisplayedCards();
  }

  filterThisWeek(): void {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    this.filteredCards = this.allCards.filter(card => {
      const date = new Date(card.advice_date);
      return date >= monday && date <= sunday;
    });

    this.first = 0;
    this.updateDisplayedCards();
  }

  filterThisMonth(): void {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    this.filteredCards = this.allCards.filter(card => {
      const date = new Date(card.advice_date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    this.first = 0;
    this.updateDisplayedCards();
  }

  resetFilters(): void {
    this.filteredCards = [...this.allCards];
    this.first = 0;
    this.updateDisplayedCards();
  }
}
