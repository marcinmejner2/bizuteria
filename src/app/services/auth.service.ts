import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;
  isAdmin: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState;

    // Sprawdzamy, czy zalogowany użytkownik jest administratorem
    this.user$.subscribe(user => {
      this.isAdmin = !!user; // Na potrzeby tej aplikacji, każdy zalogowany użytkownik jest administratorem
    });
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/admin']);
      return result;
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.router.navigate(['/']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  // Funkcja zabezpieczająca ścieżki administracyjne
  canAccess(): Observable<boolean> {
    return this.isLoggedIn();
  }
}
