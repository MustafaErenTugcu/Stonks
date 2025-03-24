import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BorsaTakipComponent } from './borsa-takip/borsa-takip.component';
import {CalendarModule} from "primeng/calendar";
import {ChartModule} from "primeng/chart";
import {FormsModule} from "@angular/forms";
import {CardModule} from "primeng/card";
import {TableModule} from "primeng/table";
import {TabViewModule} from "primeng/tabview";
import {DividerModule} from "primeng/divider";
import {DropdownModule} from "primeng/dropdown";
import { StocksComponent } from './stocks/stocks.component';
import { PredictionsComponent } from './predictions/predictions.component';
import { RadarComponent } from './radar/radar.component';
import { CompareComponent } from './compare/compare.component';
import { HighlightsComponent } from './highlights/highlights.component';
import { ReportsComponent } from './reports/reports.component';
import { MarketComponent } from './market/market.component';
import { ContactComponent } from './contact/contact.component';
import {PaginatorModule} from "primeng/paginator";

@NgModule({
  declarations: [
    AppComponent,
    BorsaTakipComponent,
    StocksComponent,
    PredictionsComponent,
    RadarComponent,
    CompareComponent,
    HighlightsComponent,
    ReportsComponent,
    MarketComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CalendarModule,
    ChartModule,
    FormsModule,
    CardModule,
    TableModule,
    TabViewModule,
    DividerModule,
    DropdownModule,
    PaginatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
