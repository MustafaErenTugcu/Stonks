import { Component } from '@angular/core';
import {OneCikanlar} from "../interfaces/one-cikanlar";

@Component({
  selector: 'app-highlights',
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.css']
})
export class HighlightsComponent {
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
  senetler: OneCikanlar[] = [
    {
      senetKodu: 'ASELS',
      senetAdi: 'Aselsan',
      hedefFiyatVerenKurumSayisi: 10,
      sonKapanis: 35.5,
      ortHedefFiyat: 40.2,
      ortGetiriPotansiyeli: '%13.24',
      enYuksekHedefFiyat: 45.0,
      enYuksekFiyatinGetiriPotansiyeli: '%26.76'
    },
    {
      senetKodu: 'THYAO',
      senetAdi: 'Türk Hava Yolları',
      hedefFiyatVerenKurumSayisi: 8,
      sonKapanis: 65.0,
      ortHedefFiyat: 72.3,
      ortGetiriPotansiyeli: '%11.23',
      enYuksekHedefFiyat: 80.0,
      enYuksekFiyatinGetiriPotansiyeli: '%23.08'
    }
  ];


}
