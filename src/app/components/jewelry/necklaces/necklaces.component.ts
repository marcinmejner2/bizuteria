import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';

@Component({
  selector: 'app-necklaces',
  templateUrl: './necklaces.component.html',
  styleUrls: ['./necklaces.component.scss']
})
export class NecklacesComponent implements OnInit {
  necklaces: Jewelry[] = [];
  loading: boolean = true;

  constructor(private jewelryService: JewelryService) { }

  ngOnInit(): void {
    this.loadNecklaces();
  }

  loadNecklaces(): void {
    this.loading = true;
    this.jewelryService.getJewelryByCategory('necklace').subscribe(
      (data) => {
        this.necklaces = data;
        this.loading = false;
      },
      (error) => {
        console.error('Błąd podczas ładowania naszyjników:', error);
        this.loading = false;
      }
    );
  }
}
