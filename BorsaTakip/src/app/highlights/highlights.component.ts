import { Component, OnInit } from '@angular/core';
import { FeaturedService } from '../services/highlights.service';

@Component({
  selector: 'app-highlights',
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.css']
})
export class HighlightsComponent implements OnInit {
  featuredData: any[] = [];
  displayedData: any[] = [];
  pageSize: number = 5;
  first: number = 0;

  constructor(private featuredService: FeaturedService) {}

  ngOnInit(): void {
    this.getFeaturedData();
  }

  getFeaturedData(): void {
    this.featuredService.getFeatured().subscribe({
      next: (data) => {
        this.featuredData = data;
        this.displayedData = this.featuredData.slice(0, this.pageSize);
      },
      error: (err) => {
        console.error('Öne çıkan hisseler alınamadı:', err);
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    const start = event.first;
    const end = event.first + event.rows;
    this.displayedData = this.featuredData.slice(start, end);
  }
}