import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoRepuestosComponent } from './catalogo-repuestos.component';

describe('CatalogoRepuestosComponent', () => {
  let component: CatalogoRepuestosComponent;
  let fixture: ComponentFixture<CatalogoRepuestosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogoRepuestosComponent]
    });
    fixture = TestBed.createComponent(CatalogoRepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
