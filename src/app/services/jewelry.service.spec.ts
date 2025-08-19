import { TestBed } from '@angular/core/testing';

import { JewelryService } from './jewelry.service';

describe('JewelryService', () => {
  let service: JewelryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JewelryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
