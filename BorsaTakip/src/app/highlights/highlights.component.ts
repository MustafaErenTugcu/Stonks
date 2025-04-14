import { Component, OnInit } from '@angular/core';
import { FeaturedService } from '../services/highlights.service';

@Component({
  selector: 'app-highlights',
  templateUrl: './highlights.component.html',
})
export class HighlightsComponent implements OnInit {
  featuredData: any[] = [];
  displayedData: any[] = [];
  first = 0;
  pageSize = 5;

  constructor(private featuredService: FeaturedService) {}

  ngOnInit(): void {
    this.featuredService.getFeatured().subscribe({
      next: (data) => {
        this.featuredData = data;
        this.updateDisplayedData();
      },
      error: (err) => {
        console.error('Veri alınamadı:', err);
      },
    });
  }

  updateDisplayedData() {
    const startIndex = this.first;
    const endIndex = this.first + this.pageSize;
    this.displayedData = this.featuredData.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.updateDisplayedData();
  }
}
