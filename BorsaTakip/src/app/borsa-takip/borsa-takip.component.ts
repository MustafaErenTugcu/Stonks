import { Component, OnInit } from '@angular/core';
import { HomepageService } from '../services/homepage.service';
import { StockService } from '../services/stock.service';

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
  selectedSymbol: string = '';
  showDialog: boolean = false;
  dialogChartData: any;
  dialogChartOptions: any;
  selectedCompanyInfo: any;
  selectedRange: string = '1mo';

  constructor(
    private homepageService: HomepageService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.getHomepageData();
  }

  onLogoError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/logos/default.png';
  }

  getHomepageData(): void {
    this.homepageService.getHomepageRecommendations().subscribe({
      next: (data) => {
        this.allCards = data.sort(
          (a: any, b: any) => new Date(b.advice_date).getTime() - new Date(a.advice_date).getTime()
        );
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

  openDetail(symbol: string) {
    this.selectedSymbol = symbol;
    this.selectedRange = '7d';
    this.showDialog = true;
    this.loadStockData(symbol, this.selectedRange);
  }

  changeRange(range: string) {
    this.selectedRange = range;
    this.loadStockData(this.selectedSymbol, range);
  }

  loadStockData(symbol: string, range: string) {
    this.stockService.getChartData(symbol, range).subscribe(data => {
      console.log("Gelen grafik verisi:", data);

      const labels = data.map(d => d.Date);
      const prices = data.map(d => d.Close);

      if (!labels.length || !prices.length) {
        console.warn('Grafik verisi bulunamadı.');
        this.dialogChartData = null;
        return;
      }

      this.dialogChartData = {
        labels: labels,
        datasets: [
          {
            label: `${symbol} Fiyatı - ${range.toUpperCase()}`,
            data: prices,
            fill: true,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66,165,245,0.1)',
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ],
        rawData: data
      };

      let maxTicks = 7;
      if (range === '1mo') maxTicks = 15;
      else if (range === '6mo') maxTicks = 12;
      else if (range === '1y') maxTicks = 12;

      this.dialogChartOptions = {
        responsive: true,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { labels: { color: '#fff' } },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context: any) {
                const index = context.dataIndex;
                const point = context.chart.data.rawData[index];
                return [
                  `Fiyat: ${point.Close}`,
                  `Açılış: ${point.Open}`,
                  `Yüksek: ${point.High}`,
                  `Düşük: ${point.Low}`,
                  `Hacim: ${point.Volume}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              color: '#fff',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: maxTicks
            },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      };
    });

    this.stockService.getCompanyInfo(symbol).subscribe(info => {
      this.selectedCompanyInfo = info;
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedSymbol = '';
    this.dialogChartData = null;
    this.dialogChartOptions = null;
    this.selectedCompanyInfo = null;
  }
}