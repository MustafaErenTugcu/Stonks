import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorsaTakipComponent } from './borsa-takip.component';

describe('BorsaTakipComponent', () => {
  let component: BorsaTakipComponent;
  let fixture: ComponentFixture<BorsaTakipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorsaTakipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorsaTakipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
