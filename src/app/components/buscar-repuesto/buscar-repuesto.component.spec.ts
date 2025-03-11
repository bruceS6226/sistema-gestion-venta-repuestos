import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarRepuestoComponent } from './buscar-repuesto.component';

describe('BuscarRepuestoComponent', () => {
  let component: BuscarRepuestoComponent;
  let fixture: ComponentFixture<BuscarRepuestoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuscarRepuestoComponent]
    });
    fixture = TestBed.createComponent(BuscarRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
