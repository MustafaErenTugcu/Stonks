import { Component, OnInit } from '@angular/core';
import { RadarService } from '../services/radar.service';

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html'
})
export class RadarComponent implements OnInit {
  stockData: any[] = [];
  allCards: any[] = [];
  sectors: any[] = [];
  adviceTypes: any[] = [];
  institutions: any[] = [];
  stockCodes: any[] = [];

  selectedSector: string | null = null;
  selectedAdvice: string | null = null;
  selectedInstitution: string | null = null;
  selectedStockCode: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  first = 0;
  rows = 5;

  constructor(private radarService: RadarService) {}

  ngOnInit(): void {
    this.fetchInitialData();
    this.getRadarData();
  }

  fetchInitialData(): void {
    // Sabit değerler set edilebilir ya da istenirse backend'den çekilebilir
    this.sectors = [
  { label: 'Technology', value: 'Technology' },
  { label: 'E-Commerce', value: 'E-Commerce' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Semiconductors', value: 'Semiconductors' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Software', value: 'Software' },
  { label: 'Communication Services', value: 'Communication Services' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Food Delivery', value: 'Food Delivery' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Cryptocurrency', value: 'Cryptocurrency' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  { label: 'Biotechnology', value: 'Biotechnology' },
  { label: 'Energy', value: 'Energy' },
  { label: 'Chemicals', value: 'Chemicals' },
  { label: 'Metals', value: 'Metals' }
];
    this.adviceTypes = [
      { label: 'Al', value: 'Al' },
      { label: 'Tut', value: 'Tut' },
      { label: 'Sat', value: 'Sat' },
      { label: 'Endeks Üstü Get.', value: 'Endeks Üstü Get.' }
    ];

    this.institutions = [
            { label: 'Apple', value: 'Apple' }, { label: 'Amazon', value: 'Amazon' }, { label: 'Tesla', value: 'Tesla' }, { label: 'Google', value: 'Google' }, { label: 'Nvidia', value: 'Nvidia' }, { label: 'Intel', value: 'Intel' }, { label: 'Meta', value: 'Meta' }, { label: 'Microsoft', value: 'Microsoft' }, { label: 'Netflix', value: 'Netflix' }, { label: 'Samsung', value: 'Samsung' }, { label: 'Sony', value: 'Sony' }, { label: 'Alibaba', value: 'Alibaba' }, { label: 'Baidu', value: 'Baidu' }, { label: 'Tencent', value: 'Tencent' }, { label: 'Adobe', value: 'Adobe' }, { label: 'Salesforce', value: 'Salesforce' }, { label: 'Oracle', value: 'Oracle' }, { label: 'IBM', value: 'IBM' }, { label: 'Zoom', value: 'Zoom' }, { label: 'Spotify', value: 'Spotify' }, { label: 'Twitter', value: 'Twitter' }, { label: 'Snap', value: 'Snap' }, { label: 'Pinterest', value: 'Pinterest' }, { label: 'LinkedIn', value: 'LinkedIn' }, { label: 'Reddit', value: 'Reddit' }, { label: 'TikTok', value: 'TikTok' }, { label: 'ByteDance', value: 'ByteDance' }, { label: 'Airbnb', value: 'Airbnb' }, { label: 'Uber', value: 'Uber' }, { label: 'Lyft', value: 'Lyft' }, { label: 'DoorDash', value: 'DoorDash' }, { label: 'Robinhood', value: 'Robinhood' }, { label: 'Coinbase', value: 'Coinbase' }, { label: 'Square', value: 'Square' }, { label: 'PayPal', value: 'PayPal' }, { label: 'Stripe', value: 'Stripe' }, { label: 'Shopify', value: 'Shopify' }, { label: 'eBay', value: 'eBay' }, { label: 'Walmart', value: 'Walmart' }, { label: 'Target', value: 'Target' }, { label: 'Costco', value: 'Costco' }, { label: 'Home Depot', value: 'Home Depot' }, { label: 'Lowe\'s', value: 'Lowe\'s' }, { label: 'Best Buy', value: 'Best Buy' }, { label: 'CVS Health', value: 'CVS Health' }, { label: 'Walgreens Boots Alliance', value: 'Walgreens Boots Alliance' }, { label: 'Pfizer', value: 'Pfizer' }, { label: 'Johnson & Johnson', value: 'Johnson & Johnson' }, { label: 'Merck', value: 'Merck' }, { label: 'Moderna', value: 'Moderna' }, { label: 'AstraZeneca', value: 'AstraZeneca' }, { label: 'Roche', value: 'Roche' }, { label: 'Novartis', value: 'Novartis' }, { label: 'GlaxoSmithKline', value: 'GlaxoSmithKline' }, { label: 'Sanofi', value: 'Sanofi' }, { label: 'Bristol-Myers Squibb', value: 'Bristol-Myers Squibb' }, { label: 'AbbVie', value: 'AbbVie' }, { label: 'ExxonMobil', value: 'ExxonMobil' }, { label: 'Chevron', value: 'Chevron' }, { label: 'BP', value: 'BP' }, { label: 'Shell', value: 'Shell' }, { label: 'TotalEnergies', value: 'TotalEnergies' }, { label: 'ConocoPhillips', value: 'ConocoPhillips' }, { label: 'Eni', value: 'Eni' }, { label: 'Equinor', value: 'Equinor' }, { label: 'Repsol', value: 'Repsol' }, { label: 'Petrobras', value: 'Petrobras' }, { label: 'Gazprom', value: 'Gazprom' }, { label: 'Rosneft', value: 'Rosneft' }, { label: 'Volkswagen', value: 'Volkswagen' }, { label: 'BMW', value: 'BMW' }, { label: 'Daimler', value: 'Daimler' }, { label: 'Ford', value: 'Ford' }, { label: 'General Motors', value: 'General Motors' }, { label: 'Honda', value: 'Honda' }, { label: 'Toyota', value: 'Toyota' }, { label: 'Hyundai', value: 'Hyundai' }, { label: 'Kia', value: 'Kia' }, { label: 'Nissan', value: 'Nissan' }, { label: 'Mazda', value: 'Mazda' }, { label: 'Subaru', value: 'Subaru' }, { label: 'LG Electronics', value: 'LG Electronics' }, { label: 'Panasonic', value: 'Panasonic' }, { label: 'Toshiba', value: 'Toshiba' }, { label: 'Hitachi', value: 'Hitachi' }, { label: 'Fujitsu', value: 'Fujitsu' }, { label: 'NEC', value: 'NEC' }, { label: 'Sharp', value: 'Sharp' }, { label: 'Canon', value: 'Canon' }, { label: 'Nikon', value: 'Nikon' }, { label: 'Olympus', value: 'Olympus' }, { label: 'Ricoh', value: 'Ricoh' }, { label: 'Siemens', value: 'Siemens' }, { label: 'Bosch', value: 'Bosch' }, { label: 'Philips', value: 'Philips' }, { label: 'Schneider Electric', value: 'Schneider Electric' }, { label: 'ABB', value: 'ABB' }, { label: 'Honeywell', value: 'Honeywell' }, { label: 'General Electric', value: 'General Electric' }, { label: 'Emerson Electric', value: 'Emerson Electric' }, { label: 'Rockwell Automation', value: 'Rockwell Automation' }, { label: '3M', value: '3M' }, { label: 'DuPont', value: 'DuPont' }, { label: 'BASF', value: 'BASF' }, { label: 'Dow Chemical', value: 'Dow Chemical' }, { label: 'ExxonMobil Chemical', value: 'ExxonMobil Chemical' }, { label: 'LyondellBasell', value: 'LyondellBasell' }, { label: 'SABIC', value: 'SABIC' }, { label: 'Formosa Plastics', value: 'Formosa Plastics' }, { label: 'LG Chem', value: 'LG Chem' }, { label: 'SK Innovation', value: 'SK Innovation' }, { label: 'Mitsubishi Chemical', value: 'Mitsubishi Chemical' }, { label: 'Asahi Kasei', value: 'Asahi Kasei' }, { label: 'Sumitomo Chemical', value: 'Sumitomo Chemical' }, { label: 'Toray Industries', value: 'Toray Industries' }, { label: 'Nippon Steel', value: 'Nippon Steel' }, { label: 'JFE Holdings', value: 'JFE Holdings' }, { label: 'ArcelorMittal', value: 'ArcelorMittal' }, { label: 'Nucor', value: 'Nucor' }, { label: 'United States Steel', value: 'United States Steel' }, { label: 'Steel Dynamics', value: 'Steel Dynamics' }, { label: 'Cleveland-Cliffs', value: 'Cleveland-Cliffs' }, { label: 'AK Steel', value: 'AK Steel' }, { label: 'Tata Steel', value: 'Tata Steel' }, { label: 'Thyssenkrupp', value: 'Thyssenkrupp' }, { label: 'Rio Tinto', value: 'Rio Tinto' }, { label: 'BHP', value: 'BHP' }, { label: 'Vale', value: 'Vale' }, { label: 'Anglo American', value: 'Anglo American' }, { label: 'Glencore', value: 'Glencore' }, { label: 'Freeport-McMoRan', value: 'Freeport-McMoRan' }, { label: 'Newmont Corporation', value: 'Newmont Corporation' }, { label: 'Barrick Gold', value: 'Barrick Gold' }, { label: 'Southern Copper', value: 'Southern Copper' }, { label: 'First Quantum Minerals', value: 'First Quantum Minerals' }, { label: 'Teck Resources', value: 'Teck Resources' }, { label: 'Antofagasta', value: 'Antofagasta' }, { label: 'China Molybdenum', value: 'China Molybdenum' }, { label: 'China Northern Rare Earth Group', value: 'China Northern Rare Earth Group' }
    ];

    this.stockCodes = [
      { label: 'AAPL', value: 'AAPL' },
      { label: 'AMZN', value: 'AMZN' },
      { label: 'TSLA', value: 'TSLA' },
      { label: 'GOOGL', value: 'GOOGL' },
      { label: 'NVDA', value: 'NVDA' },
      { label: 'INTC', value: 'INTC' },
      { label: 'NFLX', value: 'NFLX' },
      { label: 'META', value: 'META' },
      { label: 'MSFT', value: 'MSFT' },
      { label: '005930.KS', value: '005930.KS' },
      { label: '6758.T', value: '6758.T' },
      { label: 'BABA', value: 'BABA' },
      { label: 'BIDU', value: 'BIDU' },
      { label: '0700.HK', value: '0700.HK' },
      { label: 'ADBE', value: 'ADBE' },
      { label: 'CRM', value: 'CRM' },
      { label: 'ORCL', value: 'ORCL' },
      { label: 'IBM', value: 'IBM' },
      { label: 'ZM', value: 'ZM' },
      { label: 'SPOT', value: 'SPOT' },
      { label: 'TWTR', value: 'TWTR' },
      { label: 'SNAP', value: 'SNAP' },
      { label: 'PINS', value: 'PINS' },
      { label: 'ABNB', value: 'ABNB' },
      { label: 'UBER', value: 'UBER' },
      { label: 'LYFT', value: 'LYFT' },
      { label: 'DASH', value: 'DASH' },
      { label: 'HOOD', value: 'HOOD' },
      { label: 'COIN', value: 'COIN' },
      { label: 'SQ', value: 'SQ' },
      { label: 'PYPL', value: 'PYPL' },
      { label: 'SHOP', value: 'SHOP' },
      { label: 'EBAY', value: 'EBAY' },
      { label: 'WMT', value: 'WMT' },
      { label: 'TGT', value: 'TGT' },
      { label: 'COST', value: 'COST' },
      { label: 'HD', value: 'HD' },
      { label: 'LOW', value: 'LOW' },
      { label: 'BBY', value: 'BBY' },
      { label: 'CVS', value: 'CVS' },
      { label: 'WBA', value: 'WBA' },
      { label: 'PFE', value: 'PFE' },
      { label: 'JNJ', value: 'JNJ' },
      { label: 'MRK', value: 'MRK' },
      { label: 'MRNA', value: 'MRNA' },
      { label: 'AZN', value: 'AZN' },
      { label: 'ROG.SW', value: 'ROG.SW' },
      { label: 'NVS', value: 'NVS' },
      { label: 'GSK', value: 'GSK' },
      { label: 'SAN.PA', value: 'SAN.PA' },
      { label: 'BMY', value: 'BMY' },
      { label: 'ABBV', value: 'ABBV' },
      { label: 'XOM', value: 'XOM' },
      { label: 'CVX', value: 'CVX' },
      { label: 'BP', value: 'BP' },
      { label: 'SHEL', value: 'SHEL' },
      { label: 'TOT', value: 'TOT' },
      { label: 'COP', value: 'COP' },
      { label: 'E', value: 'E' },
      { label: 'EQNR', value: 'EQNR' },
      { label: 'REP.MC', value: 'REP.MC' },
      { label: 'PBR', value: 'PBR' },
      { label: 'GAZP.ME', value: 'GAZP.ME' },
      { label: 'ROSN.ME', value: 'ROSN.ME' },
      { label: 'VOW3.DE', value: 'VOW3.DE' },
      { label: 'BMW.DE', value: 'BMW.DE' },
      { label: 'DAI.DE', value: 'DAI.DE' },
      { label: 'F', value: 'F' },
      { label: 'GM', value: 'GM' },
      { label: 'HMC', value: 'HMC' },
      { label: 'TM', value: 'TM' },
      { label: '005380.KS', value: '005380.KS' },
      { label: '000270.KS', value: '000270.KS' },
      { label: 'NSANY', value: 'NSANY' },
      { label: 'MZDAY', value: 'MZDAY' },
      { label: 'FUJHY', value: 'FUJHY' },
      { label: '066570.KS', value: '066570.KS' },
      { label: '6752.T', value: '6752.T' },
      { label: '6502.T', value: '6502.T' },
      { label: '6501.T', value: '6501.T' },
      { label: '6702.T', value: '6702.T' },
      { label: '6701.T', value: '6701.T' },
      { label: '6753.T', value: '6753.T' },
      { label: 'CAJ', value: 'CAJ' },
      { label: 'NINOY', value: 'NINOY' },
      { label: 'OCPNY', value: 'OCPNY' },
      { label: 'RICOY', value: 'RICOY' },
      { label: 'SIE.DE', value: 'SIE.DE' },
      { label: 'BOSCHLTD.NS', value: 'BOSCHLTD.NS' },
      { label: 'PHIA.AS', value: 'PHIA.AS' },
      { label: 'SU.PA', value: 'SU.PA' },
      { label: 'ABB', value: 'ABB' },
      { label: 'HON', value: 'HON' },
      { label: 'GE', value: 'GE' },
      { label: 'EMR', value: 'EMR' },
      { label: 'ROK', value: 'ROK' },
      { label: 'MMM', value: 'MMM' },
      { label: 'DD', value: 'DD' },
      { label: 'BAS.DE', value: 'BAS.DE' },
      { label: 'DOW', value: 'DOW' },
      { label: 'LYB', value: 'LYB' },
      { label: '2010.SR', value: '2010.SR' },
      { label: '1301.TW', value: '1301.TW' },
      { label: '051910.KS', value: '051910.KS' },
      { label: '096770.KS', value: '096770.KS' },
      { label: '4188.T', value: '4188.T' },
      { label: '3407.T', value: '3407.T' },
      { label: '4005.T', value: '4005.T' },
      { label: '3402.T', value: '3402.T' },
      { label: '5401.T', value: '5401.T' },
      { label: '5411.T', value: '5411.T' },
      { label: 'MT', value: 'MT' },
      { label: 'NUE', value: 'NUE' },
      { label: 'X', value: 'X' },
      { label: 'STLD', value: 'STLD' },
      { label: 'CLF', value: 'CLF' },
      { label: 'AKS', value: 'AKS' },
      { label: 'TATASTEEL.NS', value: 'TATASTEEL.NS' },
      { label: 'TKAG.DE', value: 'TKAG.DE' },
      { label: 'RIO', value: 'RIO' },
      { label: 'BHP', value: 'BHP' },
      { label: 'VALE', value: 'VALE' },
      { label: 'AAL.L', value: 'AAL.L' },
      { label: 'GLEN.L', value: 'GLEN.L' },
      { label: 'FCX', value: 'FCX' },
      { label: 'NEM', value: 'NEM' },
      { label: 'GOLD', value: 'GOLD' },
      { label: 'SCCO', value: 'SCCO' },
      { label: 'FM.TO', value: 'FM.TO' },
      { label: 'TECK', value: 'TECK' },
      { label: 'ANTO.L', value: 'ANTO.L' },
      { label: '3993.HK', value: '3993.HK' },
      { label: '600111.SS', value: '600111.SS' }
    ];
  }

  getRadarData(): void {
    const formattedStart = this.startDate ? new Date(this.startDate).toISOString().split('T')[0] : undefined;
    const formattedEnd = this.endDate ? new Date(this.endDate).toISOString().split('T')[0] : undefined;
  
    this.radarService.getRadarData(
      this.selectedSector || undefined,
      this.selectedAdvice || undefined,
      this.selectedInstitution || undefined,
      formattedStart,
      formattedEnd,
      this.selectedStockCode || undefined
    ).subscribe(data => {
      this.allCards = data;
      this.first = 0; // Sayfa başa alınır
      this.updateDisplayedData(); // Güncelleme fonksiyonu çağrılır
    });
  }
  
  updateDisplayedData(): void {
    this.stockData = this.allCards.slice(this.first, this.first + this.rows);
  }
  
  onPageChange(event: any): void {
    this.first = event.first;
    this.updateDisplayedData();
  }

  clearFilters(): void {
    this.selectedSector = null;
    this.selectedAdvice = null;
    this.selectedInstitution = null;
    this.selectedStockCode = null;
    this.startDate = null;
    this.endDate = null;
    this.getRadarData();
  }
}
