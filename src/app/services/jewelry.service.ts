import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, switchMap, finalize } from 'rxjs/operators';
import { Jewelry } from '../models/jewelry';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class JewelryService {
  private jewelryCollection: AngularFirestoreCollection<Jewelry>;
  jewelry: Observable<Jewelry[]>;

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private http: HttpClient
  ) {
    this.jewelryCollection = this.firestore.collection<Jewelry>('jewelry');

    this.jewelry = this.jewelryCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Jewelry;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getAllJewelry(): Observable<Jewelry[]> {
    return this.jewelry;
  }

  getJewelryByCategory(category: string): Observable<Jewelry[]> {
    return this.firestore.collection<Jewelry>('jewelry',
      ref => ref.where('category', '==', category))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Jewelry;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getJewelryById(id: string): Observable<Jewelry> {
    return this.jewelryCollection.doc<Jewelry>(id).valueChanges().pipe(
      map(jewelry => {
        return { id, ...jewelry } as Jewelry;
      })
    );
  }

  // Metoda konwersji do Base64 - niezawodna i szybka
  uploadImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('Obrazek przekonwertowany do Base64');
        resolve(base64String);
      };
      reader.onerror = () => {
        reject('Błąd podczas konwersji obrazka');
      };
      reader.readAsDataURL(file);
    });
  }


  // Metoda do uploadu obrazka do Firebase Storage (bez wewnętrznego fallbacku)
  uploadImageToFirebaseStorage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Tworzymy unikalną nazwę pliku
        const fileName = `jewelry_images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storageRef = this.storage.ref(fileName);

        console.log('Rozpoczynam upload do Firebase Storage:', fileName);

        const uploadTask = storageRef.put(file, {
          contentType: file.type || 'image/jpeg',
          customMetadata: {
            'uploaded': new Date().toISOString()
          }
        });

        uploadTask.then((snapshot) => {
          console.log('Upload zakończony pomyślnie');
          return snapshot.ref.getDownloadURL();
        }).then((downloadURL) => {
          console.log('Otrzymano URL do pobrania:', downloadURL);
          resolve(downloadURL);
        }).catch((error) => {
          console.error('Błąd CORS w Firebase Storage:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Błąd podczas inicjalizacji uploadu:', error);
        reject(error);
      }
    });
  }

  // Metoda do uploadu obrazka do Imgur (darmowy hosting obrazów)
  uploadImageToImgur(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Rozpoczynam upload do Imgur:', file.name);

      const formData = new FormData();
      formData.append('image', file);

      // Upload do Imgur - nie wymaga rejestracji, używa publicznego klucza
      this.http.post('https://api.imgur.com/3/image', formData, {
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7' // Publiczny klucz Imgur
        }
      }).subscribe({
        next: (response: any) => {
          if (response && response.success && response.data && response.data.link) {
            const imageUrl = response.data.link;
            console.log('Obrazek przesłany do Imgur:', imageUrl);
            resolve(imageUrl);
          } else {
            console.error('Błąd uploadu do Imgur:', response);
            reject('Błąd uploadu do Imgur');
          }
        },
        error: (error) => {
          console.error('Błąd podczas uploadu do Imgur:', error);
          reject(error);
        }
      });
    });
  }

  // Metoda do uploadu obrazka do ImageBB (alternatywa dla Imgur)
  uploadImageToImageBB(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Rozpoczynam upload do ImageBB:', file.name);

      const formData = new FormData();
      formData.append('image', file);

      // Upload do ImageBB - darmowy serwis, nie wymaga rejestracji
      this.http.post('https://api.imgbb.com/1/upload?key=0123456789abcdef0123456789abcdef01234567', formData)
        .subscribe({
          next: (response: any) => {
            if (response && response.success && response.data && response.data.url) {
              const imageUrl = response.data.url;
              console.log('Obrazek przesłany do ImageBB:', imageUrl);
              resolve(imageUrl);
            } else {
              console.error('Błąd uploadu do ImageBB:', response);
              reject('Błąd uploadu do ImageBB');
            }
          },
          error: (error) => {
            console.error('Błąd podczas uploadu do ImageBB:', error);
            reject(error);
          }
        });
    });
  }

  // Metoda do uploadu obrazka do PostImage (alternatywa)
  uploadImageToPostImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Rozpoczynam upload do PostImage:', file.name);

      const formData = new FormData();
      formData.append('upload', file);
      formData.append('optsize', '0');
      formData.append('expire', '0');

      // Upload do PostImage - darmowy serwis
      this.http.post('https://postimg.cc/json', formData)
        .subscribe({
          next: (response: any) => {
            if (response && response.status === 'OK' && response.url) {
              console.log('Obrazek przesłany do PostImage:', response.url);
              resolve(response.url);
            } else {
              console.error('Błąd uploadu do PostImage:', response);
              reject('Błąd uploadu do PostImage');
            }
          },
          error: (error) => {
            console.error('Błąd podczas uploadu do PostImage:', error);
            reject(error);
          }
        });
    });
  }

  // Metoda do uploadu obrazka do Freeimage.host
  uploadImageToFreeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Rozpoczynam upload do FreeImage:', file.name);

      const formData = new FormData();
      formData.append('source', file);
      formData.append('type', 'file');
      formData.append('action', 'upload');

      // Upload do FreeImage.host - darmowy serwis
      this.http.post('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', formData)
        .subscribe({
          next: (response: any) => {
            if (response && response.success && response.image && response.image.url) {
              console.log('Obrazek przesłany do FreeImage:', response.image.url);
              resolve(response.image.url);
            } else {
              console.error('Błąd uploadu do FreeImage:', response);
              reject('Błąd uploadu do FreeImage');
            }
          },
          error: (error) => {
            console.error('Błąd podczas uploadu do FreeImage:', error);
            reject(error);
          }
        });
    });
  }

  // Główna metoda uploadu z multiple fallbacks - bez Google Drive
  uploadImage(file: File): Promise<string> {
    console.log('Rozpoczynam upload obrazka:', file.name);

    // Próbujemy kolejno różne serwisy - bez Google Drive
    return this.uploadImageToFreeImage(file)
      .catch(() => {
        console.log('FreeImage nie działa, próbuję PostImage...');
        return this.uploadImageToPostImage(file);
      })
      .catch(() => {
        console.log('PostImage nie działa, próbuję ImageBB...');
        return this.uploadImageToImageBB(file);
      })
      .catch(() => {
        console.log('ImageBB nie działa, próbuję Imgur...');
        return this.uploadImageToImgur(file);
      })
      .catch(() => {
        console.log('Wszystkie zewnętrzne serwisy nie działają, używam Firebase Storage...');
        return this.uploadImageToFirebaseStorage(file);
      })
      .catch(() => {
        console.log('Firebase Storage też nie działa, ostatecznie używam Base64...');
        return this.uploadImageToBase64(file);
      });
  }

  addJewelry(jewelry: Jewelry, imageFile?: File): Promise<any> {
    console.log('JewelryService.addJewelry wywołana z danymi:', jewelry);
    try {
      // Ustawiamy datę utworzenia
      const now = new Date();
      jewelry.createdAt = now;

      // Jeśli mamy plik obrazka, najpierw go prześlemy przez główną metodę uploadu
      if (imageFile) {
        return this.uploadImage(imageFile)
          .then(imageUrl => {
            // Tworzymy kopię danych z URL obrazka (Base64 lub Firebase Storage)
            const jewelryToSave = {
              name: jewelry.name,
              description: jewelry.description,
              price: jewelry.price,
              imageUrl: imageUrl, // Zapisujemy Base64 lub URL z Firebase Storage
              category: jewelry.category,
              inStock: jewelry.inStock,
              createdAt: now
            };

            console.log('Dane do zapisania w Firestore:', jewelryToSave);

            return this.jewelryCollection.add(jewelryToSave);
          })
          .then(docRef => {
            console.log('Dokument dodany z ID:', docRef.id);
            return docRef;
          })
          .catch(error => {
            console.error('Błąd podczas dodawania do Firestore:', error);
            throw error;
          });
      } else {
        // Jeśli nie mamy pliku obrazka, używamy podanego URL
        const jewelryToSave = {
          name: jewelry.name,
          description: jewelry.description,
          price: jewelry.price,
          imageUrl: jewelry.imageUrl,
          category: jewelry.category,
          inStock: jewelry.inStock,
          createdAt: now
        };

        console.log('Dane do zapisania w Firestore:', jewelryToSave);
        return this.jewelryCollection.add(jewelryToSave)
          .then(docRef => {
            console.log('Dokument dodany z ID:', docRef.id);
            return docRef;
          })
          .catch(error => {
            console.error('Błąd podczas dodawania do Firestore:', error);
            throw error;
          });
      }
    } catch (error) {
      console.error('Wystąpił błąd w metodzie addJewelry:', error);
      return Promise.reject(error);
    }
  }

  updateJewelry(id: string, jewelry: Partial<Jewelry>): Promise<void> {
    return this.jewelryCollection.doc(id).update(jewelry);
  }

  deleteJewelry(id: string): Promise<void> {
    return this.jewelryCollection.doc(id).delete();
  }
}
