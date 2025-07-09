import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRepuestoComponent } from './create-repuesto.component';

describe('CreateRepuestoComponent', () => {
  let component: CreateRepuestoComponent;
  let fixture: ComponentFixture<CreateRepuestoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRepuestoComponent]
    });
    fixture = TestBed.createComponent(CreateRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
