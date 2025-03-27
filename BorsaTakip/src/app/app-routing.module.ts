import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StocksComponent} from "./stocks/stocks.component";
import {RadarComponent} from "./radar/radar.component";
import {CompareComponent} from "./compare/compare.component";
import {HighlightsComponent} from "./highlights/highlights.component";
import {MarketComponent} from "./market/market.component";
import {ContactComponent} from "./contact/contact.component";
import {BorsaTakipComponent} from "./borsa-takip/borsa-takip.component";

const routes: Routes = [
  { path: '', component: BorsaTakipComponent },
  { path: 'hisselerimiz', component: StocksComponent },
  { path: 'radar', component: RadarComponent },
  { path: 'hisse-karşılaştır', component: CompareComponent },
  { path: 'öne-çıkanlar', component: HighlightsComponent },
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
