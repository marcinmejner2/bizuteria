import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NecklacesComponent } from './necklaces.component';

describe('NecklacesComponent', () => {
  let component: NecklacesComponent;
  let fixture: ComponentFixture<NecklacesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NecklacesComponent]
    });
    fixture = TestBed.createComponent(NecklacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
