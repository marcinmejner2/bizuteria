import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';

@Component({
  selector: 'app-earrings',
  templateUrl: './earrings.component.html',
  styleUrls: ['./earrings.component.scss']
})
export class EarringsComponent implements OnInit {
  earrings: Jewelry[] = [];
  loading: boolean = true;

  constructor(private jewelryService: JewelryService) { }

  ngOnInit(): void {
    this.loadEarrings();
  }

  loadEarrings(): void {
    this.loading = true;
    this.jewelryService.getJewelryByCategory('earrings').subscribe(
      (data) => {
        this.earrings = data;
        this.loading = false;
      },
      (error) => {
        console.error('Błąd podczas ładowania kolczyków:', error);
        this.loading = false;
      }
    );
  }
}
