import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAgregarTipoComponent } from './dialogo-agregar-tipo.component';

describe('DialogoAgregarTipoComponent', () => {
  let component: DialogoAgregarTipoComponent;
  let fixture: ComponentFixture<DialogoAgregarTipoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogoAgregarTipoComponent]
    });
    fixture = TestBed.createComponent(DialogoAgregarTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
