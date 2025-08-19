import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-earrings',
  templateUrl: './earrings.component.html',
  styleUrls: ['./earrings.component.scss']
})
export class EarringsComponent implements OnInit {
  earrings: Jewelry[] = [];
  loading: boolean = true;

  constructor(
    private jewelryService: JewelryService,
    public authService: AuthService
  ) { }

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

  toggleInStock(jewelry: Jewelry): void {
    if (!jewelry.id) return;

    const newStatus = !jewelry.inStock;
    this.jewelryService.updateJewelry(jewelry.id, { inStock: newStatus })
      .then(() => {
        console.log(`Status dostępności "${jewelry.name}" zmieniony na: ${newStatus ? 'dostępny' : 'niedostępny'}`);
      })
      .catch(error => {
        console.error('Błąd podczas aktualizacji statusu:', error);
      });
  }
}
