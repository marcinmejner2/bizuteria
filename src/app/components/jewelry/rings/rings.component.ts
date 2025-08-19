import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';

@Component({
  selector: 'app-rings',
  templateUrl: './rings.component.html',
  styleUrls: ['./rings.component.scss']
})
export class RingsComponent implements OnInit {
  rings: Jewelry[] = [];
  loading: boolean = true;

  constructor(private jewelryService: JewelryService) { }

  ngOnInit(): void {
    this.loadRings();
  }

  loadRings(): void {
    this.loading = true;
    this.jewelryService.getJewelryByCategory('ring').subscribe(
      (data) => {
        this.rings = data;
        this.loading = false;
      },
      (error) => {
        console.error('Błąd podczas ładowania pierścionków:', error);
        this.loading = false;
      }
    );
  }
}
