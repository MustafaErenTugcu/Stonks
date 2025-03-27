import {Component, OnInit} from '@angular/core';
import {StockService} from "../services/stock.service";

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css']
})
export class MarketComponent implements OnInit {
  stocks: any[] = [];
  marketData = [
    { name: 'SP 500', value: 5774.1, change: -0.14 },
    { name: 'Ons Altın', value: 3027.840, change: 0.26 },
    { name: 'Gram Altın', value: 3692.20, change: 0.21 },
  ];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.updateMarketTable(this.marketData);

  }
   addNewMarketData(newItem) {
    this.marketData.push(newItem);
    this.updateMarketTable(this.marketData);
  }
     updateMarketTable(data) {
    const tableBody = document.getElementById('marketTableBody');

    // Önceki içeriği temizle
    tableBody.innerHTML = '';

    // Her bir veri için satır oluştur
    data.forEach(item => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      // Değişim rengini belirle
      const changeColor = item.change >= 0 ? 'text-green-600' : 'text-red-600';
      const changeSymbol = item.change >= 0 ? '▲' : '▼';

      row.innerHTML = `
                    <td class="p-3 text-sm text-center font-medium text-gray-800">${item.name}</td>
                    <td class="p-3 text-sm text-center text-gray-800">${item.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="p-3 text-sm text-center ${changeColor}">
                        ${changeSymbol} ${Math.abs(item.change).toFixed(2)}%
                    </td>
                `;

      tableBody.appendChild(row);
    });
  }


}
