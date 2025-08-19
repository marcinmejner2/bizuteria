import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarringsComponent } from './earrings.component';

describe('EarringsComponent', () => {
  let component: EarringsComponent;
  let fixture: ComponentFixture<EarringsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EarringsComponent]
    });
    fixture = TestBed.createComponent(EarringsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
