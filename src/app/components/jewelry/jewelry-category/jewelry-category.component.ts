import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JewelryService } from '../../../services/jewelry.service';
import { AuthService } from '../../../services/auth.service';
import { Jewelry } from '../../../models/jewelry';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-jewelry-category',
  templateUrl: './jewelry-category.component.html',
  styleUrls: ['./jewelry-category.component.scss']
})
export class JewelryCategoryComponent implements OnInit, OnDestroy {
  jewelryItems: Jewelry[] = [];
  category: string = '';
  categoryDisplayName: string = '';
  isLoggedIn$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  // Modal dla powiększonych obrazków
  showImageModal: boolean = false;
  modalImageUrl: string = '';
  modalImageAlt: string = '';

  // Mapowanie kategorii na polskie nazwy i opisy
  private categoryConfig: { [key: string]: { name: string; description: string; icon: string } } = {
    'naramek': {
      name: 'Náramek',
      description: '',
      icon: 'diamond'
    },
    'krouzek': {
      name: 'Kroužek',
      description: '',
      icon: 'diamond'
    },

    'privesek': {
      name: 'Přívěsek',
      description: '',
      icon: 'diamond'
    },
    'naramekNaKotnik': {
      name: 'Náramek na kotník',
      description: '',
      icon: 'diamond'
    },
    'klicenka': {
      name: 'Klíčenka',
      description: '',
      icon: 'diamond'
    },
    'nausnice': {
      name: 'Náušnice',
      description: '',
      icon: 'diamond'
    },
    'sadaSperku': {
      name: 'Sada šperků',
      description: '',
      icon: 'diamond'
    },
    'mobil': {
      name: 'Mobil',
      description: '',
      icon: 'diamond'
    },
    'ostatni': {
      name: 'Ostatni',
      description: '',
      icon: 'diamond'
    },

  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jewelryService: JewelryService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    // Pobierz kategorię z URL
    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.category = data['category'];
        this.updateCategoryInfo();
        this.loadJewelryByCategory();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCategoryInfo(): void {
    const config = this.categoryConfig[this.category];
    if (config) {
      this.categoryDisplayName = config.name;
    } else {
      this.categoryDisplayName = 'Biżuteria';
    }
  }

  private loadJewelryByCategory(): void {
    // Mapowanie URL na kategorie w bazie danych
    const categoryMapping: { [key: string]: string } = {
      'privesek': 'privesek',
      'krouzek': 'krouzek',
      'naramek': 'naramek',
      'nausnice': 'nausnice',
      'naramekNaKotnik': 'naramekNaKotnik',
      'klicenka': 'klicenka',
      'sadaSperku': 'sadaSperku',
      'mobil': 'mobil',
      'ostatni': 'ostatni',

    };

    const dbCategory = categoryMapping[this.category];
    console.log('Loading category:', this.category, 'mapped to DB category:', dbCategory);

    if (dbCategory) {
      this.jewelryService.getJewelryByCategory(dbCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          console.log('Loaded items for category:', dbCategory, 'count:', items.length);
          // Sortowanie produktów alfabetycznie po nazwach
          this.jewelryItems = items.sort((a, b) => a.name.localeCompare(b.name, 'cs', {
            numeric: true,
            sensitivity: 'base'
          }));
        });
    } else {
      console.error('Unknown category:', this.category);
      this.jewelryItems = [];
    }
  }

  getCategoryConfig() {
    return this.categoryConfig[this.category] || {
      name: 'naramek',
      description: 'Nasza kolekcja biżuterii1',
      icon: 'diamond'
    };
  }

  deleteItem(item: Jewelry): void {
    if (confirm(`Czy na pewno chcesz usunąć "${item.name}"?`)) {
      if (item.id) {
        this.jewelryService.deleteJewelry(item.id)
          .then(() => {
            console.log('Przedmiot usunięty');
            // Lista zostanie automatycznie zaktualizowana przez Observable
          })
          .catch(error => {
            console.error('Błąd podczas usuwania:', error);
            alert('Wystąpił błąd podczas usuwania przedmiotu');
          });
      }
    }
  }

  updateStock(item: Jewelry): void {
    if (item.id) {
      this.jewelryService.updateJewelry(item.id, { inStock: item.inStock })
        .then(() => {
          console.log('Stan magazynowy zaktualizowany');
        })
        .catch(error => {
          console.error('Błąd podczas aktualizacji:', error);
          alert('Wystąpił błąd podczas aktualizacji');
        });
    }
  }

  editItem(item: Jewelry): void {
    if (item.id) {
      // Przekieruj do panelu administratora z ID przedmiotu do edycji
      this.router.navigate(['/admin'], { queryParams: { editId: item.id } });
    }
  }

  openImageModal(imageUrl: string, imageAlt: string): void {
    this.modalImageUrl = imageUrl;
    this.modalImageAlt = imageAlt;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageUrl = '';
    this.modalImageAlt = '';
  }
}
