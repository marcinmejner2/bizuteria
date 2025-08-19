import firebase from 'firebase/compat/app';

export interface Jewelry {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string; // np. 'necklace', 'bracelet', 'ring', 'earrings'
  inStock: boolean;
  createdAt: Date | firebase.firestore.Timestamp | any; // Obsługuje zarówno Date jak i Timestamp
}
