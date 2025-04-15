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
import { RadarComponent } from './radar/radar.component';
import { CompareComponent } from './compare/compare.component';
import { HighlightsComponent } from './highlights/highlights.component';
import { MarketComponent } from './market/market.component';
import { ContactComponent } from './contact/contact.component';
import {PaginatorModule} from "primeng/paginator";
import {BadgeModule} from "primeng/badge";
import {HttpClientModule} from "@angular/common/http";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {DialogModule} from "primeng/dialog";
import {SpeedDialModule} from "primeng/speeddial";

import {LOCALE_ID } from '@angular/core';
import localeTr from '@angular/common/locales/tr';
import { registerLocaleData } from '@angular/common';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';





registerLocaleData(localeTr);


@NgModule({
  declarations: [
    AppComponent,
    BorsaTakipComponent,
    StocksComponent,
    RadarComponent,
    CompareComponent,
    HighlightsComponent,
    MarketComponent,
    ContactComponent,
    LoginComponent,
    RegisterComponent
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
    PaginatorModule,
    BadgeModule,
    HttpClientModule,
    NoopAnimationsModule,
    DialogModule,
    SpeedDialModule,
    ButtonModule,
    ToastModule,
    MenuModule

  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'tr' },
    MessageService
  ]
  ,  
  bootstrap: [AppComponent]
})
export class AppModule {
}
