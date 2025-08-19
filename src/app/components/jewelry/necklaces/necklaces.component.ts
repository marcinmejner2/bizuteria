import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-necklaces',
  templateUrl: './necklaces.component.html',
  styleUrls: ['./necklaces.component.scss']
})
export class NecklacesComponent implements OnInit {
  necklaces: Jewelry[] = [];
  loading: boolean = true;

  constructor(
    private jewelryService: JewelryService,
    public authService: AuthService
  ) { }

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
