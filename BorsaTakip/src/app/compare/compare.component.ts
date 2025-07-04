import { Component, OnInit } from '@angular/core';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html'
})
export class CompareComponent implements OnInit {
    stockOptions = [
  { label: 'Apple', value: 'AAPL' },
  { label: 'Amazon', value: 'AMZN' },
  { label: 'Tesla', value: 'TSLA' },
  { label: 'Google', value: 'GOOGL' },
  { label: 'Nvidia', value: 'NVDA' },
  { label: 'Intel', value: 'INTC' },
  { label: 'Meta', value: 'META' },
  { label: 'Microsoft', value: 'MSFT' },
  { label: 'Netflix', value: 'NFLX' },
  { label: 'Samsung', value: '005930.KS' },
  { label: 'Sony', value: '6758.T' },
  { label: 'Alibaba', value: 'BABA' },
  { label: 'Baidu', value: 'BIDU' },
  { label: 'Tencent', value: '0700.HK' },
  { label: 'Adobe', value: 'ADBE' },
  { label: 'Salesforce', value: 'CRM' },
  { label: 'Oracle', value: 'ORCL' },
  { label: 'IBM', value: 'IBM' },
  { label: 'Zoom', value: 'ZM' },
  { label: 'Spotify', value: 'SPOT' },
  { label: 'Twitter', value: 'TWTR' },
  { label: 'Snap', value: 'SNAP' },
  { label: 'Pinterest', value: 'PINS' },
  { label: 'LinkedIn', value: 'LNKD' },
  { label: 'Reddit', value: 'REDDIT' },
  { label: 'TikTok', value: 'BYTEDANCE' },
  { label: 'ByteDance', value: 'BYTEDANCE' },
  { label: 'Airbnb', value: 'ABNB' },
  { label: 'Uber', value: 'UBER' },
  { label: 'Lyft', value: 'LYFT' },
  { label: 'DoorDash', value: 'DASH' },
  { label: 'Robinhood', value: 'HOOD' },
  { label: 'Coinbase', value: 'COIN' },
  { label: 'Square', value: 'SQ' },
  { label: 'PayPal', value: 'PYPL' },
  { label: 'Stripe', value: 'STRIPE' },
  { label: 'Shopify', value: 'SHOP' },
  { label: 'eBay', value: 'EBAY' },
  { label: 'Walmart', value: 'WMT' },
  { label: 'Target', value: 'TGT' },
  { label: 'Costco', value: 'COST' },
  { label: 'Home Depot', value: 'HD' },
  { label: "Lowe's", value: 'LOW' },
  { label: 'Best Buy', value: 'BBY' },
  { label: 'CVS Health', value: 'CVS' },
  { label: 'Walgreens Boots Alliance', value: 'WBA' },
  { label: 'Pfizer', value: 'PFE' },
  { label: 'Johnson & Johnson', value: 'JNJ' },
  { label: 'Merck', value: 'MRK' },
  { label: 'Moderna', value: 'MRNA' },
  { label: 'AstraZeneca', value: 'AZN' },
  { label: 'Roche', value: 'ROG.SW' },
  { label: 'Novartis', value: 'NVS' },
  { label: 'GlaxoSmithKline', value: 'GSK' },
  { label: 'Sanofi', value: 'SAN.PA' },
  { label: 'BriSquibbstol-Myers ', value: 'BMY' },
  { label: 'AbbVie', value: 'ABBV' },
  { label: 'ExxonMobil', value: 'XOM' },
  { label: 'Chevron', value: 'CVX' },
  { label: 'BP', value: 'BP' },
  { label: 'Shell', value: 'SHEL' },
  { label: 'TotalEnergies', value: 'TOT' },
  { label: 'ConocoPhillips', value: 'COP' },
  { label: 'Eni', value: 'E' },
  { label: 'Equinor', value: 'EQNR' },
  { label: 'Repsol', value: 'REP.MC' },
  { label: 'Petrobras', value: 'PBR' },
  { label: 'Gazprom', value: 'GAZP.ME' },
  { label: 'Rosneft', value: 'ROSN.ME' },
  { label: 'Volkswagen', value: 'VOW3.DE' },
  { label: 'BMW', value: 'BMW.DE' },
  { label: 'Daimler', value: 'DAI.DE' },
  { label: 'Ford', value: 'F' },
  { label: 'General Motors', value: 'GM' },
  { label: 'Honda', value: 'HMC' },
  { label: 'Toyota', value: 'TM' },
  { label: 'Hyundai', value: '005380.KS' },
  { label: 'Kia', value: '000270.KS' },
  { label: 'Nissan', value: 'NSANY' },
  { label: 'Mazda', value: 'MZDAY' },
  { label: 'Subaru', value: 'FUJHY' },
  { label: 'LG Electronics', value: '066570.KS' },
  { label: 'Panasonic', value: '6752.T' },
  { label: 'Toshiba', value: '6502.T' },
  { label: 'Hitachi', value: '6501.T' },
  { label: 'Fujitsu', value: '6702.T' },
  { label: 'NEC', value: '6701.T' },
  { label: 'Sharp', value: '6753.T' },
  { label: 'Canon', value: 'CAJ' },
  { label: 'Nikon', value: 'NINOY' },
  { label: 'Olympus', value: 'OCPNY' },
  { label: 'Ricoh', value: 'RICOY' },
  { label: 'Siemens', value: 'SIE.DE' },
  { label: 'Bosch', value: 'BOSCHLTD.NS' },
  { label: 'Philips', value: 'PHIA.AS' },
  { label: 'Schneider Electric', value: 'SU.PA' },
  { label: 'ABB', value: 'ABB' },
  { label: 'Honeywell', value: 'HON' },
  { label: 'General Electric', value: 'GE' },
  { label: 'Emerson Electric', value: 'EMR' },
  { label: 'Rockwell Automation', value: 'ROK' },
  { label: '3M', value: 'MMM' },
  { label: 'DuPont', value: 'DD' },
  { label: 'BASF', value: 'BAS.DE' },
  { label: 'Dow Chemical', value: 'DOW' },
  { label: 'LyondellBasell', value: 'LYB' },
  { label: 'SABIC', value: '2010.SR' },
  { label: 'Formosa Plastics', value: '1301.TW' },
  { label: 'LG Chem', value: '051910.KS' },
  { label: 'SK Innovation', value: '096770.KS' },
  { label: 'Mitsubishi Chemical', value: '4188.T' },
  { label: 'Asahi Kasei', value: '3407.T' },
  { label: 'Sumitomo Chemical', value: '4005.T' },
  { label: 'Toray Industries', value: '3402.T' },
  { label: 'Nippon Steel', value: '5401.T' },
  { label: 'JFE Holdings', value: '5411.T' },
  { label: 'ArcelorMittal', value: 'MT' },
  { label: 'Nucor', value: 'NUE' },
  { label: 'United States Steel', value: 'X' },
  { label: 'Steel Dynamics', value: 'STLD' },
  { label: 'Cleveland-Cliffs', value: 'CLF' },
  { label: 'AK Steel', value: 'AKS' },
  { label: 'Tata Steel', value: 'TATASTEEL.NS' },
  { label: 'Thyssenkrupp', value: 'TKAG.DE' },
  { label: 'Rio Tinto', value: 'RIO' },
  { label: 'BHP', value: 'BHP' },
  { label: 'Vale', value: 'VALE' },
  { label: 'Anglo American', value: 'AAL.L' },
  { label: 'Glencore', value: 'GLEN.L' },
  { label: 'Freeport-McMoRan', value: 'FCX' },
  { label: 'Newmont Corporation', value: 'NEM' },
  { label: 'Barrick Gold', value: 'GOLD' },
  { label: 'Southern Copper', value: 'SCCO' },
  { label: 'First Quantum Minerals', value: 'FM.TO' },
  { label: 'Teck Resources', value: 'TECK' },
  { label: 'Antofagasta', value: 'ANTO.L' },
  { label: 'China Molybdenum', value: '3993.HK' },
  { label: 'China Northern Rare Earth Group', value: '600111.SS' }
];
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