import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAgregarModeloComponent } from './dialogo-agregar-modelo.component';

describe('DialogoAgregarModeloComponent', () => {
  let component: DialogoAgregarModeloComponent;
  let fixture: ComponentFixture<DialogoAgregarModeloComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogoAgregarModeloComponent]
    });
    fixture = TestBed.createComponent(DialogoAgregarModeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
