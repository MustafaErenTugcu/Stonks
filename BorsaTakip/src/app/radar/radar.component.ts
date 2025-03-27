import { Component } from '@angular/core';
import {StockData} from "../interfaces/stock-data";


@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})
export class RadarComponent {
  stockData: StockData[] = [
    {
      senetKodu: 'KARSN',
      tavsiyeTipi: 'AI',
      hedefFiyat: 15.30,
      getiriPotansiyeli: 45.02,
      oneriTarihi: '21.03.2025',
      kapanis: 10.55,
      oncekiHedef:45,
      oncekiOneriTarihi:"12.11.2001",
      kurumAdi: 'Alnus Yatırım'
    },
    {
      senetKodu: 'MGROS',
      tavsiyeTipi: 'Endeks Üstü Get.',
      hedefFiyat: 819.20,
      getiriPotansiyeli: 66.50,
      oneriTarihi: '20.03.2025',
      kapanis: 492.00,
      oncekiHedef:45,
      oncekiOneriTarihi:"12.11.2001",
      kurumAdi: 'Tera Yatırım'
    },
    {
      senetKodu: 'MAVI',
      tavsiyeTipi: 'Endeks Üstü Get.',
      hedefFiyat: 118.00,
      getiriPotansiyeli: 74.30,
      oneriTarihi: '20.03.2025',
      kapanis: 67.70,
      oncekiHedef:45,
      oncekiOneriTarihi:"12.11.2001",
      kurumAdi: 'Oyak Yatırım'
    },
    {
      senetKodu: 'MAVI',
      tavsiyeTipi: 'AI',
      hedefFiyat: 124.80,
      getiriPotansiyeli: 84.34,
      oneriTarihi: '20.03.2025',
      kapanis: 67.70,
      oncekiHedef:45,
      oncekiOneriTarihi:"12.11.2001",
      kurumAdi: 'Ahlatcı Yatırım'
    },
    {
      senetKodu: 'MAVI',
      tavsiyeTipi: 'AI',
      hedefFiyat: 120.00,
      getiriPotansiyeli: 77.25,
      oneriTarihi: '20.03.2025',
      kapanis: 67.70,
      oncekiHedef:45,
      oncekiOneriTarihi:"12.11.2001",
      kurumAdi: 'Alnus Yatırım'
    }
  ];
  allCards = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    title: `Kart ${i + 1}`,
    description: `Bu, Kart ${i + 1} için açıklamadır.`
  }));

  pageSize: 12;
  currentPage = 0;
  onPageChange(event: any) {
    // Pagination logic
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;

  }
}
