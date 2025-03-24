import {Component, NgIterable} from '@angular/core';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent {
  logos: NgIterable<unknown> & NgIterable<any>;

}
