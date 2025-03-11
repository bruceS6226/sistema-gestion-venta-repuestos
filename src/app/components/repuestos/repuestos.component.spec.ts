import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepuestosComponent } from './repuestos.component';

describe('RepuestosComponent', () => {
  let component: RepuestosComponent;
  let fixture: ComponentFixture<RepuestosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepuestosComponent]
    });
    fixture = TestBed.createComponent(RepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
