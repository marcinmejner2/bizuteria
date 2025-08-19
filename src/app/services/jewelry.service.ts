import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
    private storage: AngularFireStorage
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

  // Metoda do przesyłania obrazków do Firebase Storage
  uploadImage(file: File): Observable<string> {
    const filePath = `jewelry/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return from(task).pipe(
      switchMap(() => fileRef.getDownloadURL())
    );
  }

  // Metoda do konwersji obrazka na Base64
  readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  addJewelry(jewelry: Jewelry, imageFile?: File): Promise<any> {
    console.log('JewelryService.addJewelry wywołana z danymi:', jewelry);
    try {
      // Ustawiamy datę utworzenia
      const now = new Date();
      jewelry.createdAt = now;

      // Jeśli mamy plik obrazka, najpierw go prześlemy
      if (imageFile) {
        return this.readFileAsBase64(imageFile)
          .then(base64Image => {
            // Tworzymy kopię danych z obrazkiem w Base64
            const jewelryToSave = {
              name: jewelry.name,
              description: jewelry.description,
              price: jewelry.price,
              imageUrl: base64Image, // Zapisujemy obraz jako Base64
              category: jewelry.category,
              inStock: jewelry.inStock,
              createdAt: now
            };

            console.log('Dane do zapisania w Firestore (z obrazem Base64):',
              { ...jewelryToSave, imageUrl: base64Image.substring(0, 30) + '...' });

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
