import { Component } from '@angular/core';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent {
  selectedStock1: string = '';
  selectedStock2: string = '';
  isVisible: boolean = false;

  stockOptions: string[] = ['AAPL', 'AMZN', 'TSLA', 'GOOGL', 'NVDA', 'INTC'];

  stock1Data: any = null;
  stock2Data: any = null;

  constructor(private compareService: CompareService) {}

  karsilastirClick(): void {
    if (this.selectedStock1 && this.selectedStock2) {
      this.compareService.compare(this.selectedStock1, this.selectedStock2).subscribe({
        next: (data) => {
          const [stock1, stock2] = data;
          this.stock1Data = stock1;
          this.stock2Data = stock2;
          this.isVisible = true;
        },
        error: (err) => {
          console.error('Karşılaştırma hatası:', err);
        }
      });
    }
  }
}
