import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  // Mapowanie kategorii na polskie nazwy i opisy
  private categoryConfig: { [key: string]: { name: string; description: string; icon: string } } = {
    'necklaces': {
      name: 'Naszyjniki',
      description: 'Odkryj naszą wyjątkową kolekcję naszyjników',
      icon: 'diamond'
    },
    'bracelets': {
      name: 'Bransoletki',
      description: 'Eleganckie bransoletki na każdą okazję',
      icon: 'watch'
    },
    'rings': {
      name: 'Pierścionki',
      description: 'Piękne pierścionki o unikalnym designie',
      icon: 'circle'
    },
    'earrings': {
      name: 'Kolczyki',
      description: 'Subtelne i efektowne kolczyki',
      icon: 'auto_awesome'
    }
  };

  constructor(
    private route: ActivatedRoute,
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
      'necklaces': 'necklace',
      'bracelets': 'bracelet',
      'rings': 'ring',
      'earrings': 'earrings'
    };

    const dbCategory = categoryMapping[this.category];
    console.log('Loading category:', this.category, 'mapped to DB category:', dbCategory);

    if (dbCategory) {
      this.jewelryService.getJewelryByCategory(dbCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          console.log('Loaded items for category:', dbCategory, 'count:', items.length);
          this.jewelryItems = items;
        });
    } else {
      console.error('Unknown category:', this.category);
      this.jewelryItems = [];
    }
  }


  getCategoryConfig() {
    return this.categoryConfig[this.category] || {
      name: 'Biżuteria',
      description: 'Nasza kolekcja biżuterii',
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
}
