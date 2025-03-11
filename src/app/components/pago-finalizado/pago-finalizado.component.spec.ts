import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoFinalizadoComponent } from './pago-finalizado.component';

describe('PagoFinalizadoComponent', () => {
  let component: PagoFinalizadoComponent;
  let fixture: ComponentFixture<PagoFinalizadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PagoFinalizadoComponent]
    });
    fixture = TestBed.createComponent(PagoFinalizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
