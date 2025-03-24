import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StocksComponent} from "./stocks/stocks.component";
import {PredictionsComponent} from "./predictions/predictions.component";
import {RadarComponent} from "./radar/radar.component";
import {CompareComponent} from "./compare/compare.component";
import {HighlightsComponent} from "./highlights/highlights.component";
import {ReportsComponent} from "./reports/reports.component";
import {MarketComponent} from "./market/market.component";
import {ContactComponent} from "./contact/contact.component";
import {BorsaTakipComponent} from "./borsa-takip/borsa-takip.component";

const routes: Routes = [
  { path: '', component: BorsaTakipComponent },
  { path: 'hisselerimiz', component: StocksComponent },
  { path: 'tahminler', component: PredictionsComponent },
  { path: 'radar', component: RadarComponent },
  { path: 'hisse-karşılaştır', component: CompareComponent },
  { path: 'öne-çıkanlar', component: HighlightsComponent },
  { path: 'raporlar', component: ReportsComponent },
  { path: 'piyasa', component: MarketComponent },
  { path: 'iletisim', component: ContactComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule
{
}
