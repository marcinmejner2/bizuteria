import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';

@Component({
  selector: 'app-bracelets',
  templateUrl: './bracelets.component.html',
  styleUrls: ['./bracelets.component.scss']
})
export class BraceletsComponent implements OnInit {
  bracelets: Jewelry[] = [];
  loading: boolean = true;

  constructor(private jewelryService: JewelryService) { }

  ngOnInit(): void {
    this.loadBracelets();
  }

  loadBracelets(): void {
    this.loading = true;
    this.jewelryService.getJewelryByCategory('bracelet').subscribe(
      (data) => {
        this.bracelets = data;
        this.loading = false;
      },
      (error) => {
        console.error('Błąd podczas ładowania bransoletek:', error);
        this.loading = false;
      }
    );
  }
}
