import { Component } from '@angular/core';

@Component({
  selector: 'app-borsa-takip',
  templateUrl: './borsa-takip.component.html',
  styleUrls: ['./borsa-takip.component.css']
})
export class BorsaTakipComponent{
  title = 'BorsaTakip';
  stockPrediction: number = 0;
  selectedDate: Date = new Date();
  allCards = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    title: `Kart ${i + 1}`,
    description: `Bu, Kart ${i + 1} için açıklamadır.`
  }));

  currentPage = 0;
  pageSize = 12;
  onPredict(): void {
    // Burada borsa tahmini yapacak API entegrasyonu yapılabilir
    this.stockPrediction = Math.random() * 100 + 200; // Örnek rastgele tahmin
  }

  lineData = {

  };

  stocks = [
    { name: 'BIST 100', price: '1,350.12', change: 0.5 },
    { name: 'BIST 30', price: '1,520.45', change: -0.3 },
    { name: 'BIST 50', price: '2,100.65', change: 0.7 },
  ];
  chartOptions: any;
  tavsiye: string;
  activeFilter: string;

  ngAfterViewInit() {
    setTimeout(() => {
      // Grafik verisini burada yükleyin
      this.lineData = this.getData();
      this.chartOptions = this.getChartOptions();
    });
  }

  getData() {
    // Verinizi burada döndürün
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'USD/TRY',
          data: [17.5, 18.1, 18.8, 19.2, 18.7, 19.0],
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.2)',
          fill: true,
        }
      ]
    };
  }

  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false
    };
}


  get paginatedCards() {
    const start = this.currentPage * this.pageSize;
    return this.allCards.slice(start, start + this.pageSize);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
  }
}
