import { Component, OnInit } from '@angular/core';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-bracelets',
  templateUrl: './bracelets.component.html',
  styleUrls: ['./bracelets.component.scss']
})
export class BraceletsComponent implements OnInit {
  bracelets: Jewelry[] = [];
  loading: boolean = true;

  constructor(
    private jewelryService: JewelryService,
    public authService: AuthService
  ) { }

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
