import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry } from '../../../models/jewelry';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  selectedTabIndex: number = 0; // Dodane dla Material Tabs
  jewelryList: Jewelry[] = [];
  filteredJewelry: Jewelry[] = [];
  jewelryForm!: FormGroup;
  isSubmitting: boolean = false;
  searchTerm: string = '';
  categoryFilter: string = '';
  editItemId: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private jewelryService: JewelryService,
    private fb: FormBuilder,
    private route: ActivatedRoute // Dodany ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadJewelry();

    // Obsługa parametru editId z URL
    this.route.queryParams.subscribe(params => {
      const editId = params['editId'];
      if (editId) {
        // Znajdź przedmiot do edycji i przełącz na zakładkę formularza
        this.jewelryService.getJewelryById(editId).subscribe({
          next: (item) => {
            if (item) {
              this.editItem(item);
            }
          },
          error: (error) => {
            console.error('Błąd podczas ładowania przedmiotu do edycji:', error);
          }
        });
      }
    });
  }

  initForm(item?: Jewelry): void {
    const urlValidators = this.selectedFile ? [] : [Validators.required];

    this.jewelryForm = this.fb.group({
      name: [item?.name || '', Validators.required],
      description: [item?.description || '', Validators.required],
      price: [item?.price || '', [Validators.required, Validators.min(0.01)]],
      imageUrl: [item?.imageUrl || '', urlValidators],
      category: [item?.category || '', Validators.required],
      inStock: [item?.inStock !== undefined ? item.inStock : true]
    });
  }

  loadJewelry(): void {
    this.jewelryService.getAllJewelry().subscribe(items => {
      this.jewelryList = items;
      this.applyFilters();
    });
  }


  // Naprawione filtrowanie z dodaną metodą getCategoryName
  applyFilters(): void {
    let filtered = [...this.jewelryList];

    // Filtrowanie po kategorii
    if (this.categoryFilter) {
      filtered = filtered.filter(item => item.category === this.categoryFilter);
    }

    // Filtrowanie wyszukiwania
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    this.filteredJewelry = filtered;
  }

  // Nowa metoda do czyszczenia filtrów
  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.applyFilters();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Wybrano plik:', this.selectedFile.name);

      // Zmień walidację pola URL - nie jest wymagane, gdy mamy plik
      this.jewelryForm.get('imageUrl')?.clearValidators();
      this.jewelryForm.get('imageUrl')?.updateValueAndValidity();
    }
  }

  clearSelectedFile(): void {
    this.selectedFile = null;

    // Przywróć walidację pola URL - jest wymagane, gdy nie mamy pliku
    this.jewelryForm.get('imageUrl')?.setValidators([Validators.required]);
    this.jewelryForm.get('imageUrl')?.updateValueAndValidity();
  }

  onSubmit(): void {
    console.log('onSubmit wywołana', this.jewelryForm.value, this.jewelryForm.valid);

    if (this.jewelryForm.invalid && !this.selectedFile) {
      console.log('Formularz jest nieprawidłowy', this.jewelryForm.errors);
      return;
    }

    this.isSubmitting = true;
    const formData = this.jewelryForm.value as Jewelry;
    console.log('Dane formularza do wysłania:', formData);

    if (this.editItemId) {
      // Aktualizacja istniejącego przedmiotu
      if (this.selectedFile) {
        // Jeśli mamy nowy plik obrazka
        this.jewelryService.addJewelry(formData, this.selectedFile)
          .then((result) => {
            // Pobierz nowy URL obrazka z rezultatu
            return this.jewelryService.updateJewelry(this.editItemId as string, {
              ...formData,
              imageUrl: result.imageUrl
            });
          })
          .then(() => {
            this.selectedTabIndex = 0; // Wróć do listy
            this.loadJewelry();
            this.selectedFile = null;
            this.editItemId = null;
          })
          .catch(error => {
            console.error('Błąd podczas aktualizacji:', error);
            alert('Wystąpił błąd podczas aktualizacji: ' + error.message);
          })
          .finally(() => {
            this.isSubmitting = false;
          });
      } else {
        // Aktualizacja bez zmiany obrazka
        this.jewelryService.updateJewelry(this.editItemId, formData)
          .then(() => {
            this.selectedTabIndex = 0; // Wróć do listy
            this.loadJewelry();
            this.editItemId = null;
          })
          .catch(error => {
            console.error('Błąd podczas aktualizacji:', error);
            alert('Wystąpił błąd podczas aktualizacji: ' + error.message);
          })
          .finally(() => {
            this.isSubmitting = false;
          });
      }
    } else {
      // Dodawanie nowego przedmiotu
      console.log('Próba dodania nowego przedmiotu', this.selectedFile ? 'z obrazem' : 'z URL');
      this.jewelryService.addJewelry(formData, this.selectedFile || undefined)
        .then((result) => {
          console.log('Przedmiot dodany pomyślnie', result);
          this.selectedTabIndex = 0; // Wróć do listy
          this.loadJewelry();
          this.jewelryForm.reset();
          this.selectedFile = null;
        })
        .catch(error => {
          console.error('Błąd podczas dodawania:', error);
          alert('Wystąpił błąd podczas dodawania przedmiotu: ' + error.message);
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    }
  }

  handleSubmitClick(event: Event): void {
    console.log('Kliknięto przycisk submit');
    // Zapobiegamy domyślnej akcji formularza, ponieważ obsługujemy to przez (ngSubmit)
    // event.preventDefault();

    // Sprawdzamy poprawność formularza
    console.log('Stan formularza:', {
      valid: this.jewelryForm.valid,
      dirty: this.jewelryForm.dirty,
      touched: this.jewelryForm.touched,
      values: this.jewelryForm.value
    });

    // Manualnie wywołujemy onSubmit jeśli formularz jest prawidłowy
    if (this.jewelryForm.valid) {
      console.log('Formularz prawidłowy, wywołujemy onSubmit()');
      this.onSubmit();
    } else {
      console.log('Formularz nieprawidłowy, nie można wysłać');
      // Oznaczamy wszystkie pola jako touched, aby pokazać błędy walidacji
      Object.keys(this.jewelryForm.controls).forEach(key => {
        const control = this.jewelryForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Metoda do tłumaczenia nazw kategorii
  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'necklace': 'Naszyjnik',
      'bracelet': 'Bransoletka',
      'ring': 'Pierścionek',
      'earrings': 'Kolczyki'
    };
    return categoryNames[category] || category;
  }

  // Poprawiona metoda editItem z przełączaniem zakładek
  editItem(item: Jewelry): void {
    this.selectedTabIndex = 1; // Przełącz na zakładkę formularza
    this.editItemId = item.id || null;
    this.initForm(item);
  }

  // Poprawiona metoda cancelEdit
  cancelEdit(): void {
    this.selectedTabIndex = 0; // Wróć do listy
    this.editItemId = null;
    this.selectedFile = null;
    this.initForm(); // Reset formularza
  }

  deleteItem(item: Jewelry): void {
    if (confirm(`Czy na pewno chcesz usunąć "${item.name}"?`)) {
      if (item.id) {
        this.jewelryService.deleteJewelry(item.id)
          .then(() => {
            this.loadJewelry();
          })
          .catch(error => console.error('Błąd podczas usuwania:', error));
      }
    }
  }
}
