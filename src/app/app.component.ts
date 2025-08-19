import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'jewelry-showcase';
  isLoggedIn$: Observable<boolean>;

  constructor(public authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    // Subskrybuj isLoggedIn$ tylko raz, aby sprawdzić stan logowania
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log('Użytkownik zalogowany:', isLoggedIn);
    });
  }

  logout() {
    this.authService.logout();
  }
}
