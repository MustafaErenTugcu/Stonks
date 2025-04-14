import { Component, OnInit } from '@angular/core';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html'
})
export class CompareComponent implements OnInit {
  stockOptions: string[] = ['AAPL', 'AMZN', 'GOOGL', 'TSLA', 'NVDA', 'INTC'];
  selectedStock1: string = '';
  selectedStock2: string = '';
  stock1Data: any;
  stock2Data: any;
  isVisible: boolean = false;

  constructor(private compareService: CompareService) {}

  ngOnInit(): void {}

  karsilastirClick(): void {
    if (this.selectedStock1 === this.selectedStock2) {
      alert('İki hisse aynı olamaz. Lütfen farklı hisseler seçin.');
      return;
    }
  
    if (this.selectedStock1 && this.selectedStock2) {
      this.compareService.compare(this.selectedStock1, this.selectedStock2).subscribe(data => {
        const first = data.find((d: any) => d.stock_code === this.selectedStock1);
        const second = data.find((d: any) => d.stock_code === this.selectedStock2);
        this.stock1Data = first;
        this.stock2Data = second;
        this.isVisible = true;
      });
    }
  }
}