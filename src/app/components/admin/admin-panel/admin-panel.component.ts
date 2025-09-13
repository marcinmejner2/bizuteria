import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JewelryService } from '../../../services/jewelry.service';
import { Jewelry, SexEnum } from '../../../models/jewelry';

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

  // Nowa zmienna do podglądu zdjęcia
  imagePreviewUrl: string | null = null;

  // Nowe zmienne do filtrowania
  priceRange: {min: number | null, max: number | null} = {min: null, max: null};
  availabilityFilter: string = 'all'; // 'all', 'available', 'unavailable'

  // Dodaj opcje płci
  sexOptions = [
    { value: SexEnum.FEMALE, label: 'Damska' },
    { value: SexEnum.MALE, label: 'Męska' }
  ];

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
      description: [item?.description || ''], // Usunięto Validators.required
      price: [item?.price || '', [Validators.required, Validators.min(0.01)]],
      imageUrl: [item?.imageUrl || '', urlValidators],
      category: [item?.category || '', Validators.required],
      sex: [item?.sex || [SexEnum.FEMALE]], // Domyślnie "Damska"
      inStock: [item?.inStock !== undefined ? item.inStock : true]
    });
  }

  loadJewelry(): void {
    this.jewelryService.getAllJewelry().subscribe(items => {
      // Sortowanie produktów alfabetycznie po nazwach
      this.jewelryList = items.sort((a, b) => a.name.localeCompare(b.name, 'cs', {
        numeric: true,
        sensitivity: 'base'
      }));
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

    // Filtrowanie po cenie
    if (this.priceRange.min !== null || this.priceRange.max !== null) {
      filtered = filtered.filter(item => {
        const price = item.price || 0;
        const inRange = (this.priceRange.min === null || price >= this.priceRange.min) &&
                        (this.priceRange.max === null || price <= this.priceRange.max);
        return inRange;
      });
    }

    // Filtrowanie po dostępności
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(item => item.inStock);
    } else if (this.availabilityFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.inStock);
    }

    // Sortowanie przefiltrowanych wyników alfabetycznie po nazwach
    this.filteredJewelry = filtered.sort((a, b) => a.name.localeCompare(b.name, 'cs', {
      numeric: true,
      sensitivity: 'base'
    }));
  }

  // Nowa metoda do czyszczenia filtrów
  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.priceRange = {min: null, max: null};
    this.availabilityFilter = 'all';
    this.applyFilters();
  }

  // Metoda do aktualizacji podglądu zdjęcia na podstawie URL
  updateImagePreview(): void {
    const imageUrl = this.jewelryForm.get('imageUrl')?.value;
    if (imageUrl && imageUrl.trim() !== '') {
      this.imagePreviewUrl = imageUrl;
    } else {
      this.imagePreviewUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Wybrano plik:', file.name, 'rozmiar:', this.formatFileSize(file.size));

      // Utwórz podgląd obrazu
      this.imagePreviewUrl = URL.createObjectURL(file);

      // Kompresuj obrazek przed ustawieniem
      this.compressImage(file).then(compressedFile => {
        this.selectedFile = compressedFile;
        console.log('Plik po kompresji:', compressedFile.name, 'rozmiar:', this.formatFileSize(compressedFile.size));

        // Zmień walidację pola URL - nie jest wymagane, gdy mamy plik
        this.jewelryForm.get('imageUrl')?.clearValidators();
        this.jewelryForm.get('imageUrl')?.updateValueAndValidity();
      }).catch(error => {
        console.error('Błąd podczas kompresji obrazu:', error);
        // W przypadku błędu użyj oryginalnego pliku
        this.selectedFile = file;
        this.jewelryForm.get('imageUrl')?.clearValidators();
        this.jewelryForm.get('imageUrl')?.updateValueAndValidity();
      });
    }
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Ustaw maksymalne wymiary (zachowaj proporcje)
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        // Oblicz nowe wymiary zachowując proporcje
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Ustaw wymiary canvas
        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Nie można uzyskać kontekstu canvas'));
          return;
        }

        // Narysuj przeskalowany obrazek
        ctx.drawImage(img, 0, 0, width, height);

        // Konwertuj do blob z kompresją
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Nie można skompresować obrazu'));
            return;
          }

          // Utwórz nowy plik z skompresowanymi danymi
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg', // Zawsze zapisz jako JPEG dla lepszej kompresji
            lastModified: Date.now()
          });

          resolve(compressedFile);
        }, 'image/jpeg', 0.80); // Jakość 80% - dobry kompromis między rozmiarem a jakością
      };

      img.onerror = () => reject(new Error('Nie można załadować obrazu'));
      img.src = URL.createObjectURL(file);
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Zaktualizowana metoda wyczyszczenia wybranego pliku
  clearSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null; // Czyszczenie podglądu

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
            this.resetForm(); // Wyczyść formularz
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
            this.resetForm(); // Wyczyść formularz
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
          this.resetForm(); // Wyczyść formularz
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

  // Metoda do dodania produktu i pozostania na formularze
  addProductAndStay(): void {
    if (this.jewelryForm.invalid && !this.selectedFile) {
      console.log('Formularz jest nieprawidłowy', this.jewelryForm.errors);
      return;
    }

    this.isSubmitting = true;
    const formData = this.jewelryForm.value as Jewelry;

    this.jewelryService.addJewelry(formData, this.selectedFile || undefined)
      .then((result) => {
        console.log('Przedmiot dodany pomyślnie', result);
        this.loadJewelry();
        this.resetForm(); // Wyczyść formularz ale zostań na zakładce
        alert('Produkt został dodany pomyślnie! Możesz dodać kolejny.');
      })
      .catch(error => {
        console.error('Błąd podczas dodawania:', error);
        alert('Wystąpił błąd podczas dodawania przedmiotu: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
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

  // Nowa metoda do kompletnego resetowania formularza
  resetForm(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null; // Resetowanie podglądu obrazka
    this.editItemId = null;
    this.jewelryForm.reset();

    // Ustaw domyślne wartości
    this.jewelryForm.patchValue({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: '',
      sex: [SexEnum.FEMALE], // Domyślnie "Damska"
      inStock: true
    });

    // Przywróć walidację pola URL
    this.jewelryForm.get('imageUrl')?.setValidators([Validators.required]);
    this.jewelryForm.get('imageUrl')?.updateValueAndValidity();

    // Oznacz formularz jako nietknięty
    this.jewelryForm.markAsUntouched();
    this.jewelryForm.markAsPristine();

    // Wyczyść wszystkie błędy walidacji
    Object.keys(this.jewelryForm.controls).forEach(key => {
      const control = this.jewelryForm.get(key);
      control?.setErrors(null);
    });
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

  // Metoda do obsługi zmian w checkboxach płci
  onSexChange(sexValue: SexEnum, checked: boolean): void {
    const currentSex = this.jewelryForm.get('sex')?.value || [];

    if (checked) {
      // Dodaj płeć do listy, jeśli nie jest już tam
      if (!currentSex.includes(sexValue)) {
        this.jewelryForm.patchValue({
          sex: [...currentSex, sexValue]
        });
      }
    } else {
      // Usuń płeć z listy
      const updatedSex = currentSex.filter((sex: SexEnum) => sex !== sexValue);
      this.jewelryForm.patchValue({
        sex: updatedSex
      });
    }
  }

  // Poprawiona metoda editItem z przełączaniem zakładek
  editItem(item: Jewelry): void {
    this.selectedTabIndex = 1; // Przełącz na zakładkę formularza
    this.editItemId = item.id || null;
    this.initForm(item);

    // Ustaw podgląd istniejącego obrazka
    if (item.imageUrl) {
      this.imagePreviewUrl = item.imageUrl;
    }
  }

  // Poprawiona metoda cancelEdit
  cancelEdit(): void {
    this.selectedTabIndex = 0; // Wróć do listy
    this.editItemId = null;
    this.selectedFile = null;
    this.imagePreviewUrl = null; // Czyszczenie podglądu
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
